import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashBcrypt } from "../../utils/hash";
import { notifyAnalyticsUpdated } from "./analytics.service";
import {
  calculateSubjectProficiency,
  calculateReadinessScore,
  calculateStandingTier,
} from "../../utils/statsCalculator";

import { sendStudentCredentialsEmail } from "../mail.service";
import { StudyPlanService, createStudyPlanSchema } from "./studyPlan.service";
import {
  SubjectMasteryService,
  updateSubjectMasterySchema,
} from "./subjectMastery.service";
import {
  ExamResultService,
  recordExamResultSchema,
} from "./examResult.service";
import {
  AchievementService,
  awardAchievementSchema,
} from "./achievement.service";
import {
  LessonCompletionService,
  recordLessonCompletionSchema,
} from "./lessonCompletion.service";
import { assessmentService } from "../review-center/assessment.service";

// ============ Validation Schemas ============

export const createStudentSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().optional().default(""),
    confirmPassword: z.string().optional().default(""),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    location: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      Boolean(
        (data.name && data.name.trim().length > 0) ||
        (data.firstName && data.firstName.trim().length > 0) ||
        (data.lastName && data.lastName.trim().length > 0),
      ),
    {
      message: "First name and last name, or full name, are required",
      path: ["firstName"],
    },
  );

export const updateStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  location: z.string().optional(),
});

// ============ Type Definitions ============

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

// ============ Student Management Services ============

