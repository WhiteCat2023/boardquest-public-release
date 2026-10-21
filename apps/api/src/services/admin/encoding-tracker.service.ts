import prisma from "../prisma";
import { createNotification } from "./notification.service";
import { logInfo } from "./logger.service";
import { ApiError } from "../../utils/apiError";

export interface TrackerFilters {
  schoolYear?: string;
  subjectId?: string;
  status?: string; // 'ALL' | 'INCOMPLETE' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  search?: string;
}

export interface QuotaAssignmentInput {
  teacherId: string;
  subjectId: string;
  schoolYear?: string;
  targetCount: number;
  deadline?: string | Date | null;
  notes?: string;
  assignedById?: string;
}

export interface NudgeInput {
  teacherId: string;
  subjectId?: string;
  customMessage?: string;
  senderId?: string;
  senderName?: string;
}

export interface BulkNudgeInput {
  subjectId?: string;
  schoolYear?: string;
  senderId?: string;
  senderName?: string;
  customMessage?: string;
}

export class EncodingTrackerService {
  private db = prisma as any;

  /**
   * Resolve active school year (from db or default to S.Y. 2025-2026)
   */
  async getActiveSchoolYear(requestedYear?: string): Promise<string> {
    if (requestedYear && requestedYear.trim()) {
      return requestedYear.trim();
    }
    try {
      const activeYear = await this.db.schoolYear.findFirst({
        where: { isCurrent: true },
        select: { year: true },
      });
      if (activeYear?.year) {
        return activeYear.year;
      }
    } catch {
      // Fallback if SchoolYear collection is empty
    }
    return "S.Y. 2025-2026";
  }

