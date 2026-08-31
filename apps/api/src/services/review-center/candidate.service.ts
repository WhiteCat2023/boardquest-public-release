import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";

export interface EnrollCandidateDTO {
  name: string;
  email: string;
  schoolId?: string;
  schoolYear: string;
  batch?: string;
  status?: string;
  companyName: string;
  reviewCenterId?: string;
}

export interface UpdateCandidateDTO {
  name?: string;
  email?: string;
  schoolId?: string;
  schoolYear?: string;
  batch?: string;
  status?: string;
}

export interface CandidateFilters {
  search?: string;
  schoolYear?: string;
  batch?: string;
  status?: string;
}

export interface BulkEnrollItemDTO {
  name: string;
  email: string;
  schoolId?: string;
  batch?: string;
}

export interface BulkEnrollDTO {
  schoolYear: string;
  batch?: string;
  companyName: string;
  reviewCenterId?: string;
  students: BulkEnrollItemDTO[];
}

function mapToCandidate(item: any, userMap?: Map<string, any>) {
  const email = item.email || "";
  const studentInfo = email && userMap ? userMap.get(email.toLowerCase()) : null;

  return {
    id: item.id,
    name: item.name,
    email: email,
    schoolId: item.schoolId || "",
    schoolYear: item.schoolYear || "2026-2027",
    batch: item.batch || item.schoolYear || "Batch 1",
    status: item.status || "ENROLLED",
    companyName: item.companyName,
    reviewCenterId: item.reviewCenterId || null,
    studentId: item.studentId || studentInfo?.id || null,
    studentDetails: studentInfo
      ? {
          level: studentInfo.level || 1,
          xp: studentInfo.xp || 0,
          streak: studentInfo.streak || 0,
          verified: studentInfo.verified || false,
        }
      : null,
    enrolledAt: item.enrolledAt || item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const dbSchoolYear = (prisma as any).reviewCenterSchoolYear;

export async function getReviewCenterSchoolYears(
  companyName?: string,
  reviewCenterId?: string,
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

  if (whereConditions.length === 0) {
    return [];
  }

  const [dbSchoolYears, candidateSchoolYears] = await Promise.all([
    dbSchoolYear
      ? dbSchoolYear.findMany({
          where: { OR: whereConditions },
          orderBy: { createdAt: "desc" },
        })
      : [],
    prisma.reviewCenterCandidate.findMany({
      where: { OR: whereConditions },
      select: { schoolYear: true },
    }),
  ]);

  const existingYearsSet = new Set<string>();
  const results: { id: string; schoolYear: string; isCurrent: boolean; createdAt: Date }[] = [];

  for (const sy of dbSchoolYears) {
    const name = sy.schoolYear?.trim();
    if (name && !existingYearsSet.has(name)) {
      existingYearsSet.add(name);
      results.push({
        id: sy.id,
        schoolYear: name,
        isCurrent: sy.isCurrent,
        createdAt: sy.createdAt,
      });
    }
  }

  for (const c of candidateSchoolYears) {
    const syName = c.schoolYear?.trim();
    if (syName && !existingYearsSet.has(syName)) {
      existingYearsSet.add(syName);
      results.push({
        id: syName,
        schoolYear: syName,
        isCurrent: false,
        createdAt: new Date(),
      });
    }
  }

  return results.sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));
}

