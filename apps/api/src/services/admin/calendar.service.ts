import prisma from "../prisma";

export interface CreateReviewScheduleInput {
  title: string;
  companyName: string;
  reviewCenterId?: string;
  startDate: string;
  endDate: string;
  category?: string;
  status?: string;
  description?: string;
}

export interface UpdateReviewScheduleInput {
  title?: string;
  companyName?: string;
  reviewCenterId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  description?: string;
}

function mapProgramToSchedule(item: any) {
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
    status: item.status || "ACTIVE",
    description: item.description || "",
    createdAt: item.createdAt,
  };
}

export async function getAllReviewSchedules() {
  const list = await prisma.reviewCenterProgram.findMany({
    orderBy: { createdAt: "desc" },
  });

  return list.map(mapProgramToSchedule);
}

export async function getReviewScheduleById(id: string) {
  const item = await prisma.reviewCenterProgram.findUnique({
    where: { id },
  });
  if (!item) return null;
  return mapProgramToSchedule(item);
}

export async function createReviewSchedule(data: CreateReviewScheduleInput) {
  const created = await prisma.reviewCenterProgram.create({
    data: {
      title: data.title,
      companyName: data.companyName || "Review Center Partner",
      category: data.category || "Board Review",
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(),
      status: data.status || "UPCOMING",
      description: data.description || "",
    },
  });
  return mapProgramToSchedule(created);
}

export async function updateReviewSchedule(id: string, data: UpdateReviewScheduleInput) {
  const updated = await prisma.reviewCenterProgram.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.category && { category: data.category }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.status && { status: data.status }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
  return mapProgramToSchedule(updated);
}

export async function deleteReviewSchedule(id: string) {
  await prisma.reviewCenterProgram.delete({
    where: { id },
  });
  return true;
}