  /**
   * Retrieves aggregated tracker overview for Team Leads, Deans, and SuperAdmins
   */
  async getEncodingTrackerOverview(filters: TrackerFilters = {}) {
    const schoolYear = await this.getActiveSchoolYear(filters.schoolYear);

    // 1. Fetch only genuine active faculty teachers (strictly TEACHER role, excluding review center/external and admin roles)
    const teachers = await this.db.adminUser.findMany({
      where: {
        role: "TEACHER",
        accountStatus: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        avatarUrl: true,
        role: true,
      },
    });
    const teacherMap = new Map<string, any>(
      teachers.map((t: any) => [t.id, t]),
    );

    // 2. Fetch all subjects with their assigned handlerIds
    const allSubjects = await this.db.subject.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        handlerIds: true,
      },
    });

    // 3. Fetch all explicit quota assignments for this school year for genuine teachers
    const assignments = await this.db.questionQuotaAssignment.findMany({
      where: {
        schoolYear,
        teacherId: { in: teachers.map((t: any) => t.id) },
      },
      include: {
        assignedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    const assignmentMap = new Map<string, any>();
    for (const a of assignments) {
      assignmentMap.set(`${a.teacherId}_${a.subjectId}`, a);
    }

    // 4. Fetch all questions authored by these teachers for this school year
    const questions = await this.db.question.findMany({
      where: {
        schoolYear,
        authorId: { in: teachers.map((t: any) => t.id) },
      },
      select: {
        id: true,
        authorId: true,
        subjectId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Group questions by `${authorId}_${subjectId}`
    const questionStatsMap = new Map<
      string,
      {
        total: number;
        approved: number;
        pendingReview: number;
        pendingRevision: number;
        lastEncodedAt: Date | null;
      }
    >();

    for (const q of questions) {
      const key = `${q.authorId}_${q.subjectId}`;
      let stat = questionStatsMap.get(key);
      if (!stat) {
        stat = {
          total: 0,
          approved: 0,
          pendingReview: 0,
          pendingRevision: 0,
          lastEncodedAt: null,
        };
        questionStatsMap.set(key, stat);
      }
      stat.total += 1;
      if (q.status === "APPROVED") stat.approved += 1;
      else if (q.status === "PENDING_REVIEW") stat.pendingReview += 1;
      else if (q.status === "PENDING_REVISION") stat.pendingRevision += 1;

      const qDate = q.updatedAt || q.createdAt;
      if (
        qDate &&
        (!stat.lastEncodedAt || new Date(qDate) > new Date(stat.lastEncodedAt))
      ) {
        stat.lastEncodedAt = new Date(qDate);
      }
    }

    // 5. Combine into individual faculty-subject encoding track items
    // Strict alignment with subject.handlerIds (internal TEACHERs only)
    const rawItems: any[] = [];
    const now = new Date();

    for (const subject of allSubjects) {
      if (
        filters.subjectId &&
        filters.subjectId !== "ALL" &&
        filters.subjectId !== subject.id
      ) {
        continue;
      }

      // Collect eligible teacher IDs for this subject:
      // 1) Teachers assigned in subject.handlerIds (who are active TEACHERs)
      // 2) Teachers who have a quota assignment for this subject (and are active TEACHERs)
      const subjectTeacherIds = new Set<string>();

      for (const handlerId of subject.handlerIds || []) {
        const teacher = teacherMap.get(handlerId);
        if (teacher && teacher.role === "TEACHER") {
          subjectTeacherIds.add(handlerId);
        }
      }

      for (const a of assignments) {
        if (a.subjectId === subject.id && teacherMap.has(a.teacherId)) {
          subjectTeacherIds.add(a.teacherId);
        }
      }

      for (const teacherId of subjectTeacherIds) {
        const teacher = teacherMap.get(teacherId);
        if (!teacher) continue;

        const key = `${teacher.id}_${subject.id}`;
        const assignment = assignmentMap.get(key);
        const stats = questionStatsMap.get(key) || {
          total: 0,
          approved: 0,
          pendingReview: 0,
          pendingRevision: 0,
          lastEncodedAt: null,
        };

        const targetCount = assignment?.targetCount ?? 50; // default quota baseline is 50
        const encodedCount = stats.total;
        const deadline = assignment?.deadline
          ? new Date(assignment.deadline)
          : null;
        const isPastDeadline = deadline ? now > deadline : false;

        let status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
        if (encodedCount >= targetCount) {
          status = "COMPLETED";
        } else if (isPastDeadline) {
          status = "OVERDUE";
        } else if (encodedCount === 0) {
          status = "NOT_STARTED";
        } else {
          status = "IN_PROGRESS";
        }

        const remainingCount = Math.max(0, targetCount - encodedCount);
        const progressPercentage = Math.min(
          100,
          Math.round((encodedCount / Math.max(1, targetCount)) * 100),
        );

        rawItems.push({
          id: assignment?.id || `virtual_${teacher.id}_${subject.id}`,
          assignmentId: assignment?.id || null,
          teacher: {
            id: teacher.id,
            name: teacher.name,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            employeeId: teacher.employeeId,
            avatarUrl: teacher.avatarUrl,
            role: teacher.role,
          },
          subject: {
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
          },
          schoolYear,
          targetCount,
          encodedCount,
          remainingCount,
          progressPercentage,
          breakdown: {
            approved: stats.approved,
            pendingReview: stats.pendingReview,
            pendingRevision: stats.pendingRevision,
          },
          deadline: deadline ? deadline.toISOString() : null,
          isPastDeadline,
          notes: assignment?.notes || null,
          assignedBy: assignment?.assignedBy || null,
          status,
          lastEncodedAt: stats.lastEncodedAt
            ? stats.lastEncodedAt.toISOString()
            : null,
        });
      }
    }

    // 6. Calculate KPIs from all items (before search/status filter for consistent overview)
    const totalFacultySet = new Set<string>();
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let overdueCount = 0;
    let totalTargetQuestions = 0;
    let totalEncodedQuestions = 0;
    let totalApprovedQuestions = 0;

    for (const item of rawItems) {
      totalFacultySet.add(item.teacher.id);
      totalTargetQuestions += item.targetCount;
      totalEncodedQuestions += item.encodedCount;
      totalApprovedQuestions += item.breakdown.approved;

      if (item.status === "COMPLETED") completedCount++;
      else if (item.status === "OVERDUE") overdueCount++;
      else if (item.status === "IN_PROGRESS") inProgressCount++;
      else if (item.status === "NOT_STARTED") notStartedCount++;
    }

    const kpis = {
      totalFaculty: totalFacultySet.size,
      totalAssignments: rawItems.length,
      completedCount,
      inProgressCount,
      notStartedCount,
      overdueCount,
      totalTargetQuestions,
      totalEncodedQuestions,
      totalApprovedQuestions,
      overallCompletionRate:
        totalTargetQuestions > 0
          ? Math.min(
              100,
              Math.round((totalEncodedQuestions / totalTargetQuestions) * 100),
            )
          : 0,
    };

    // 7. Apply filtering for output items
    let filteredItems = rawItems;

    if (filters.status && filters.status !== "ALL") {
      if (filters.status === "INCOMPLETE") {
        filteredItems = filteredItems.filter(
          (item) =>
            item.status === "NOT_STARTED" ||
            item.status === "IN_PROGRESS" ||
            item.status === "OVERDUE",
        );
      } else {
        filteredItems = filteredItems.filter(
          (item) => item.status === filters.status,
        );
      }
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.teacher.name?.toLowerCase().includes(q) ||
          item.teacher.email?.toLowerCase().includes(q) ||
          item.teacher.employeeId?.toLowerCase().includes(q) ||
          item.subject.name?.toLowerCase().includes(q),
      );
    }

    // Sort: Overdue first, then Not Started, then In Progress, then Completed
    const sortPriority: Record<string, number> = {
      OVERDUE: 1,
      NOT_STARTED: 2,
      IN_PROGRESS: 3,
      COMPLETED: 4,
    };
    filteredItems.sort((a, b) => {
      const priorityDiff =
        (sortPriority[a.status] || 5) - (sortPriority[b.status] || 5);
      if (priorityDiff !== 0) return priorityDiff;
      return a.teacher.name.localeCompare(b.teacher.name);
    });

    return {
      kpis,
      items: filteredItems,
      schoolYear,
    };
  }

  /**
   * Sets or modifies quota targets & deadlines for a teacher on a subject
   */
  async upsertQuotaAssignment(input: QuotaAssignmentInput) {
    const { teacherId, subjectId, targetCount, deadline, notes, assignedById } =
      input;
    const schoolYear = await this.getActiveSchoolYear(input.schoolYear);

    if (!teacherId || !subjectId) {
      throw new ApiError(400, "teacherId and subjectId are required");
    }

    if (targetCount <= 0) {
      throw new ApiError(400, "targetCount must be greater than 0");
    }

    const teacher = await this.db.adminUser.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, role: true, handledSubjectIds: true },
    });
    if (!teacher || teacher.role !== "TEACHER") {
      throw new ApiError(
        400,
        "Only internal faculty teachers can have authoring quotas assigned. External accounts like review centers are excluded.",
      );
    }

    // Ensure subject is in teacher's handledSubjectIds
    if (!teacher.handledSubjectIds.includes(subjectId)) {
      await this.db.adminUser.update({
        where: { id: teacherId },
        data: {
          handledSubjectIds: { push: subjectId },
        },
      });
    }

    const parsedDeadline = deadline ? new Date(deadline) : null;

    const assignment = await this.db.questionQuotaAssignment.upsert({
      where: {
        teacherId_subjectId_schoolYear: {
          teacherId,
          subjectId,
          schoolYear,
        },
      },
      create: {
        teacherId,
        subjectId,
        schoolYear,
        targetCount,
        deadline: parsedDeadline,
        notes: notes || null,
        assignedById: assignedById || null,
      },
      update: {
        targetCount,
        deadline: parsedDeadline,
        notes: notes || null,
        assignedById: assignedById || null,
      },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    await logInfo(
      "UPSERT_QUOTA_ASSIGNMENT",
      `Assigned quota ${targetCount} questions for teacher ${teacher.name} (${assignment.subject.name})`,
      "EncodingTrackerService",
      assignment.teacher.email,
    );

    return assignment;
  }

  /**
   * Sets or modifies quota targets for an entire subject, dividing among handlers
   */
  async upsertSubjectQuota(input: {
    subjectId: string;
    totalTargetCount: number;
    deadline?: string | Date | null;
    notes?: string;
    schoolYear?: string;
    assignedById?: string;
  }) {
    const { subjectId, totalTargetCount, deadline, notes, assignedById } =
      input;
    const schoolYear = await this.getActiveSchoolYear(input.schoolYear);

    if (!subjectId) {
      throw new ApiError(400, "subjectId is required");
    }

    const subject = await this.db.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true, handlerIds: true },
    });
    if (!subject) {
      throw new ApiError(404, "Subject not found");
    }

    // Fetch active teacher handlers for this subject (strictly internal TEACHER accounts, excluding review centers)
    const teachers = await this.db.adminUser.findMany({
      where: {
        id: { in: subject.handlerIds || [] },
        role: "TEACHER",
        accountStatus: "ACTIVE",
      },
      select: { id: true, name: true, email: true },
    });

    if (teachers.length === 0) {
      throw new ApiError(
        400,
        "No teacher handlers are currently assigned to this subject",
      );
    }

    if (totalTargetCount < teachers.length) {
      throw new ApiError(
        400,
        `Total question quota must be at least ${teachers.length} (minimum 1 per handler)`,
      );
    }

    const n = teachers.length;
    const baseQuota = Math.floor(totalTargetCount / n);
    const remainder = totalTargetCount % n;
    const parsedDeadline = deadline ? new Date(deadline) : null;

    const results = [];
    for (let i = 0; i < n; i++) {
      const teacher = teachers[i];
      const targetCount = baseQuota + (i < remainder ? 1 : 0);

      const assignment = await this.db.questionQuotaAssignment.upsert({
        where: {
          teacherId_subjectId_schoolYear: {
            teacherId: teacher.id,
            subjectId,
            schoolYear,
          },
        },
        create: {
          teacherId: teacher.id,
          subjectId,
          schoolYear,
          targetCount,
          deadline: parsedDeadline,
          notes: notes || null,
          assignedById: assignedById || null,
        },
        update: {
          targetCount,
          deadline: parsedDeadline,
          notes: notes || null,
          assignedById: assignedById || null,
        },
      });
      results.push({
        teacherId: teacher.id,
        teacherName: teacher.name,
        targetCount,
        assignment,
      });
    }

    await logInfo(
      "UPSERT_SUBJECT_QUOTA",
      `Distributed subject quota of ${totalTargetCount} questions across ${n} handlers for ${subject.name}`,
      "EncodingTrackerService",
    );

    return {
      success: true,
      subjectId,
      subjectName: subject.name,
      totalTargetCount,
      handlerCount: n,
      distribution: results,
    };
  }

  /**
   * Send one-click nudge reminder to a single teacher
   */
  async sendTeacherNudge(input: NudgeInput) {
    const { teacherId, subjectId, customMessage, senderName } = input;

    const teacher = await this.db.adminUser.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!teacher || teacher.role !== "TEACHER") {
      throw new ApiError(
        404,
        "Teacher not found or not eligible for authoring nudges",
      );
    }

    let subjectName = "assigned subjects";
    let targetInfo = "";
    if (subjectId) {
      const subject = await this.db.subject.findUnique({
        where: { id: subjectId },
        select: { name: true },
      });
      if (subject) subjectName = subject.name;

      const assignment = await this.db.questionQuotaAssignment.findFirst({
        where: { teacherId, subjectId },
      });
      if (assignment) {
        targetInfo = ` (Target: ${assignment.targetCount} items${
          assignment.deadline
            ? `, Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`
            : ""
        })`;
      }
    }

    const message =
      customMessage?.trim() ||
      `Hi ${teacher.name}, this is a friendly reminder to complete your question encoding for ${subjectName}${targetInfo}. Please visit your question bank to continue encoding.`;

    const notification = await createNotification({
      recipientId: teacher.id,
      recipientRole: "TEACHER",
      title: "Question Encoding Reminder",
      message,
      type: "WARNING",
      link: "/question-bank/my-questions",
      metadata: {
        subjectId,
        senderName: senderName || "Department Head",
        category: "ENCODING_NUDGE",
      },
    });

    await logInfo(
      "NUDGE_TEACHER_ENCODING",
      `Nudge reminder dispatched to ${teacher.name} (${teacher.email}) for ${subjectName}`,
      "EncodingTrackerService",
      teacher.email,
    );

    return {
      success: true,
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
      notification,
    };
  }

  /**
   * Send bulk nudge reminders to all incomplete or overdue teachers
   */
  async sendBulkTeacherNudges(input: BulkNudgeInput) {
    const overview = await this.getEncodingTrackerOverview({
      subjectId: input.subjectId,
      schoolYear: input.schoolYear,
      status: "INCOMPLETE",
    });

    const nudgedTeacherIds = new Set<string>();
    const results = [];

    for (const item of overview.items) {
      if (nudgedTeacherIds.has(item.teacher.id)) continue;
      nudgedTeacherIds.add(item.teacher.id);

      try {
        const res = await this.sendTeacherNudge({
          teacherId: item.teacher.id,
          subjectId: item.subject.id,
          customMessage: input.customMessage,
          senderId: input.senderId,
          senderName: input.senderName,
        });
        results.push(res);
      } catch (err: any) {
        console.error(
          `Failed to nudge teacher ${item.teacher.id}:`,
          err?.message,
        );
      }
    }

    return {
      success: true,
      totalNudged: results.length,
      teachers: results.map((r) => r.teacher),
    };
  }

  /**
   * Retrieve personal encoding progress for the currently logged in Teacher
   */
  async getTeacherPersonalProgress(teacherId: string, requestedYear?: string) {
    const schoolYear = await this.getActiveSchoolYear(requestedYear);

    const teacher = await this.db.adminUser.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        role: true,
        handledSubjectIds: true,
        handledSubjects: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    if (!teacher || teacher.role !== "TEACHER") {
      throw new ApiError(
        403,
        "Personal encoding tracker is only available for faculty teachers",
      );
    }

    const assignments = await this.db.questionQuotaAssignment.findMany({
      where: { teacherId, schoolYear },
      include: {
        subject: { select: { id: true, name: true, icon: true } },
      },
    });
    const assignmentMap = new Map<string, any>(
      assignments.map((a: any) => [a.subjectId, a]),
    );

    const questions = await this.db.question.findMany({
      where: { authorId: teacherId, schoolYear },
      select: {
        id: true,
        subjectId: true,
        status: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    const subjectIds = new Set<string>([
      ...(teacher.handledSubjectIds || []),
      ...(teacher.handledSubjects || []).map((s: any) => s.id),
      ...assignments.map((a: any) => a.subjectId),
    ]);

    const subjects = await this.db.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } },
      select: { id: true, name: true, icon: true },
    });

    const now = new Date();
    let totalTarget = 0;
    let totalEncoded = 0;
    let totalApproved = 0;

    const subjectGoals = subjects.map((sub: any) => {
      const assignment = assignmentMap.get(sub.id);
      const subQuestions = questions.filter((q: any) => q.subjectId === sub.id);

      const targetCount = assignment?.targetCount ?? 50;
      const encodedCount = subQuestions.length;
      const approvedCount = subQuestions.filter(
        (q: any) => q.status === "APPROVED",
      ).length;
      const pendingReviewCount = subQuestions.filter(
        (q: any) => q.status === "PENDING_REVIEW",
      ).length;
      const pendingRevisionCount = subQuestions.filter(
        (q: any) => q.status === "PENDING_REVISION",
      ).length;

      totalTarget += targetCount;
      totalEncoded += encodedCount;
      totalApproved += approvedCount;

      const deadline = assignment?.deadline
        ? new Date(assignment.deadline)
        : null;
      const isPastDeadline = deadline ? now > deadline : false;

      let status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
      if (encodedCount >= targetCount) status = "COMPLETED";
      else if (isPastDeadline) status = "OVERDUE";
      else if (encodedCount === 0) status = "NOT_STARTED";
      else status = "IN_PROGRESS";

      return {
        subject: sub,
        targetCount,
        encodedCount,
        remainingCount: Math.max(0, targetCount - encodedCount),
        progressPercentage: Math.min(
          100,
          Math.round((encodedCount / Math.max(1, targetCount)) * 100),
        ),
        breakdown: {
          approved: approvedCount,
          pendingReview: pendingReviewCount,
          pendingRevision: pendingRevisionCount,
        },
        deadline: deadline ? deadline.toISOString() : null,
        isPastDeadline,
        status,
      };
    });

    return {
      schoolYear,
      overall: {
        totalTarget,
        totalEncoded,
        totalApproved,
        remainingCount: Math.max(0, totalTarget - totalEncoded),
        progressPercentage:
          totalTarget > 0
            ? Math.min(100, Math.round((totalEncoded / totalTarget) * 100))
            : 0,
      },
      goals: subjectGoals,
    };
  }

  /**
   * Checks whether a teacher has reached their authoring quota for a specific subject in the active school year.
   */
  async checkTeacherQuota(
    teacherId: string,
    subjectId: string,
    requestedYear?: string,
  ) {
    const schoolYear = await this.getActiveSchoolYear(requestedYear);

    // 1. Find quota assignment or use default baseline (50)
    const assignment = await this.db.questionQuotaAssignment.findFirst({
      where: {
        teacherId,
        subjectId,
        schoolYear,
      },
    });

    const targetCount = assignment?.targetCount ?? 50;

    // 2. Count questions encoded by this teacher for this subject in the schoolYear
    const encodedCount = await this.db.question.count({
      where: {
        authorId: teacherId,
        subjectId,
        OR: [
          { schoolYear },
          ...(schoolYear === "S.Y. 2025-2026" ? [{ schoolYear: null }] : []),
        ],
      },
    });

    const isQuotaMet = encodedCount >= targetCount;
    const remainingCount = Math.max(0, targetCount - encodedCount);

    return {
      isQuotaMet,
      targetCount,
      encodedCount,
      remainingCount,
      schoolYear,
    };
  }

  /**
   * Checks whether a teacher has reached their overall authoring quota across all subjects.
   */
  async checkTeacherOverallQuota(teacherId: string, requestedYear?: string) {
    const progress = await this.getTeacherPersonalProgress(
      teacherId,
      requestedYear,
    );
    const isOverallQuotaMet =
      progress.overall.totalTarget > 0 && progress.overall.remainingCount === 0;

    return {
      isOverallQuotaMet,
      ...progress,
    };
  }
}

export const encodingTrackerService = new EncodingTrackerService();
