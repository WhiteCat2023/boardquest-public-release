import prisma from "../../services/prisma";
import { ApiError } from "../../utils/apiError";
import { GuidanceStatus, Role } from "../../types/prisma.types";
import { createNotification } from "./notification.service";

export interface CreateGuidancePayload {
  studentId: string;
  advisorId: string;
  subjectCategory?: string;
  reason: string;
  guidanceNotes?: string;
}

export interface UpdateGuidancePayload {
  status?: GuidanceStatus;
  guidanceNotes?: string;
  resolutionNotes?: string;
}

export const createGuidanceAssignment = async (
  assignedById: string,
  payload: CreateGuidancePayload,
  creatorRole: Role,
) => {
  if (
    creatorRole !== Role.SUPERADMIN &&
    creatorRole !== Role.DEAN &&
    creatorRole !== Role.TEAMLEAD
  ) {
    throw new ApiError(
      403,
      "Only Superadmin, Dean, and Team Lead users can assign students to advisors.",
    );
  }

  const { studentId, advisorId, subjectCategory, reason, guidanceNotes } =
    payload;

  if (!studentId || !advisorId || !reason?.trim()) {
    throw new ApiError(400, "studentId, advisorId, and reason are required.");
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  const advisor = await prisma.adminUser.findUnique({
    where: { id: advisorId },
  });
  if (!advisor) {
    throw new ApiError(404, "Advisor profile not found.");
  }

  const advisorRole = String(advisor.role || "").toUpperCase().trim();
  if (
    advisorRole === "REVIEWCENTER" ||
    advisorRole === "EXTERNAL" ||
    advisorRole.includes("REVIEW") ||
    advisorRole.includes("EXTERNAL")
  ) {
    throw new ApiError(
      400,
      "Review center or external accounts cannot be assigned as student advisors.",
    );
  }

  const assignment = await (prisma as any).guidanceAssignment.create({
    data: {
      studentId,
      advisorId,
      assignedById,
      subjectCategory: subjectCategory || "General Academic Support",
      reason: reason.trim(),
      guidanceNotes: guidanceNotes?.trim() || "",
      status: GuidanceStatus.PENDING,
    },
    include: {
      student: {
        select: { id: true, name: true, email: true, level: true, xp: true },
      },
      advisor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employeeId: true,
        },
      },
      assignedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  createNotification({
    recipientId: advisorId,
    recipientRole: advisor.role,
    title: "New Student Guidance Assigned",
    message: `Student ${student.name} was assigned to you for academic guidance.`,
    type: "STUDENT_ASSIGNED",
    link: "/student-management",
  }).catch((err) => console.warn("Notification error:", err?.message));

  return assignment;
};

export const getGuidanceAssignments = async (filters: {
  status?: string;
  advisorId?: string;
  studentId?: string;
  search?: string;
}) => {
  const where: any = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }
  if (filters.advisorId) {
    where.advisorId = filters.advisorId;
  }
  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { student: { name: { contains: term, mode: "insensitive" } } },
      { student: { email: { contains: term, mode: "insensitive" } } },
      { advisor: { name: { contains: term, mode: "insensitive" } } },
      { reason: { contains: term, mode: "insensitive" } },
    ];
  }

  const assignments = await (prisma as any).guidanceAssignment.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          xp: true,
          examResults: true,
        },
      },
      advisor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          employeeId: true,
        },
      },
      assignedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
};

export const updateGuidanceAssignment = async (
  assignmentId: string,
  userId: string,
  userRole: Role,
  payload: UpdateGuidancePayload,
) => {
  const existing = await (prisma as any).guidanceAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!existing) {
    throw new ApiError(404, "Guidance assignment record not found.");
  }

  const isAssigner = existing.assignedById === userId;
  const isAdvisor = existing.advisorId === userId;
  const isAdmin =
    userRole === Role.SUPERADMIN ||
    userRole === Role.DEAN ||
    userRole === Role.TEAMLEAD;

  if (!isAssigner && !isAdvisor && !isAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to modify this guidance case.",
    );
  }

  const updated = await (prisma as any).guidanceAssignment.update({
    where: { id: assignmentId },
    data: {
      status: payload.status || existing.status,
      guidanceNotes:
        payload.guidanceNotes !== undefined
          ? payload.guidanceNotes
          : existing.guidanceNotes,
      resolutionNotes:
        payload.resolutionNotes !== undefined
          ? payload.resolutionNotes
          : existing.resolutionNotes,
    },
    include: {
      student: {
        select: { id: true, name: true, email: true, level: true, xp: true },
      },
      advisor: {
        select: { id: true, name: true, email: true, role: true },
      },
      assignedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return updated;
};

export const getFailingStudents = async () => {
  const students = await (prisma.user as any).findMany({
    include: {
      examResults: true,
      mastery: true,
      guidanceAssignments: {
        include: {
          advisor: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const failingStudents = students.map((st: any) => {
    const totalExams = st.examResults?.length || 0;
    const avgAccuracy =
      totalExams > 0
        ? st.examResults.reduce(
            (acc: number, r: any) => acc + (r.accuracy || 0),
            0,
          ) / totalExams
        : 0;

    const activeGuidance = (st.guidanceAssignments || []).find(
      (g: any) =>
        g.status === GuidanceStatus.PENDING ||
        g.status === GuidanceStatus.IN_PROGRESS,
    );

    return {
      ...st,
      totalExams,
      avgAccuracy: Math.round(avgAccuracy),
      isFailing: totalExams > 0 ? avgAccuracy < 75 : false,
      activeGuidance: activeGuidance || null,
    };
  });

  return failingStudents;
};