export class StudentService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Helper to resolve firstName, lastName, and fullName
   */
  private resolveNameParts(
    rawName?: string,
    rawFirst?: string,
    rawLast?: string,
  ) {
    let firstName = rawFirst?.trim() || "";
    let lastName = rawLast?.trim() || "";
    let name = rawName?.trim() || "";

    if (!name && (firstName || lastName)) {
      name = [firstName, lastName].filter(Boolean).join(" ").trim();
    } else if (name && !firstName && !lastName) {
      const parts = name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    } else if (firstName && lastName && !name) {
      name = `${firstName} ${lastName}`.trim();
    }

    return { name, firstName, lastName };
  }

  /**
   * Create a new student account
   */
  async createStudent(data: CreateStudentInput) {
    const parsed = createStudentSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const {
      email,
      password,
      name: rawName,
      firstName: rawFirst,
      lastName: rawLast,
      location,
    } = parsed.data;
    const { name, firstName, lastName } = this.resolveNameParts(
      rawName,
      rawFirst,
      rawLast,
    );

    const existingStudent = await this.db.user.findUnique({
      where: { email },
    });

    if (existingStudent) {
      throw new ApiError(400, "Email already registered");
    }

    const randomChars =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    const tempPassword =
      password && password.trim().length >= 6
        ? password.trim()
        : `BQ-STU-${randomChars}`;

    const hashedPass = await hashBcrypt(tempPassword);

    const newStudent = await this.db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPass,
        name: name || "Student",
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        location: location || "Philippines",
        verified: true,
        level: 1,
        xp: 0,
        streak: 0,
      },
    });

    notifyAnalyticsUpdated();

    sendStudentCredentialsEmail({
      toEmail: email.toLowerCase().trim(),
      name: name || "Student",
      password: tempPassword,
      studentId: newStudent.id,
    }).catch((err) => console.error("[StudentService] Email send error:", err));

    return {
      id: newStudent.id,
      email: newStudent.email,
      name: newStudent.name,
      firstName: (newStudent as any).firstName,
      lastName: (newStudent as any).lastName,
      level: newStudent.level,
      xp: newStudent.xp,
      streak: newStudent.streak,
      location: newStudent.location,
      createdAt: newStudent.createdAt,
    };
  }

  /**
   * Get all students with optional filters
   */
  async getAllStudents(options?: {
    search?: string;
    level?: string;
    location?: string;
    advisorId?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      search,
      level,
      location,
      advisorId,
      skip = 0,
      take = 50,
    } = options || {};

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ];
    }

    if (level && level !== "ALL") {
      if (level === "1") where.level = 1;
      else if (level === "2") where.level = 2;
      else if (level === "3") where.level = 3;
      else if (level === "4+") where.level = { gte: 4 };
    }

    if (location && location !== "ALL") {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (advisorId) {
      where.guidanceAssignments = {
        some: {
          advisorId,
        },
      };
    }

    let students = await this.db.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        level: true,
        xp: true,
        streak: true,
        location: true,
        equippedItem: true,
        createdAt: true,
        studyPlans: {
          select: {
            id: true,
            subject: true,
            startDate: true,
            endDate: true,
            targetDate: true,
          },
        },
        achievements: {
          orderBy: { timestamp: "desc" },
          take: 5,
        },
        mastery: true,
        examResults: {
          orderBy: { timestamp: "desc" },
        },
        userBadges: {
          include: {
            badge: true,
          },
          orderBy: { unlockedAt: "desc" },
        },
        guidanceAssignments: {
          select: {
            id: true,
            advisorId: true,
            status: true,
            subjectCategory: true,
            reason: true,
            advisor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await this.db.user.count({ where });

    // Fetch batch UserSettings for these students from MongoDB collection
    const studentIds = students.map((s: any) => s.id);
    const userSettingsMap = new Map<string, any>();
    if (studentIds.length > 0) {
      try {
        const rawSettings: any = await this.db.$runCommandRaw({
          find: "UserSettings",
          filter: { userId: { $in: studentIds } },
        });
        const batch = rawSettings?.cursor?.firstBatch || [];
        for (const item of batch) {
          if (item?.userId) {
            userSettingsMap.set(item.userId, {
              ...item,
              id: item._id?.toString?.() || item._id,
              targetExamDate: item.targetExamDate ? new Date(item.targetExamDate).toISOString() : null,
            });
          }
        }
      } catch (err) {
        // Silently continue if collection is not yet populated
      }
    }

    // Ensure deactivated badges are stripped out and attach target period info
    const sanitizedStudents = students.map((s: any) => {
      const settings = userSettingsMap.get(s.id) || null;
      const plans = (s.studyPlans || []).map((p: any) => ({
        ...p,
        endDate: p.endDate || p.targetDate,
      }));

      // Calculate active objective milestone
      const now = new Date();
      const futurePlans = plans
        .filter((p: any) => p.endDate && new Date(p.endDate) >= now)
        .sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      const activeObj = futurePlans.length > 0 ? futurePlans[0] : (plans[0] || null);

      return {
        ...s,
        userSettings: settings,
        activeObjective: activeObj,
        userBadges: (s.userBadges || []).filter(
          (ub: any) => !ub.badge || ub.badge.isActive !== false,
        ),
      };
    });

    return {
      data: sanitizedStudents,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Helper to calculate technical performance, pointing scorecard, accuracy history,
   * and study target periods matching BoardQuesters algorithms.
   */
  private computePerformanceAndTargets(student: any, userSettings: any, dbSubjects?: any[]) {
    const OFFICIAL_DISCIPLINES = [
      "Clinical Chemistry",
      "Microbiology",
      "Hematology",
      "Immunology & Serology and Immunohematology",
      "Clinical Microscopy & Parasitology",
      "Histopathology and Medtech Laws",
    ];

    const dbSubjectNames = Array.isArray(dbSubjects) && dbSubjects.length > 0
      ? dbSubjects
          .filter((s: any) => {
            const lower = (s.name || "").toLowerCase().trim();
            const isOfficial = OFFICIAL_DISCIPLINES.some(
              (o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower)
            );
            const hasModules = Array.isArray(s.modules) && s.modules.some((m: any) => m.isPublished !== false);
            return isOfficial || hasModules;
          })
          .map((s: any) => s.name)
      : null;

    const STANDARD_SUBJECTS = (dbSubjectNames && dbSubjectNames.length > 0)
      ? dbSubjectNames
      : OFFICIAL_DISCIPLINES;

    const RADAR_LABELS: Record<string, string> = {
      "Clinical Chemistry": "Chemistry",
      "Hematology": "Hematology",
      "Microbiology": "Microbiology",
      "Immunology & Serology and Immunohematology": "Immunochem",
      "Clinical Microscopy & Parasitology": "Microscopy",
      "Histopathology & MT Laws": "Histopath",
      "Histopathology and Medtech Laws": "Histopath",
    };

    const CURRICULUM_LESSONS_MAP: Record<string, number> = {
      "Clinical Chemistry": 2,
      "Hematology": 2,
      "Microbiology": 2,
      "Immunology & Serology and Immunohematology": 2,
      "Clinical Microscopy & Parasitology": 2,
      "Histopathology & MT Laws": 2,
      "Histopathology and Medtech Laws": 2,
    };

    if (Array.isArray(dbSubjects) && dbSubjects.length > 0) {
      dbSubjects.forEach((sub: any) => {
        const count = Array.isArray(sub.modules) ? sub.modules.filter((m: any) => m.isPublished !== false).length : 0;
        if (count > 0) {
          CURRICULUM_LESSONS_MAP[sub.name] = count;
        }
      });
    }

    const normalize = (name: string) => {
      const lower = (name || "").toLowerCase();
      if (lower.includes("chem")) return "Clinical Chemistry";
      if (lower.includes("hemat")) return "Hematology";
      if (lower.includes("microb")) return "Microbiology";
      if (lower.includes("immuno") || lower.includes("serolog") || lower.includes("blood bank")) {
        return "Immunology & Serology and Immunohematology";
      }
      if (lower.includes("microscop") || lower.includes("parasit") || lower.includes("urinalysis")) {
        return "Clinical Microscopy & Parasitology";
      }
      if (lower.includes("histo") || lower.includes("law")) {
        return "Histopathology and Medtech Laws";
      }
      return name;
    };

    const allCompletions = student.lessonCompletions || [];
    const allExamResults = student.examResults || [];
    const allMastery = student.mastery || [];
    const allAchievements = student.achievements || [];
    const allStudyPlans = (student.studyPlans || []).map((sp: any) => ({
      ...sp,
      startDate: sp.startDate ? new Date(sp.startDate).toISOString() : (sp.createdAt ? new Date(sp.createdAt).toISOString() : new Date().toISOString()),
      endDate: sp.endDate ? new Date(sp.endDate).toISOString() : (sp.targetDate ? new Date(sp.targetDate).toISOString() : new Date().toISOString()),
      targetDate: sp.targetDate ? new Date(sp.targetDate).toISOString() : (sp.endDate ? new Date(sp.endDate).toISOString() : new Date().toISOString()),
    }));

    // 1. Compute Subject Metrics
    const subjectMetrics = STANDARD_SUBJECTS.map((subjectName) => {
      const normSubject = subjectName.trim().toLowerCase();
      const totalLessons = CURRICULUM_LESSONS_MAP[subjectName] || 2;

      const completedCount = allCompletions.filter((c: any) => {
        const s = (c.subject || "").trim().toLowerCase();
        return (s === normSubject || s.includes(normSubject) || normSubject.includes(s)) && c.status === "completed";
      }).length;

      const completion = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      const matchedExams = allExamResults.filter((e: any) => {
        const s = normalize(e.subject || "");
        return s === subjectName;
      });

      const totalQAnswered = matchedExams.reduce((sum: number, r: any) => sum + (r.total || 0), 0);
      const totalCorrect = matchedExams.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
      const rawAccuracy = totalQAnswered > 0 ? (totalCorrect / totalQAnswered) * 100 : 0;

      const volumeWeight = Math.min(1.0, totalQAnswered / 100);

      const dbMasteryRecord = allMastery.find((m: any) => normalize(m.subject || "") === subjectName);

      const { proficiency, status } = calculateSubjectProficiency({
        dbMastery: dbMasteryRecord,
        exams: matchedExams,
        completedLessons: completedCount,
        totalLessons,
      });

      // BoardQuesters pointing formula: 25 Pts per correct question answered + 6 Pts per % completion (capped at 1,200 max)
      const points = Math.min(1200, Math.round(totalCorrect * 25 + completion * 6));

      return {
        subject: subjectName,
        shortName: subjectName.split(" ")[0],
        radarLabel: RADAR_LABELS[subjectName] || subjectName.split(" ")[0],
        completion,
        mastery: Math.round(rawAccuracy),
        proficiency,
        totalQuestionsAnswered: totalQAnswered,
        totalCorrect,
        masteryStatus: status,
        status,
        points,
      };
    });

    // 2. Compute pointing system totals
    const disciplinePoints = subjectMetrics.reduce((acc, m) => acc + (m.points || 0), 0);
    const totalPoints = disciplinePoints + (student.xp || 0);
    const avgProficiency = calculateReadinessScore(subjectMetrics);
    const avgCompletion = subjectMetrics.length > 0
      ? Math.round(subjectMetrics.reduce((acc, m) => acc + m.completion, 0) / subjectMetrics.length)
      : 0;
    const masteredCount = subjectMetrics.filter((m) => m.status === "Mastered").length;

    // Standing Tier
    const tierStanding = calculateStandingTier(avgProficiency, totalPoints);

    // 3. Compute Accuracy History Bar Chart Data
    const accuracyHistory = STANDARD_SUBJECTS.map((subName) => {
      const canonical = normalize(subName);
      const relevantExams = allExamResults.filter((e: any) => normalize(e.subject || "") === canonical);
      const relevantAchievements = allAchievements.filter(
        (a: any) => normalize(a.subject || "") === canonical && a.accuracy !== null && a.accuracy !== undefined,
      );

      let avgAcc = 0;
      let attemptCount = relevantExams.length;
      const totalScore = relevantExams.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
      const totalQuestions = relevantExams.reduce((sum: number, r: any) => sum + (r.total || 0), 0);

      if (relevantExams.length > 0) {
        const sumAcc = relevantExams.reduce((sum: number, r: any) => sum + (r.accuracy || 0), 0);
        avgAcc = Math.round(sumAcc / relevantExams.length);
      } else if (relevantAchievements.length > 0) {
        const sumAcc = relevantAchievements.reduce((sum: number, a: any) => sum + (a.accuracy || 0), 0);
        avgAcc = Math.round(sumAcc / relevantAchievements.length);
        attemptCount = relevantAchievements.length;
      }

      return {
        subject: RADAR_LABELS[canonical] || canonical.split(" ")[0],
        fullSubjectName: canonical,
        avgAccuracy: avgAcc,
        attemptCount,
        totalScore,
        totalQuestions,
      };
    });

    // 4. Compute Active Mission Objective Milestone
    const now = new Date();
    const futurePlans = allStudyPlans
      .filter((p: any) => new Date(p.endDate || p.targetDate || p.createdAt) >= now)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.endDate || a.targetDate || a.createdAt).getTime();
        const dateB = new Date(b.endDate || b.targetDate || b.createdAt).getTime();
        return dateA - dateB;
      });

    const activePlan = futurePlans.length > 0 ? futurePlans[0] : (allStudyPlans[0] || null);

    let activeObjective: any = null;
    if (activePlan) {
      const targetEndDate = new Date(activePlan.endDate || activePlan.targetDate || activePlan.createdAt);
      const diffDays = Math.max(
        0,
        Math.ceil((targetEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const matchedMetric = subjectMetrics.find((m) => normalize(m.subject) === normalize(activePlan.subject));

      activeObjective = {
        id: typeof activePlan.id === "object" && activePlan.id ? activePlan.id.toString() : String(activePlan.id || ""),
        subject: activePlan.subject,
        startDate: activePlan.startDate,
        endDate: activePlan.endDate,
        targetDate: activePlan.targetDate,
        daysRemaining: diffDays,
        mastery: matchedMetric?.proficiency ?? matchedMetric?.mastery ?? 0,
        completion: matchedMetric?.completion ?? 0,
        status: matchedMetric?.status ?? "In Training",
      };
    }

    return {
      userSettings: userSettings || {
        userId: student.id,
        focusSubject: "none",
        targetExamDate: null,
        targetBatch: "",
        school: "",
        dailyQuota: 50,
        defaultDifficulty: "MEDIUM",
      },
      studyPlans: allStudyPlans,
      subjectMetrics,
      accuracyHistory,
      scorecardSummary: {
        totalPoints,
        disciplinePoints,
        avgProficiency: Number(avgProficiency.toFixed(1)),
        avgCompletion,
        masteredCount,
        totalSubjects: STANDARD_SUBJECTS.length,
        tierStanding,
      },
      activeObjective,
    };
  }

  /**
   * Get student profile by ID with full performance and game target period data
   */
  async getStudentById(studentId: string) {
    if (
      !studentId ||
      typeof studentId !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(studentId)
    ) {
      throw new ApiError(404, "Student not found");
    }

    try {
      const student = await this.db.user.findUnique({
        where: { id: studentId },
        include: {
          mastery: true,
          achievements: {
            orderBy: { timestamp: "desc" },
          },
          examResults: {
            orderBy: { timestamp: "desc" },
          },
          studyPlans: {
            orderBy: { createdAt: "asc" },
          },
          lessonCompletions: true,
          userBadges: {
            include: {
              badge: true,
            },
            orderBy: { unlockedAt: "desc" },
          },
          guidanceAssignments: {
            include: {
              advisor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!student) {
        throw new ApiError(404, "Student not found");
      }
      const { password: _password, ...sanitizedStudent } = student;

      // Filter out any deactivated badges on the backend level
      if (
        sanitizedStudent.userBadges &&
        Array.isArray(sanitizedStudent.userBadges)
      ) {
        sanitizedStudent.userBadges = sanitizedStudent.userBadges.filter(
          (ub: any) => !ub.badge || ub.badge.isActive !== false,
        );
      }

      // Fetch UserSettings from MongoDB collection directly
      let userSettings: any = null;
      try {
        const rawSettings: any = await this.db.$runCommandRaw({
          find: "UserSettings",
          filter: { userId: studentId },
        });
        if (rawSettings?.cursor?.firstBatch?.length > 0) {
          const item = rawSettings.cursor.firstBatch[0];
          userSettings = {
            ...item,
            id: item._id?.toString?.() || item._id,
            targetExamDate: item.targetExamDate ? new Date(item.targetExamDate).toISOString() : null,
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
          };
        }
      } catch (err) {
        // Silently fallback if UserSettings is not present
      }

      // Fetch StudyPlans from MongoDB collection directly
      try {
        const rawPlansResult: any = await this.db.$runCommandRaw({
          find: "StudyPlan",
          filter: { userId: studentId },
        });
        const batch = rawPlansResult?.cursor?.firstBatch || [];
        if (batch.length > 0) {
          sanitizedStudent.studyPlans = batch.map((p: any) => ({
            id: p._id?.toString?.() || p._id?.$oid || p._id,
            userId: p.userId,
            subject: p.subject,
            startDate: p.startDate?.$date ? new Date(p.startDate.$date).toISOString() : (p.startDate ? new Date(p.startDate).toISOString() : new Date().toISOString()),
            endDate: p.endDate?.$date ? new Date(p.endDate.$date).toISOString() : (p.endDate ? new Date(p.endDate).toISOString() : new Date().toISOString()),
            targetDate: p.endDate?.$date ? new Date(p.endDate.$date).toISOString() : (p.endDate ? new Date(p.endDate).toISOString() : new Date().toISOString()),
            createdAt: p.createdAt?.$date ? new Date(p.createdAt.$date).toISOString() : new Date().toISOString(),
            updatedAt: p.updatedAt?.$date ? new Date(p.updatedAt.$date).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        // Silently fallback to prisma studyPlans
      }

      // Fetch real subjects from database
      const dbSubjects = await this.db.subject.findMany({
        select: { id: true, name: true, modules: { select: { id: true, isPublished: true } } },
        orderBy: { createdAt: "asc" },
      });

      // Compute performance metrics and target periods matching BoardQuesters
      const performanceData = this.computePerformanceAndTargets(sanitizedStudent, userSettings, dbSubjects);

      // Fetch Review Center candidate transcript if enrolled
      let reviewCenterTranscript: any = null;
      try {
        const candidate = await (this.db as any).reviewCenterCandidate.findFirst({
          where: {
            OR: [
              { studentId: student.id },
              { email: { equals: student.email, mode: "insensitive" } },
            ],
          },
        });

        if (candidate) {
          reviewCenterTranscript = await assessmentService.getCandidateScoreTranscript(
            candidate.id,
            "",
          );
        }
      } catch (err) {
        // Silently fallback if review center scores unavailable
      }

      return {
        ...sanitizedStudent,
        ...performanceData,
        reviewCenterTranscript,
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(404, "Student not found");
    }
  }

  /**
   * Update student profile
   */
  async updateStudent(data: UpdateStudentInput) {
    const parsed = updateStudentSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const {
      studentId,
      name: rawName,
      firstName: rawFirst,
      lastName: rawLast,
      location,
    } = parsed.data;

    const existingStudent = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new ApiError(404, "Student not found");
    }

    const updateData: any = {};
    if (rawFirst !== undefined) updateData.firstName = rawFirst.trim();
    if (rawLast !== undefined) updateData.lastName = rawLast.trim();

    if (rawName !== undefined && rawName.trim().length > 0) {
      updateData.name = rawName.trim();
    } else if (rawFirst !== undefined || rawLast !== undefined) {
      const effectiveFirst =
        rawFirst !== undefined
          ? rawFirst.trim()
          : (existingStudent as any).firstName || "";
      const effectiveLast =
        rawLast !== undefined
          ? rawLast.trim()
          : (existingStudent as any).lastName || "";
      const combined = [effectiveFirst, effectiveLast]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (combined) {
        updateData.name = combined;
      }
    }

    if (location) updateData.location = location.trim();

    const updatedStudent = await this.db.user.update({
      where: { id: studentId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        level: true,
        xp: true,
        streak: true,
        location: true,
      },
    });

    return updatedStudent;
  }

  /**
   * Delete student account
   */
  async deleteStudent(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    await this.db.user.delete({
      where: { id: studentId },
    });

    notifyAnalyticsUpdated();

    return { message: "Student deleted successfully" };
  }

  /**
   * Get student statistics (level, XP, streak)
   */
  async getStudentStats(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        level: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const totalAchievements = await this.db.achievement.count({
      where: { userId: studentId },
    });

    const totalXPEarned = await this.db.achievement.aggregate({
      where: { userId: studentId },
      _sum: {
        xp: true,
      },
    });

    return {
      ...student,
      totalAchievements,
      totalXPEarned: totalXPEarned._sum.xp || 0,
    };
  }

  /**
   * Bulk create / enroll students from CSV
   */
  async bulkCreateStudents(
    students: Array<{
      name?: string;
      firstName?: string;
      lastName?: string;
      email: string;
      location?: string;
      program?: string;
      yearLevel?: string;
    }>,
  ) {
    if (!Array.isArray(students) || students.length === 0) {
      throw new ApiError(400, "No student entries provided for import.");
    }

    const createdStudents: any[] = [];
    const errors: Array<{ email: string; name: string; error: string }> = [];

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      const { name, firstName, lastName } = this.resolveNameParts(
        item.name,
        item.firstName,
        item.lastName,
      );
      const email = item.email?.trim().toLowerCase();

      if (!name || !email) {
        errors.push({
          email: email || "unknown",
          name: name || "unknown",
          error: "Name and Email are required fields.",
        });
        continue;
      }

      const existing = await this.db.user.findUnique({
        where: { email },
      });

      if (existing) {
        errors.push({ email, name, error: "Email already registered." });
        continue;
      }

      const randomChars =
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      const tempPassword = `BQ-STU-${randomChars}`;

      try {
        const hash = await hashBcrypt(tempPassword);
        const newStudent = await this.db.user.create({
          data: {
            email,
            password: hash,
            name,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            location: item.location?.trim() || "Philippines",
            verified: true,
            level: 1,
            xp: 0,
            streak: 0,
          },
        });

        sendStudentCredentialsEmail({
          toEmail: email,
          name,
          password: tempPassword,
          studentId: newStudent.id,
        }).catch((err) =>
          console.error("[BulkStudentImport] Email send error:", err),
        );

        const { password, ...sanitized } = newStudent;
        createdStudents.push(sanitized);
      } catch (err: any) {
        errors.push({
          email,
          name,
          error: err.message || "Failed to enroll student",
        });
      }
    }

    if (createdStudents.length > 0) {
      notifyAnalyticsUpdated();
    }

    return {
      totalProcessed: students.length,
      createdCount: createdStudents.length,
      skippedCount: errors.length,
      createdStudents,
      errors,
    };
  }
}

// ============ Service Instantiations ============

export const studentService = new StudentService();
export const studyPlanService = new StudyPlanService();
export const subjectMasteryService = new SubjectMasteryService();
export const examResultService = new ExamResultService();
export const achievementService = new AchievementService();
export const lessonCompletionService = new LessonCompletionService();

// ============ Re-exports for Backward Compatibility ============

export const createStudent = studentService.createStudent.bind(studentService);
export const getAllStudents =
  studentService.getAllStudents.bind(studentService);
export const getStudentById =
  studentService.getStudentById.bind(studentService);
export const updateStudent = studentService.updateStudent.bind(studentService);
export const deleteStudent = studentService.deleteStudent.bind(studentService);
export const getStudentStats =
  studentService.getStudentStats.bind(studentService);
export const bulkCreateStudents =
  studentService.bulkCreateStudents.bind(studentService);

export const createStudyPlan =
  studyPlanService.createStudyPlan.bind(studyPlanService);
export const getStudyPlans =
  studyPlanService.getStudyPlans.bind(studyPlanService);
export const deleteStudyPlan =
  studyPlanService.deleteStudyPlan.bind(studyPlanService);

export const updateSubjectMastery =
  subjectMasteryService.updateSubjectMastery.bind(subjectMasteryService);
export const getSubjectMastery = subjectMasteryService.getSubjectMastery.bind(
  subjectMasteryService,
);

export const recordExamResult =
  examResultService.recordExamResult.bind(examResultService);
export const getExamResults =
  examResultService.getExamResults.bind(examResultService);
export const getExamResultStats =
  examResultService.getExamResultStats.bind(examResultService);

export const awardAchievement =
  achievementService.awardAchievement.bind(achievementService);
export const getAchievements =
  achievementService.getAchievements.bind(achievementService);

export const recordLessonCompletion =
  lessonCompletionService.recordLessonCompletion.bind(lessonCompletionService);
export const getLessonCompletions =
  lessonCompletionService.getLessonCompletions.bind(lessonCompletionService);
export const getLessonCompletionProgress =
  lessonCompletionService.getLessonCompletionProgress.bind(
    lessonCompletionService,
  );

// ============ Re-exports of Schemas and Types ============
export {
  createStudyPlanSchema,
  StudyPlanService,
  updateSubjectMasterySchema,
  SubjectMasteryService,
  recordExamResultSchema,
  ExamResultService,
  awardAchievementSchema,
  AchievementService,
  recordLessonCompletionSchema,
  LessonCompletionService,
};

export type { CreateStudyPlanInput } from "./studyPlan.service";
export type { UpdateSubjectMasteryInput } from "./subjectMastery.service";
export type { RecordExamResultInput } from "./examResult.service";
export type { AwardAchievementInput } from "./achievement.service";
export type { RecordLessonCompletionInput } from "./lessonCompletion.service";
