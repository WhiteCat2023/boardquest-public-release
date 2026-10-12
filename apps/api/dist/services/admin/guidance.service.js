import prisma from "../../services/prisma";
import { ApiError } from "../../utils/apiError";
import { GuidanceStatus, Role } from "../../types/prisma.types";
import { createNotification } from "./notification.service";
import { sendAdvisorOutreachEmail } from "../mail.service";
export const bulkCreateGuidanceAssignments = async (assignedById, payload, creatorRole) => {
    if (creatorRole !== Role.SUPERADMIN &&
        creatorRole !== Role.DEAN &&
        creatorRole !== Role.TEAMLEAD) {
        throw new ApiError(403, "Only Superadmin, Dean, and Team Lead users can assign students to advisors.");
    }
    const { studentIds, advisorId, subjectCategory, subjectCategories, reason, guidanceNotes, drillQuota, targetAccuracy, deadline, } = payload;
    const resolvedCategory = Array.isArray(subjectCategories) && subjectCategories.length > 0
        ? subjectCategories.join(", ")
        : subjectCategory?.trim() || "General Academic Support";
    if (!Array.isArray(studentIds) ||
        studentIds.length === 0 ||
        !advisorId ||
        !reason?.trim()) {
        throw new ApiError(400, "studentIds array, advisorId, and reason are required.");
    }
    const advisor = await prisma.adminUser.findUnique({
        where: { id: advisorId },
    });
    if (!advisor) {
        throw new ApiError(404, "Advisor profile not found.");
    }
    const advisorRole = String(advisor.role || "").toUpperCase().trim();
    if (advisorRole === "REVIEWCENTER" ||
        advisorRole === "EXTERNAL" ||
        advisorRole.includes("REVIEW") ||
        advisorRole.includes("EXTERNAL")) {
        throw new ApiError(400, "Review center or external accounts cannot be assigned as student advisors.");
    }
    // Find all matching valid students
    const students = await prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, name: true, email: true },
    });
    if (students.length === 0) {
        throw new ApiError(404, "None of the specified students were found.");
    }
    // Create guidance assignment for each student
    const assignments = await Promise.all(students.map((student) => prisma.guidanceAssignment.create({
        data: {
            studentId: student.id,
            advisorId,
            assignedById,
            subjectCategory: resolvedCategory,
            reason: reason.trim(),
            guidanceNotes: guidanceNotes?.trim() || "",
            drillQuota: drillQuota !== undefined && !isNaN(Number(drillQuota))
                ? Math.max(5, Math.min(500, Number(drillQuota)))
                : 30,
            targetAccuracy: targetAccuracy !== undefined && !isNaN(Number(targetAccuracy))
                ? Math.max(50, Math.min(100, Number(targetAccuracy)))
                : 75.0,
            deadline: deadline ? new Date(deadline) : null,
            status: GuidanceStatus.PENDING,
        },
        include: {
            student: {
                select: { id: true, name: true, email: true, level: true, xp: true },
            },
            advisor: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
    })));
    createNotification({
        recipientId: advisorId,
        recipientRole: advisor.role,
        title: "New Student Guidance Assigned (Bulk)",
        message: `${assignments.length} student${assignments.length > 1 ? "s were" : " was"} assigned to you for academic guidance.`,
        type: "STUDENT_ASSIGNED",
        link: "/student-management",
    }).catch((err) => console.warn("Notification error:", err?.message));
    return {
        count: assignments.length,
        assignments,
    };
};
export const createGuidanceAssignment = async (assignedById, payload, creatorRole) => {
    if (Array.isArray(payload.studentIds) && payload.studentIds.length > 0) {
        const bulkResult = await bulkCreateGuidanceAssignments(assignedById, {
            studentIds: payload.studentIds,
            advisorId: payload.advisorId,
            subjectCategory: payload.subjectCategory,
            subjectCategories: payload.subjectCategories,
            reason: payload.reason,
            guidanceNotes: payload.guidanceNotes,
            drillQuota: payload.drillQuota,
            targetAccuracy: payload.targetAccuracy,
            deadline: payload.deadline,
        }, creatorRole);
        return bulkResult.assignments[0];
    }
    if (creatorRole !== Role.SUPERADMIN &&
        creatorRole !== Role.DEAN &&
        creatorRole !== Role.TEAMLEAD) {
        throw new ApiError(403, "Only Superadmin, Dean, and Team Lead users can assign students to advisors.");
    }
    const { studentId, advisorId, subjectCategory, subjectCategories, reason, guidanceNotes, drillQuota, targetAccuracy, deadline, } = payload;
    const resolvedCategory = Array.isArray(subjectCategories) && subjectCategories.length > 0
        ? subjectCategories.join(", ")
        : subjectCategory?.trim() || "General Academic Support";
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
    if (advisorRole === "REVIEWCENTER" ||
        advisorRole === "EXTERNAL" ||
        advisorRole.includes("REVIEW") ||
        advisorRole.includes("EXTERNAL")) {
        throw new ApiError(400, "Review center or external accounts cannot be assigned as student advisors.");
    }
    const assignment = await prisma.guidanceAssignment.create({
        data: {
            studentId,
            advisorId,
            assignedById,
            subjectCategory: resolvedCategory,
            reason: reason.trim(),
            guidanceNotes: guidanceNotes?.trim() || "",
            drillQuota: drillQuota !== undefined && !isNaN(Number(drillQuota))
                ? Math.max(5, Math.min(500, Number(drillQuota)))
                : 30,
            targetAccuracy: targetAccuracy !== undefined && !isNaN(Number(targetAccuracy))
                ? Math.max(50, Math.min(100, Number(targetAccuracy)))
                : 75.0,
            deadline: deadline ? new Date(deadline) : null,
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
export const getGuidanceAssignments = async (filters) => {
    const where = {};
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
    // Ensure query only targets existing students to prevent Prisma MongoDB relation crashes
    const activeStudents = await prisma.user.findMany({ select: { id: true } });
    const activeStudentIds = activeStudents.map((s) => s.id);
    if (!filters.studentId) {
        where.studentId = { in: activeStudentIds };
    }
    const assignments = await prisma.guidanceAssignment.findMany({
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
export const updateGuidanceAssignment = async (assignmentId, userId, userRole, payload) => {
    const existing = await prisma.guidanceAssignment.findUnique({
        where: { id: assignmentId },
    });
    if (!existing) {
        throw new ApiError(404, "Guidance assignment record not found.");
    }
    const isAssigner = existing.assignedById === userId;
    const isAdvisor = existing.advisorId === userId;
    const isAdmin = userRole === Role.SUPERADMIN ||
        userRole === Role.DEAN ||
        userRole === Role.TEAMLEAD;
    if (!isAssigner && !isAdvisor && !isAdmin) {
        throw new ApiError(403, "You do not have permission to modify this guidance case.");
    }
    const updated = await prisma.guidanceAssignment.update({
        where: { id: assignmentId },
        data: {
            status: payload.status || existing.status,
            guidanceNotes: payload.guidanceNotes !== undefined
                ? payload.guidanceNotes
                : existing.guidanceNotes,
            resolutionNotes: payload.resolutionNotes !== undefined
                ? payload.resolutionNotes
                : existing.resolutionNotes,
            drillQuota: payload.drillQuota !== undefined && !isNaN(Number(payload.drillQuota))
                ? Math.max(5, Math.min(500, Number(payload.drillQuota)))
                : existing.drillQuota,
            targetAccuracy: payload.targetAccuracy !== undefined && !isNaN(Number(payload.targetAccuracy))
                ? Math.max(50, Math.min(100, Number(payload.targetAccuracy)))
                : existing.targetAccuracy,
            deadline: payload.deadline !== undefined
                ? payload.deadline ? new Date(payload.deadline) : null
                : existing.deadline,
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
    const students = await prisma.user.findMany({
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
    const failingStudents = students.map((st) => {
        const totalExams = st.examResults?.length || 0;
        const avgAccuracy = totalExams > 0
            ? st.examResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalExams
            : 0;
        const activeGuidance = (st.guidanceAssignments || []).find((g) => g.status === GuidanceStatus.PENDING ||
            g.status === GuidanceStatus.IN_PROGRESS);
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
export const sendStudentReachoutEmail = async (advisorId, advisorRole, payload) => {
    const { studentId, guidanceId, subject, message, meetingLink, drillCategory, templateType } = payload;
    if (!studentId || !subject?.trim() || !message?.trim()) {
        throw new ApiError(400, "studentId, subject, and message are required.");
    }
    // 1. Fetch advisor profile
    const advisor = await prisma.adminUser.findUnique({
        where: { id: advisorId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (!advisor) {
        throw new ApiError(404, "Advisor profile not found.");
    }
    // 2. Fetch student profile
    const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, email: true },
    });
    if (!student) {
        throw new ApiError(404, "Student profile not found.");
    }
    // 3. Check for guidance assignment
    let guidanceAssignment = null;
    if (guidanceId) {
        guidanceAssignment = await prisma.guidanceAssignment.findUnique({
            where: { id: guidanceId },
        });
    }
    else {
        guidanceAssignment = await prisma.guidanceAssignment.findFirst({
            where: {
                studentId,
                advisorId,
                status: { in: [GuidanceStatus.PENDING, GuidanceStatus.IN_PROGRESS] },
            },
        });
    }
    // 4. Send email via mail service
    const emailResult = await sendAdvisorOutreachEmail({
        toEmail: student.email,
        studentName: student.name,
        advisorName: advisor.name,
        advisorEmail: advisor.email,
        advisorRole: advisor.role,
        subject: subject.trim(),
        message: message.trim(),
        meetingLink: meetingLink?.trim() || undefined,
        drillCategory: drillCategory || guidanceAssignment?.subjectCategory,
    });
    // 5. Persist persistent OutreachLog record
    const now = new Date();
    const outreachLog = await prisma.outreachLog.create({
        data: {
            studentId: student.id,
            advisorId: advisor.id,
            guidanceId: guidanceAssignment?.id || null,
            channel: "EMAIL",
            subject: subject.trim(),
            message: message.trim(),
            templateType: templateType || null,
            focusSubject: drillCategory || guidanceAssignment?.subjectCategory || null,
            meetingLink: meetingLink?.trim() || null,
            deliveryStatus: emailResult ? "SENT" : "SIMULATED",
            createdAt: now,
        },
    }).catch((err) => {
        console.warn("Failed to persist OutreachLog:", err?.message);
        return null;
    });
    // 6. Update student's lastContactedAt timestamp
    await prisma.user.update({
        where: { id: student.id },
        data: { lastContactedAt: now },
    }).catch((err) => console.warn("Failed to update lastContactedAt on User:", err?.message));
    // 7. Update guidance assignment notes and status if exists
    if (guidanceAssignment) {
        const timestamp = now.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        const newNote = `[Outreach Email Sent on ${timestamp} by ${advisor.name}]: "${subject.trim()}"`;
        const updatedNotes = guidanceAssignment.guidanceNotes
            ? `${guidanceAssignment.guidanceNotes}\n\n${newNote}`
            : newNote;
        await prisma.guidanceAssignment.update({
            where: { id: guidanceAssignment.id },
            data: {
                guidanceNotes: updatedNotes,
                lastOutreachAt: now,
                status: guidanceAssignment.status === GuidanceStatus.PENDING
                    ? GuidanceStatus.IN_PROGRESS
                    : guidanceAssignment.status,
            },
        }).catch((err) => console.warn("Failed to update GuidanceAssignment:", err?.message));
    }
    // 8. In-app notification for the student
    createNotification({
        recipientId: student.id,
        title: `Academic Guidance from ${advisor.name}`,
        message: `Your advisor ${advisor.name} sent you an outreach email regarding "${subject.trim()}".`,
        type: "INFO",
        link: "/study-plans",
    }).catch((err) => console.warn("Notification error:", err?.message));
    return {
        success: true,
        sentTo: student.email,
        advisorName: advisor.name,
        subject: subject.trim(),
        deliveredAt: now.toISOString(),
        logId: outreachLog?.id || null,
        emailId: emailResult?.id || "simulated",
    };
};
export const getStudentOutreachLogs = async (studentId) => {
    if (!studentId) {
        throw new ApiError(400, "Student ID is required.");
    }
    const logs = await prisma.outreachLog.findMany({
        where: { studentId },
        include: {
            advisor: {
                select: { id: true, name: true, email: true, role: true },
            },
            student: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return logs;
};