export function normalizeSchoolYearString(sy: string): string {
  const clean = sy.trim().replace(/^s\.?y\.?\s*/i, "");
  const digits = clean.replace(/\D/g, "");
  if (digits.length === 4) {
    const start = parseInt(digits, 10);
    if (!isNaN(start) && start >= 1900 && start <= 2100) {
      return `${start}-${start + 1}`;
    }
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return clean;
}

export async function createReviewCenterSchoolYear(
  companyName: string,
  schoolYear: string,
  reviewCenterId?: string,
) {
  const cleanSY = normalizeSchoolYearString(schoolYear);
  if (!cleanSY) {
    throw new ApiError(400, "School Year is required.");
  }
  if (!/^\d{4}-\d{4}$/.test(cleanSY)) {
    throw new ApiError(400, "Invalid School Year format. Please use YYYY-YYYY format (e.g. 2026-2027).");
  }

  let finalReviewCenterId = reviewCenterId;
  if (!finalReviewCenterId && companyName) {
    const rc = await prisma.reviewCenter.findFirst({
      where: { name: { equals: companyName.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (rc) {
      finalReviewCenterId = rc.id;
    }
  }

  if (dbSchoolYear) {
    const existing = await dbSchoolYear.findFirst({
      where: {
        schoolYear: { equals: cleanSY, mode: "insensitive" },
        companyName: { equals: companyName.trim(), mode: "insensitive" },
      },
    });

    if (existing) {
      return {
        id: existing.id,
        schoolYear: existing.schoolYear,
        createdAt: existing.createdAt,
      };
    }

    const created = await dbSchoolYear.create({
      data: {
        schoolYear: cleanSY,
        companyName: companyName.trim(),
        reviewCenterId: finalReviewCenterId || null,
        status: "ACTIVE",
      },
    });

    return {
      id: created.id,
      schoolYear: created.schoolYear,
      createdAt: created.createdAt,
    };
  }

  return {
    id: cleanSY,
    schoolYear: cleanSY,
    createdAt: new Date(),
  };
}

export async function deleteReviewCenterSchoolYear(
  schoolYear: string,
  companyName: string,
  reviewCenterId?: string,
) {
  const cleanSY = schoolYear.trim().replace(/^s\.?y\.?\s*/i, "");
  const whereConditions: any[] = [];
  if (reviewCenterId) {
    whereConditions.push({ reviewCenterId });
  }
  if (companyName && companyName.trim()) {
    whereConditions.push({
      companyName: { equals: companyName.trim(), mode: "insensitive" },
    });
  }

  if (dbSchoolYear) {
    await dbSchoolYear.deleteMany({
      where: {
        schoolYear: { equals: cleanSY, mode: "insensitive" },
        OR: whereConditions,
      },
    });
  }

  return true;
}

export async function getReviewCenterCandidates(
  companyName?: string,
  reviewCenterId?: string,
  filters: CandidateFilters = {},
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

  if (whereConditions.length === 0) {
    return {
      candidates: [],
      schoolYears: [],
      batches: [],
      total: 0,
    };
  }

  const baseWhere: any = {
    AND: [{ OR: whereConditions }],
  };

  if (filters.status && filters.status !== "ALL") {
    baseWhere.status = filters.status;
  }

  const [rawCandidates, allSYRecords] = await Promise.all([
    prisma.reviewCenterCandidate.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
    }),
    getReviewCenterSchoolYears(companyName, reviewCenterId),
  ]);

  // Extract all emails to batch query User table for level/xp
  const allEmails = rawCandidates.map((c) => c.email.toLowerCase()).filter(Boolean);

  let userMap = new Map<string, any>();
  if (allEmails.length > 0) {
    const users = await prisma.user.findMany({
      where: { email: { in: allEmails } },
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        streak: true,
        verified: true,
      },
    });
    users.forEach((u) => userMap.set(u.email.toLowerCase(), u));
  }

  let candidates = rawCandidates.map((c) => mapToCandidate(c, userMap));

  // In-memory filter for schoolYear, batch, search
  if (filters.schoolYear && filters.schoolYear !== "ALL") {
    candidates = candidates.filter(
      (c) => c.schoolYear.toLowerCase() === filters.schoolYear?.toLowerCase(),
    );
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    candidates = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.schoolId && c.schoolId.toLowerCase().includes(term)),
    );
  }

  const schoolYears = allSYRecords.map((s) => s.schoolYear);

  return {
    candidates,
    schoolYears,
    batches: [],
    total: candidates.length,
  };
}

export async function enrollCandidate(data: EnrollCandidateDTO) {
  if (!data.name?.trim() || !data.email?.trim()) {
    throw new ApiError(400, "Student name and valid email are required.");
  }
  if (!data.schoolYear?.trim()) {
    throw new ApiError(400, "School Year is required.");
  }

  let finalReviewCenterId = data.reviewCenterId;
  if (!finalReviewCenterId && data.companyName) {
    const rc = await prisma.reviewCenter.findFirst({
      where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (rc) {
      finalReviewCenterId = rc.id;
    }
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanSY = normalizeSchoolYearString(data.schoolYear);

  // Ensure School Year is saved in ReviewCenterSchoolYear
  await createReviewCenterSchoolYear(
    data.companyName,
    cleanSY,
    finalReviewCenterId,
  );

  // Check if candidate already enrolled in this school year in ReviewCenterCandidate
  const existingCandidate = await prisma.reviewCenterCandidate.findFirst({
    where: {
      email: { equals: cleanEmail, mode: "insensitive" },
      schoolYear: { equals: cleanSY, mode: "insensitive" },
      companyName: { equals: data.companyName.trim(), mode: "insensitive" },
    },
  });

  if (existingCandidate) {
    throw new ApiError(
      400,
      `Student with email "${data.email}" is already enrolled in School Year ${data.schoolYear}.`,
    );
  }

  // Auto-link registered user
  let studentId: string | null = null;
  const registeredUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true },
  });
  if (registeredUser) {
    studentId = registeredUser.id;
  }

  const created = await prisma.reviewCenterCandidate.create({
    data: {
      name: data.name.trim(),
      email: cleanEmail,
      schoolId: data.schoolId?.trim() || null,
      schoolYear: cleanSY,
      batch: data.batch?.trim() || cleanSY,
      status: data.status || "ENROLLED",
      companyName: data.companyName.trim(),
      reviewCenterId: finalReviewCenterId || null,
      studentId,
    },
  });

  return mapToCandidate(created);
}

