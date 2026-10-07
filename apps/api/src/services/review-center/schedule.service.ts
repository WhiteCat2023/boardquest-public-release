import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import { evaluateScheduleStatus } from "../admin/calendar.service";
import { createNotification } from "../admin/notification.service";

export interface CreateReviewScheduleDTO {
  title: string;
  startDate: string;
  endDate: string;
  category?: string;
  description?: string;
  companyName: string;
  reviewCenterId?: string;
  schoolYear?: string;
}

export interface UpdateReviewScheduleDTO {
  title?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  description?: string;
  status?: string;
  schoolYear?: string;
}

export function inferSchoolYearFromDate(date: Date | string | null | undefined): string {
  if (!date) return "2026-2027";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "2026-2027";
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  // June onwards belongs to year-(year+1); Jan-May belongs to (year-1)-year
  return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function extractSchoolYearFromSchedule(item: any): string {
  if (item.description) {
    const match = item.description.match(/\[SY:(\d{4}-\d{4})\]/);
    if (match && match[1]) return match[1];
  }
  return inferSchoolYearFromDate(item.startDate || item.createdAt);
}

export function cleanScheduleDescription(rawDesc?: string | null): string {
  if (!rawDesc) return "";
  return rawDesc.replace(/\[SY:\d{4}-\d{4}\]\s*/g, "").trim();
}

function mapToSchedule(item: any) {
  const schoolYear = extractSchoolYearFromSchedule(item);
  const description = cleanScheduleDescription(item.description);

  return {
    id: item.id,
    title: item.title,
    companyName: item.companyName || "Review Center Partner",
    category: item.category || "Board Review",
    startDate: item.startDate
      ? new Date(item.startDate).toISOString().split("T")[0]
      : "2026-07-01",
    endDate: item.endDate
      ? new Date(item.endDate).toISOString().split("T")[0]
      : "2026-07-15",
    status: evaluateScheduleStatus(item.startDate, item.endDate),
    description,
    schoolYear,
    reviewCenterId: item.reviewCenterId || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Get review schedules scoped STRICTLY to the current review center representative
 */
export async function getReviewCenterSchedules(
  companyName?: string,
  reviewCenterId?: string,
  schoolYear?: string,
) {
  const whereConditions: any[] = [];
  
  if (reviewCenterId) {
    whereConditions.push({ reviewCenterId });
  }
  
  if (companyName && companyName.trim()) {
    whereConditions.push({
      companyName: { equals: companyName.trim(), mode: "insensitive" },
    });
  }

  // If no review center identification exists, strictly return empty list
  if (whereConditions.length === 0) {
    return [];
  }

  const list = await prisma.reviewCenterProgram.findMany({
    where: {
      OR: whereConditions,
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = list.map(mapToSchedule);

  if (schoolYear && schoolYear.trim() && schoolYear.toUpperCase() !== "ALL") {
    const targetSy = schoolYear.trim();
    return mapped.filter((s) => s.schoolYear === targetSy);
  }

  return mapped;
}

/**
 * Create a review schedule strictly tied to the current representative's review center
 */
export async function createReviewCenterSchedule(data: CreateReviewScheduleDTO) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(data.startDate);
  start.setHours(0, 0, 0, 0);
  if (start < today) {
    throw new ApiError(400, "Review schedule start date cannot be set in the past.");
  }

  const end = new Date(data.endDate);
  end.setHours(0, 0, 0, 0);
  if (end < start) {
    throw new ApiError(400, "End date cannot be earlier than start date.");
  }

  let finalReviewCenterId = data.reviewCenterId;

  // Auto-link reviewCenterId if company name matches an existing ReviewCenter
  if (!finalReviewCenterId && data.companyName) {
    const rc = await prisma.reviewCenter.findFirst({
      where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (rc) {
      finalReviewCenterId = rc.id;
    }
  }

  const schoolYear = data.schoolYear || inferSchoolYearFromDate(data.startDate);
  const cleanDesc = cleanScheduleDescription(data.description);
  const finalDescription = `[SY:${schoolYear}] ${cleanDesc}`.trim();

  const created = await prisma.reviewCenterProgram.create({
    data: {
      title: data.title,
      companyName: data.companyName || "Review Center Partner",
      reviewCenterId: finalReviewCenterId || null,
      category: data.category || "Board Review",
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: evaluateScheduleStatus(data.startDate, data.endDate),
      description: finalDescription,
    },
  });

  createNotification({
    recipientRole: "REVIEW_CENTER_REPRESENTATIVE",
    recipientId: finalReviewCenterId || undefined,
    title: "Evaluation Schedule Added",
    message: `"${data.title}" scheduled for ${new Date(data.startDate).toLocaleDateString()}.`,
    type: "INFO",
    link: "/schedules",
    metadata: {
      reviewCenterId: finalReviewCenterId,
      companyName: data.companyName,
      scheduleId: created.id,
    },
  }).catch((err) => console.warn("Schedule notification error:", err?.message));

  return mapToSchedule(created);
}

/**
 * Update a review schedule with strict ownership verification
 */
export async function updateReviewCenterSchedule(
  id: string,
  data: UpdateReviewScheduleDTO,
  companyName?: string,
  reviewCenterId?: string,
) {
  const existing = await prisma.reviewCenterProgram.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Review schedule not found");
  }

  // Strictly enforce ownership check
  const isOwner =
    (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
    (companyName &&
      existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());

  if (!isOwner) {
    throw new ApiError(
      403,
      "Access denied: You can only modify schedules belonging to your review center."
    );
  }

  const newStartDate = data.startDate ? new Date(data.startDate) : existing.startDate;
  const newEndDate = data.endDate ? new Date(data.endDate) : existing.endDate;
  const status = evaluateScheduleStatus(newStartDate, newEndDate);

  let finalDescription: string | undefined = undefined;
  if (data.schoolYear || data.description !== undefined) {
    const currentSchoolYear = data.schoolYear || extractSchoolYearFromSchedule(existing);
    const cleanDesc = cleanScheduleDescription(data.description !== undefined ? data.description : existing.description);
    finalDescription = `[SY:${currentSchoolYear}] ${cleanDesc}`.trim();
  }

  const updated = await prisma.reviewCenterProgram.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.category && { category: data.category }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      status,
      ...(finalDescription !== undefined && { description: finalDescription }),
    },
  });
  return mapToSchedule(updated);
}

/**
 * Delete a review schedule with strict ownership verification
 */
export async function deleteReviewCenterSchedule(
  id: string,
  companyName?: string,
  reviewCenterId?: string,
) {
  const existing = await prisma.reviewCenterProgram.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Review schedule not found");
  }

  // Strictly enforce ownership check
  const isOwner =
    (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
    (companyName &&
      existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());

  if (!isOwner) {
    throw new ApiError(
      403,
      "Access denied: You can only delete schedules belonging to your review center."
    );
  }

  await prisma.reviewCenterProgram.delete({
    where: { id },
  });
  return true;
}
