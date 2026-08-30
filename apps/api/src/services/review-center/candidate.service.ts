import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";

export interface EnrollCandidateDTO {
  name: string;
  email: string;
  schoolId?: string;
  schoolYear: string;
  batch: string;
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
  batch: string;
  companyName: string;
  reviewCenterId?: string;
  students: BulkEnrollItemDTO[];
}

function parseCandidateItem(item: any, userMap?: Map<string, any>) {
  let meta: any = {};
  if (item.description) {
    try {
      meta = JSON.parse(item.description);
    } catch {
      meta = {};
    }
  }

  const email = meta.email || "";
  const studentInfo = email && userMap ? userMap.get(email.toLowerCase()) : null;

  return {
    id: item.id,
    name: item.title,
    email: email,
    schoolId: meta.schoolId || "",
    schoolYear: meta.schoolYear || "2026-2027",
    batch: meta.batch || "Batch 1",
    status: item.status || "ENROLLED",
    companyName: item.companyName,
    reviewCenterId: item.reviewCenterId || null,
    studentId: meta.studentId || studentInfo?.id || null,
    studentDetails: studentInfo
      ? {
          level: studentInfo.level || 1,
          xp: studentInfo.xp || 0,
          streak: studentInfo.streak || 0,
          verified: studentInfo.verified || false,
        }
      : null,
    enrolledAt: item.createdAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

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

  const [dbSchoolYearPrograms, candidatePrograms] = await Promise.all([
    prisma.reviewCenterProgram.findMany({
      where: {
        category: "SCHOOL_YEAR",
        OR: whereConditions,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reviewCenterProgram.findMany({
      where: {
        category: "STUDENT_ENROLLMENT",
        OR: whereConditions,
      },
      select: { description: true },
    }),
  ]);

  const existingYearsSet = new Set<string>();
  const results: { id: string; schoolYear: string; isCurrent: boolean; createdAt: Date }[] = [];

  for (const sy of dbSchoolYearPrograms) {
    if (sy.title && !existingYearsSet.has(sy.title.trim())) {
      existingYearsSet.add(sy.title.trim());
      results.push({
        id: sy.id,
        schoolYear: sy.title.trim(),
        isCurrent: false,
        createdAt: sy.createdAt,
      });
    }
  }

  for (const c of candidatePrograms) {
    if (c.description) {
      try {
        const meta = JSON.parse(c.description);
        const syName = meta.schoolYear?.trim();
        if (syName && !existingYearsSet.has(syName)) {
          existingYearsSet.add(syName);
          results.push({
            id: syName,
            schoolYear: syName,
            isCurrent: false,
            createdAt: new Date(),
          });
        }
      } catch {}
    }
  }

  return results.sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));
}

export async function createReviewCenterSchoolYear(
  companyName: string,
  schoolYear: string,
  reviewCenterId?: string,
) {
  const cleanSY = schoolYear.trim().replace(/^s\.?y\.?\s*/i, "");
  if (!cleanSY) {
    throw new ApiError(400, "School Year is required.");
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

  const existing = await prisma.reviewCenterProgram.findFirst({
    where: {
      category: "SCHOOL_YEAR",
      title: { equals: cleanSY, mode: "insensitive" },
      companyName: { equals: companyName.trim(), mode: "insensitive" },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      schoolYear: existing.title,
      createdAt: existing.createdAt,
    };
  }

  const created = await prisma.reviewCenterProgram.create({
    data: {
      title: cleanSY,
      category: "SCHOOL_YEAR",
      companyName: companyName.trim(),
      reviewCenterId: finalReviewCenterId || null,
      status: "ACTIVE",
    },
  });

  return {
    id: created.id,
    schoolYear: created.title,
    createdAt: created.createdAt,
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

  await prisma.reviewCenterProgram.deleteMany({
    where: {
      category: "SCHOOL_YEAR",
      title: { equals: cleanSY, mode: "insensitive" },
      OR: whereConditions,
    },
  });

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
    category: "STUDENT_ENROLLMENT",
    AND: [{ OR: whereConditions }],
  };

  if (filters.status && filters.status !== "ALL") {
    baseWhere.status = filters.status;
  }

  const [rawCandidates, allSYRecords] = await Promise.all([
    prisma.reviewCenterProgram.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
    }),
    getReviewCenterSchoolYears(companyName, reviewCenterId),
  ]);

  // Extract all emails to batch query User table for level/xp
  const allEmails = rawCandidates
    .map((c) => {
      try {
        return JSON.parse(c.description || "{}").email?.toLowerCase();
      } catch {
        return null;
      }
    })
    .filter(Boolean);

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

  let candidates = rawCandidates.map((c) => parseCandidateItem(c, userMap));

  // In-memory filter for schoolYear, batch, search
  if (filters.schoolYear && filters.schoolYear !== "ALL") {
    candidates = candidates.filter(
      (c) => c.schoolYear.toLowerCase() === filters.schoolYear?.toLowerCase(),
    );
  }

  if (filters.batch && filters.batch !== "ALL") {
    candidates = candidates.filter(
      (c) => c.batch.toLowerCase() === filters.batch?.toLowerCase(),
    );
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    candidates = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.schoolId.toLowerCase().includes(term),
    );
  }

  const distinctBatches = Array.from(
    new Set(rawCandidates.map((c) => {
      try {
        return JSON.parse(c.description || "{}").batch;
      } catch {
        return null;
      }
    }).filter(Boolean)),
  );

  const schoolYears = allSYRecords.map((s) => s.schoolYear);

  return {
    candidates,
    schoolYears,
    batches: distinctBatches,
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
  if (!data.batch?.trim()) {
    throw new ApiError(400, "Batch identifier is required.");
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

  // Ensure School Year is saved
  await createReviewCenterSchoolYear(
    data.companyName,
    data.schoolYear,
    finalReviewCenterId,
  );

  // Check if candidate already enrolled in this school year + batch
  const existingCandidates = await prisma.reviewCenterProgram.findMany({
    where: {
      category: "STUDENT_ENROLLMENT",
      companyName: { equals: data.companyName.trim(), mode: "insensitive" },
    },
  });

  const duplicate = existingCandidates.find((c) => {
    try {
      const meta = JSON.parse(c.description || "{}");
      return (
        meta.email?.toLowerCase() === data.email.trim().toLowerCase() &&
        meta.schoolYear?.toLowerCase() === data.schoolYear.trim().toLowerCase() &&
        meta.batch?.toLowerCase() === data.batch.trim().toLowerCase()
      );
    } catch {
      return false;
    }
  });

  if (duplicate) {
    throw new ApiError(
      400,
      `Student with email "${data.email}" is already enrolled in ${data.batch} (${data.schoolYear}).`,
    );
  }

  // Auto-link registered user
  let studentId: string | null = null;
  const registeredUser = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
    select: { id: true },
  });
  if (registeredUser) {
    studentId = registeredUser.id;
  }

  const payload = {
    email: data.email.trim().toLowerCase(),
    schoolId: data.schoolId?.trim() || "",
    schoolYear: data.schoolYear.trim(),
    batch: data.batch.trim(),
    studentId,
  };

  const created = await prisma.reviewCenterProgram.create({
    data: {
      title: data.name.trim(),
      description: JSON.stringify(payload),
      category: "STUDENT_ENROLLMENT",
      status: data.status || "ENROLLED",
      companyName: data.companyName.trim(),
      reviewCenterId: finalReviewCenterId || null,
    },
  });

  return parseCandidateItem(created);
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

  // Ensure School Year exists in DB
  await createReviewCenterSchoolYear(
    data.companyName,
    data.schoolYear,
    finalReviewCenterId,
  );

  const existingCandidates = await prisma.reviewCenterProgram.findMany({
    where: {
      category: "STUDENT_ENROLLMENT",
      companyName: { equals: data.companyName.trim(), mode: "insensitive" },
    },
  });

  let enrolledCount = 0;
  let skippedCount = 0;
  const createdList: any[] = [];

  for (const item of data.students) {
    if (!item.name?.trim() || !item.email?.trim() || !item.email.includes("@")) {
      skippedCount++;
      continue;
    }

    const itemBatch = item.batch?.trim() || data.batch?.trim() || "Batch 1";
    const itemEmail = item.email.trim().toLowerCase();

    const isDup = existingCandidates.some((c) => {
      try {
        const meta = JSON.parse(c.description || "{}");
        return (
          meta.email?.toLowerCase() === itemEmail &&
          meta.schoolYear?.toLowerCase() === data.schoolYear.trim().toLowerCase() &&
          meta.batch?.toLowerCase() === itemBatch.toLowerCase()
        );
      } catch {
        return false;
      }
    });

    if (isDup) {
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

    const payload = {
      email: itemEmail,
      schoolId: item.schoolId?.trim() || "",
      schoolYear: data.schoolYear.trim(),
      batch: itemBatch,
      studentId,
    };

    const created = await prisma.reviewCenterProgram.create({
      data: {
        title: item.name.trim(),
        description: JSON.stringify(payload),
        category: "STUDENT_ENROLLMENT",
        status: "ENROLLED",
        companyName: data.companyName.trim(),
        reviewCenterId: finalReviewCenterId || null,
      },
    });

    createdList.push(parseCandidateItem(created));
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
  const existing = await prisma.reviewCenterProgram.findUnique({
    where: { id },
  });

  if (!existing || existing.category !== "STUDENT_ENROLLMENT") {
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

  let currentMeta: any = {};
  try {
    currentMeta = JSON.parse(existing.description || "{}");
  } catch {}

  const updatedMeta = {
    ...currentMeta,
    ...(data.email && { email: data.email.trim().toLowerCase() }),
    ...(data.schoolId !== undefined && { schoolId: data.schoolId.trim() }),
    ...(data.schoolYear && { schoolYear: data.schoolYear.trim() }),
    ...(data.batch && { batch: data.batch.trim() }),
  };

  const updated = await prisma.reviewCenterProgram.update({
    where: { id },
    data: {
      ...(data.name && { title: data.name.trim() }),
      ...(data.status && { status: data.status }),
      description: JSON.stringify(updatedMeta),
    },
  });

  return parseCandidateItem(updated);
}

export async function deleteCandidate(
  id: string,
  companyName?: string,
  reviewCenterId?: string,
) {
  const existing = await prisma.reviewCenterProgram.findUnique({
    where: { id },
  });

  if (!existing || existing.category !== "STUDENT_ENROLLMENT") {
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

  await prisma.reviewCenterProgram.delete({
    where: { id },
  });

  return true;
}