export async function bulkEnrollCandidates(data: BulkEnrollDTO) {
  if (!data.schoolYear?.trim()) {
    throw new ApiError(400, "School Year is required.");
  }
  if (!Array.isArray(data.students) || data.students.length === 0) {
    throw new ApiError(400, "Please provide at least one student to enroll.");
  }

  let finalReviewCenterId = data.reviewCenterId;
  if (!finalReviewCenterId && data.companyName) {
    const rc = await prisma.reviewCenter.findFirst({
      where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
      select: { id: true },
    });
    if (rc) {
      finalReviewCenterId = rc.id;
    }
  }

  const cleanSY = normalizeSchoolYearString(data.schoolYear);

  // Ensure School Year exists in ReviewCenterSchoolYear
  await createReviewCenterSchoolYear(
    data.companyName,
    cleanSY,
    finalReviewCenterId,
  );

  const existingCandidates = await prisma.reviewCenterCandidate.findMany({
    where: {
      schoolYear: { equals: cleanSY, mode: "insensitive" },
      companyName: { equals: data.companyName.trim(), mode: "insensitive" },
    },
    select: { email: true },
  });

  const existingEmailsSet = new Set(
    existingCandidates.map((c) => c.email.toLowerCase()),
  );

  let enrolledCount = 0;
  let skippedCount = 0;
  const createdList: any[] = [];

  for (const item of data.students) {
    if (!item.name?.trim() || !item.email?.trim() || !item.email.includes("@")) {
      skippedCount++;
      continue;
    }

    const itemEmail = item.email.trim().toLowerCase();

    if (existingEmailsSet.has(itemEmail)) {
      skippedCount++;
      continue;
    }

    let studentId: string | null = null;
    const registeredUser = await prisma.user.findUnique({
      where: { email: itemEmail },
      select: { id: true },
    });
    if (registeredUser) {
      studentId = registeredUser.id;
    }

    const created = await prisma.reviewCenterCandidate.create({
      data: {
        name: item.name.trim(),
        email: itemEmail,
        schoolId: item.schoolId?.trim() || null,
        schoolYear: cleanSY,
        batch: item.batch?.trim() || data.batch?.trim() || cleanSY,
        status: "ENROLLED",
        companyName: data.companyName.trim(),
        reviewCenterId: finalReviewCenterId || null,
        studentId,
      },
    });

    existingEmailsSet.add(itemEmail);
    createdList.push(mapToCandidate(created));
    enrolledCount++;
  }

  return {
    enrolledCount,
    skippedCount,
    totalSubmitted: data.students.length,
    enrolled: createdList,
  };
}

export async function updateCandidate(
  id: string,
  data: UpdateCandidateDTO,
  companyName?: string,
  reviewCenterId?: string,
) {
  const existing = await prisma.reviewCenterCandidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Student record not found");
  }

  const isOwner =
    (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
    (companyName &&
      existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());

  if (!isOwner) {
    throw new ApiError(
      403,
      "Access denied: You can only edit students enrolled in your review center.",
    );
  }

  const cleanSY = data.schoolYear ? normalizeSchoolYearString(data.schoolYear) : undefined;
  if (cleanSY && (companyName || existing.companyName)) {
    await createReviewCenterSchoolYear(
      companyName || existing.companyName,
      cleanSY,
      reviewCenterId || existing.reviewCenterId || undefined,
    );
  }

  const updated = await prisma.reviewCenterCandidate.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.email && { email: data.email.trim().toLowerCase() }),
      ...(data.schoolId !== undefined && { schoolId: data.schoolId.trim() || null }),
      ...(cleanSY && { schoolYear: cleanSY }),
      ...(data.batch && { batch: data.batch.trim() }),
      ...(data.status && { status: data.status }),
    },
  });

  return mapToCandidate(updated);
}

export async function deleteCandidate(
  id: string,
  companyName?: string,
  reviewCenterId?: string,
) {
  const existing = await prisma.reviewCenterCandidate.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Student record not found");
  }

  const isOwner =
    (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
    (companyName &&
      existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());

  if (!isOwner) {
    throw new ApiError(
      403,
      "Access denied: You can only remove students enrolled in your review center.",
    );
  }

  await prisma.reviewCenterCandidate.delete({
    where: { id },
  });

  return true;
}
