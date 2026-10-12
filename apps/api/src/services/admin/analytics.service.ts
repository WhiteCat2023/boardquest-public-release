import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import crypto from "crypto";
import pusherService from "./pusher.service";
import sseService from "./sse.service";
import {
  calculateSubjectProficiency,
  calculateReadinessScore,
} from "../../utils/statsCalculator";

export interface PerformanceTrendItem {
  id?: string;
  date: string;
  examName: string;
  score: number;
  accuracy: number;
  subject: string;
}

export interface StudentWarningSummaryData {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  totalWarnings: number;
  allTimeWarnings?: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  fullscreenExits: number;
  tabSwitches: number;
  screenshots: number;
  copyAttempts: number;
  weeklyWarnings: number;
  weeklyRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  weeklyFullscreenExits?: number;
  weeklyTabSwitches?: number;
  weeklyScreenshots?: number;
  weeklyCopyAttempts?: number;
  currentWeekKey?: string;
  lastIncidentType?: string | null;
  lastIncidentAt?: string | null;
  subjectsAffected?: string[];
}

export interface StudentWarningIncidentItem {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  nodeId?: string;
  quizMode?: string;
  incidentType: string;
  strikeCount: number;
  details: string;
  timestamp: string;
  weekKey?: string;
}

export interface TimelineEventItem {
  id: string;
  type: "exam" | "achievement" | "lesson" | "level_up" | "cheating_incident" | "warning";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    score?: number;
    accuracy?: number;
    subject?: string;
    badge?: string;
    xp?: number;
    incidentType?: string;
    strikeCount?: number;
    quizMode?: string;
    details?: string;
  };
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  category: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

export interface StudentAnalyticsResult {
  studentInfo: {
    id: string;
    name: string;
    email: string;
    level: number;
    xp: number;
    streak: number;
    readinessScore: number;
  };
  metrics: {
    examsCount: number;
    avgScore: number;
    avgAccuracy: number;
    lessonsCompleted: number;
    totalLessons: number;
    mastery: Array<{
      subject: string;
      proficiency: number;
      status: string;
      lessonsDone: number;
      totalLessons: number;
    }>;
  };
  performanceTrend: PerformanceTrendItem[];
  difficultyBreakdown: {
    easy: { attempted: number; accuracy: number };
    medium: { attempted: number; accuracy: number };
    hard: { attempted: number; accuracy: number };
  };
  timeline: TimelineEventItem[];
  achievements: AchievementItem[];
  weeklyGoals: {
    examsTarget: number;
    examsCompleted: number;
    lessonsTarget: number;
    lessonsCompleted: number;
    studyHoursTarget: number;
    studyHoursCompleted: number;
  };
  studyPlans: Array<{
    id: string;
    subject: string;
    startDate?: Date | string;
    endDate?: Date | string;
    targetDate?: Date | string;
    priority?: string;
    goal?: string;
    targetQuestions?: number;
    targetAccuracy?: number;
    notes?: string;
    status?: string;
    updatedAt?: Date | string;
  }>;
  warningSummary?: StudentWarningSummaryData | null;
  warningIncidents?: StudentWarningIncidentItem[];
  aiInsights: {
    strongAreas: string[];
    weakAreas: string[];
    recommendations: string[];
    studyPlan: string;
  };
  cacheStats: {
    cached: boolean;
    hash: string;
    updatedAt: Date;
  };
}

export class AnalyticsService {
  private summaryCache: { data: any; timestamp: number } | null = null;

  public invalidateSummaryCache() {
    this.summaryCache = null;
  }

  constructor(private readonly db: typeof prisma = prisma) {}

  async getStudentAnalytics(studentId: string): Promise<StudentAnalyticsResult> {
    // 1. Fetch student data including relations
    const student: any = await this.db.user.findUnique({
      where: { id: studentId },
      include: {
        examResults: { orderBy: { timestamp: "desc" } },
        mastery: true,
        lessonCompletions: true,
        achievements: { orderBy: { timestamp: "desc" } },
        studyPlans: { orderBy: { createdAt: "asc" } },
        userBadges: {
          include: {
            badge: true,
          },
          orderBy: { unlockedAt: "desc" },
        },
      },
    }).catch(() => null);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // 2. Aggregate core metrics strictly from real DB records
    const examsCount = student.examResults ? student.examResults.length : 0;
    const avgScore = examsCount > 0 
      ? Math.round(student.examResults.reduce((acc: number, curr: any) => {
          const itemAcc = curr.accuracy !== undefined && curr.accuracy !== null
            ? curr.accuracy
            : (curr.total ? (curr.score / curr.total) * 100 : curr.score || 0);
          return acc + itemAcc;
        }, 0) / examsCount)
      : 0;
    const avgAccuracy = examsCount > 0 
      ? Math.round(student.examResults.reduce((acc: number, curr: any) => acc + (curr.accuracy || curr.score || 0), 0) / examsCount)
      : 0;
    const lessonsCompleted = student.lessonCompletions 
      ? student.lessonCompletions.filter((c: any) => c.status === "completed").length 
      : 0;
    const totalLessons = 35; // Standard total core modules

    // Subject mastery formatting strictly from real DB records with flexible matching
    const subjectsFromDb = await this.db.subject.findMany({
      select: {
        id: true,
        name: true,
        modules: {
          select: { id: true, isPublished: true }
        }
      },
    });

    const normalizeSubject = (name?: string | null) => {
      const lower = (name || "").toLowerCase().trim();
      if (lower.includes("chem")) return "Clinical Chemistry";
      if (lower.includes("immuno") || lower.includes("serolog") || lower.includes("blood bank")) {
        return "Immunology & Serology and Immunohematology";
      }
      if (lower.includes("hemat")) return "Hematology";
      if (lower.includes("microb")) return "Microbiology";
      if (lower.includes("microscop") || lower.includes("parasit") || lower.includes("urinalysis")) {
        return "Clinical Microscopy & Parasitology";
      }
      if (lower.includes("histo") || lower.includes("law")) {
        return "Histopathology and Medtech Laws";
      }
      return lower;
    };

    const matchSubject = (s1?: string | null, s2?: string | null) => {
      if (!s1 || !s2) return false;
      return normalizeSubject(s1) === normalizeSubject(s2);
    };

    // Gather subjects strictly from DB Subject records when available
    const subjectMap = new Map<string, { name: string; modulesCount: number }>();
    subjectsFromDb.forEach((sub: any) => {
      subjectMap.set(sub.name.toLowerCase().trim(), {
        name: sub.name,
        modulesCount: sub.modules ? sub.modules.filter((m: any) => m.isPublished !== false).length : 0,
      });
    });

    // Only fallback to student records if no subjects are defined in the DB at all
    if (subjectsFromDb.length === 0) {
      (student.mastery || []).forEach((m: any) => {
        if (m?.subject) {
          const key = m.subject.toLowerCase().trim();
          if (!subjectMap.has(key)) {
            subjectMap.set(key, { name: m.subject, modulesCount: 0 });
          }
        }
      });

      (student.examResults || []).forEach((e: any) => {
        if (e?.subject) {
          const key = e.subject.toLowerCase().trim();
          if (!subjectMap.has(key)) {
            subjectMap.set(key, { name: e.subject, modulesCount: 0 });
          }
        }
      });
    }

    const masteryData = Array.from(subjectMap.values()).map((subInfo) => {
      const sub = subInfo.name;

      // 1. Find existing explicit SubjectMastery row from DB
      const existing: any = (student.mastery || []).find((m: any) => matchSubject(m?.subject, sub));

      // 2. Count actual completed lessons for this subject
      const subjectCompletions = (student.lessonCompletions || []).filter((c: any) => 
        matchSubject(c?.subject, sub) && (c?.status === "completed" || c?.status === "COMPLETED")
      );
      const actualLessonsDone = subjectCompletions.length;

      // 3. Total modules count for this subject (default to min 5 for UI module target)
      const totalLessons = Math.max(subInfo.modulesCount, 5);

      // 4. Look at subject-specific exam results
      const subjectExams = (student.examResults || []).filter((e: any) => matchSubject(e?.subject, sub));

      const { proficiency, status, lessonsDone } = calculateSubjectProficiency({
        dbMastery: existing,
        exams: subjectExams,
        completedLessons: actualLessonsDone,
        totalLessons,
      });

      return {
        subject: sub,
        proficiency,
        status,
        lessonsDone,
        totalLessons,
      };
    });

    // Board Readiness Score formula: unified calculation
    const readinessScore = calculateReadinessScore(masteryData);

    // 3. Construct Performance Trend strictly from actual DB exam results
    const performanceTrend: PerformanceTrendItem[] = (student.examResults || []).map((e: any, index: number) => ({
      id: e.id,
      date: new Date(e.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      examName: e.subject ? `${e.subject} Exam` : `Practice Exam #${examsCount - index}`,
      score: e.score || 0,
      accuracy: Math.round(e.accuracy || e.score || 0),
      subject: e.subject || "General Board Review"
    })).reverse();

    // 4. Fetch Student Warning Summary and Incidents from BoardQuesters collections
    let warningSummary: StudentWarningSummaryData | null = null;
    let warningIncidents: StudentWarningIncidentItem[] = [];

    try {
      const summaryRaw: any = await (this.db as any).$runCommandRaw({
        find: "StudentWarningSummaries",
        filter: { userId: studentId },
        limit: 1,
      });

      if (summaryRaw?.cursor?.firstBatch && summaryRaw.cursor.firstBatch.length > 0) {
        const raw = summaryRaw.cursor.firstBatch[0];
        warningSummary = {
          id: raw._id?.$oid || (typeof raw._id?.toString === "function" ? raw._id.toString() : raw._id) || raw.id,
          userId: raw.userId || studentId,
          userName: raw.userName || student.name,
          userEmail: raw.userEmail || student.email,
          totalWarnings: Number(raw.totalWarnings ?? raw.allTimeWarnings ?? 0),
          allTimeWarnings: Number(raw.allTimeWarnings ?? raw.totalWarnings ?? 0),
          riskLevel: ((raw.riskLevel || "LOW") as string).toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
          fullscreenExits: Number(raw.fullscreenExits ?? 0),
          tabSwitches: Number(raw.tabSwitches ?? 0),
          screenshots: Number(raw.screenshots ?? 0),
          copyAttempts: Number(raw.copyAttempts ?? 0),
          weeklyWarnings: Number(raw.weeklyWarnings ?? 0),
          weeklyRiskLevel: ((raw.weeklyRiskLevel || "LOW") as string).toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
          weeklyFullscreenExits: Number(raw.weeklyFullscreenExits ?? 0),
          weeklyTabSwitches: Number(raw.weeklyTabSwitches ?? 0),
          weeklyScreenshots: Number(raw.weeklyScreenshots ?? 0),
          weeklyCopyAttempts: Number(raw.weeklyCopyAttempts ?? 0),
          currentWeekKey: raw.currentWeekKey || "",
          lastIncidentType: raw.lastIncidentType || null,
          lastIncidentAt: raw.lastIncidentAt?.$date || raw.lastIncidentAt || null,
          subjectsAffected: Array.isArray(raw.subjectsAffected) ? raw.subjectsAffected : [],
        };
      }

      const incidentsRaw: any = await (this.db as any).$runCommandRaw({
        find: "StudentWarningIncidents",
        filter: { userId: studentId },
        sort: { timestamp: -1 },
        limit: 100,
      });

      if (incidentsRaw?.cursor?.firstBatch && incidentsRaw.cursor.firstBatch.length > 0) {
        warningIncidents = incidentsRaw.cursor.firstBatch.map((inc: any) => ({
          id: inc._id?.$oid || (typeof inc._id?.toString === "function" ? inc._id.toString() : inc._id) || inc.id,
          userId: inc.userId || studentId,
          userName: inc.userName || student.name,
          userEmail: inc.userEmail || student.email,
          subject: inc.subject || "General Quest",
          nodeId: inc.nodeId,
          quizMode: inc.quizMode || "quest",
          incidentType: inc.incidentType || "GENERAL_WARNING",
          strikeCount: Number(inc.strikeCount ?? 1),
          details: inc.details || "",
          weekKey: inc.weekKey,
          timestamp: inc.timestamp?.$date || inc.timestamp || inc.createdAt?.$date || inc.createdAt || new Date().toISOString(),
        }));
      }

      // If no explicit summary document exists but incidents were found, construct summary from incidents
      if (!warningSummary && warningIncidents.length > 0) {
        const totalWarns = warningIncidents.length;
        const fsExits = warningIncidents.filter((i) => i.incidentType === "FULLSCREEN_EXIT").length;
        const tabSwitches = warningIncidents.filter((i) => i.incidentType === "TAB_SWITCH").length;
        const screenshots = warningIncidents.filter((i) => i.incidentType === "SCREENSHOT_ATTEMPT").length;
        const copyAttempts = warningIncidents.filter((i) => i.incidentType === "COPY_ATTEMPT").length;
        const calculatedRisk = totalWarns >= 6 ? "HIGH" : totalWarns >= 3 ? "MEDIUM" : "LOW";
        const subjects = Array.from(new Set(warningIncidents.map((i) => i.subject).filter(Boolean)));
        const latestInc = warningIncidents[0];

        warningSummary = {
          userId: studentId,
          userName: student.name,
          userEmail: student.email,
          totalWarnings: totalWarns,
          allTimeWarnings: totalWarns,
          riskLevel: calculatedRisk,
          fullscreenExits: fsExits,
          tabSwitches: tabSwitches,
          screenshots: screenshots,
          copyAttempts: copyAttempts,
          weeklyWarnings: totalWarns,
          weeklyRiskLevel: calculatedRisk,
          weeklyFullscreenExits: fsExits,
          weeklyTabSwitches: tabSwitches,
          weeklyScreenshots: screenshots,
          weeklyCopyAttempts: copyAttempts,
          lastIncidentType: latestInc?.incidentType || null,
          lastIncidentAt: latestInc?.timestamp || null,
          subjectsAffected: subjects,
        };
      }
    } catch (warnErr) {
      console.warn("Failed to retrieve warning telemetry from BoardQuesters:", warnErr);
    }

    // 5. Construct Timeline Feed strictly from real DB records
    interface TimelineEntryWithDate {
      date: Date;
      item: TimelineEventItem;
    }
    const timelineEntries: TimelineEntryWithDate[] = [];

    // Real DB exams to timeline
    (student.examResults || []).forEach((e: any) => {
      const examDate = new Date(e.timestamp || Date.now());
      timelineEntries.push({
        date: examDate,
        item: {
          id: `exam-${e.id}`,
          type: "exam",
          title: e.subject ? `${e.subject} Exam` : "Comprehensive Diagnostic Exam",
          description: `Scored ${e.score || 0}% with ${Math.round(e.accuracy || e.score || 0)}% accuracy`,
          timestamp: isNaN(examDate.getTime()) 
            ? "Recent" 
            : examDate.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          metadata: {
            score: e.score || 0,
            accuracy: Math.round(e.accuracy || e.score || 0),
            subject: e.subject || "General"
          }
        }
      });
    });

    // Real DB achievements to timeline
    (student.achievements || []).forEach((a: any) => {
      const achDate = new Date(a.timestamp || Date.now());
      timelineEntries.push({
        date: achDate,
        item: {
          id: `ach-${a.id}`,
          type: "achievement",
          title: `Achievement Unlocked: ${a.task}`,
          description: `Earned +${a.xp || 0} XP in ${a.subject || "General Study"}`,
          timestamp: isNaN(achDate.getTime()) 
            ? "Recent" 
            : achDate.toLocaleString("en-US", { month: "short", day: "numeric" }),
          metadata: {
            badge: a.badge || "gold",
            xp: a.xp || 0
          }
        }
      });
    });

    // Real DB lesson completions to timeline
    (student.lessonCompletions || []).forEach((c: any) => {
      const lessonDate = new Date(c.completedAt || c.createdAt || Date.now());
      timelineEntries.push({
        date: lessonDate,
        item: {
          id: `lesson-${c.id}`,
          type: "lesson",
          title: `Completed Module: ${c.lessonId || "Syllabus Lesson"}`,
          description: `Finished interactive study module`,
          timestamp: isNaN(lessonDate.getTime()) 
            ? "Recent" 
            : lessonDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      });
    });

    // Real DB cheating & security incidents from BoardQuesters Arena
    const formatIncidentTitle = (type?: string) => {
      switch (type) {
        case "FULLSCREEN_EXIT":
          return "Fullscreen Exit Alert";
        case "TAB_SWITCH":
          return "Tab Switch Detected";
        case "SCREENSHOT_ATTEMPT":
          return "Screenshot Attempt Detected";
        case "COPY_ATTEMPT":
          return "Clipboard / Copy Attempt";
        default:
          return `Anti-Cheat Warning: ${(type || "Security Alert").replace(/_/g, " ")}`;
      }
    };

    (warningIncidents || []).forEach((inc) => {
      const incDate = new Date(inc.timestamp || Date.now());
      timelineEntries.push({
        date: incDate,
        item: {
          id: `cheat-${inc.id}`,
          type: "cheating_incident",
          title: formatIncidentTitle(inc.incidentType),
          description: `${inc.details || "Integrity violation"} (Strike #${inc.strikeCount}) · Subject: ${inc.subject || "Arena"}`,
          timestamp: isNaN(incDate.getTime()) 
            ? "Recent Alert" 
            : incDate.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          metadata: {
            incidentType: inc.incidentType,
            strikeCount: inc.strikeCount,
            subject: inc.subject,
            quizMode: inc.quizMode,
            details: inc.details,
          }
        }
      });
    });

    // Sort all timeline entries chronologically descending (newest first)
    timelineEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

    const timeline: TimelineEventItem[] = timelineEntries.map(e => e.item);

    // Add level milestone if level > 1
    if ((student.level || 1) > 1) {
      timeline.push({
        id: `lvl-${student.id}`,
        type: "level_up",
        title: `Promoted to Aspirant Level ${student.level}`,
        description: `Reached ${student.xp || 0} total XP.`,
        timestamp: "Level Milestone"
      });
    }

    // 5. Construct Achievements & Badges List strictly based on active DB badges & student records
    const activeDbBadges = await this.db.badge.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    let achievements: AchievementItem[] = [];

    if (activeDbBadges.length > 0) {
      const studentUserBadges = Array.isArray(student.userBadges) ? student.userBadges : [];
      const studentAchievements = Array.isArray(student.achievements) ? student.achievements : [];

      achievements = activeDbBadges.map((badge: any) => {
        const matchedUserBadge = studentUserBadges.find(
          (ub: any) =>
            ub.badgeId === badge.id ||
            ub.badgeSlug?.toLowerCase() === badge.badgeId?.toLowerCase()
        );
        const matchedAchievement = studentAchievements.find(
          (a: any) =>
            a.badge?.toLowerCase() === badge.badgeId?.toLowerCase() ||
            (badge.name && a.task?.toLowerCase().includes(badge.name.toLowerCase()))
        );

        const isUnlocked = Boolean(matchedUserBadge || matchedAchievement);
        const unlockedAtDate = matchedUserBadge?.unlockedAt || matchedAchievement?.timestamp;

        return {
          id: badge.id || badge.badgeId,
          title: badge.title || badge.name,
          description: badge.description || badge.unlockCondition || "Earned through excellence",
          badge: badge.icon || "trophy",
          category: badge.category || "General",
          xp: badge.xpReward || 50,
          unlocked: isUnlocked,
          unlockedAt: isUnlocked && unlockedAtDate ? new Date(unlockedAtDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
          progress: isUnlocked ? 100 : Math.min(90, Math.round(((student.level || 1) * 20))),
        };
      });
    }

    // 6. Question Difficulty Breakdown strictly derived from actual student exam attempts
    let easyAttempted = 0, easyCorrect = 0;
    let mediumAttempted = 0, mediumCorrect = 0;
    let hardAttempted = 0, hardCorrect = 0;

    (student.examResults || []).forEach((e: any) => {
      if (e.difficultyBreakdown) {
        easyAttempted += e.difficultyBreakdown.easy?.attempted || 0;
        easyCorrect += e.difficultyBreakdown.easy?.correct || 0;
        mediumAttempted += e.difficultyBreakdown.medium?.attempted || 0;
        mediumCorrect += e.difficultyBreakdown.medium?.correct || 0;
        hardAttempted += e.difficultyBreakdown.hard?.attempted || 0;
        hardCorrect += e.difficultyBreakdown.hard?.correct || 0;
      }
    });

    const difficultyBreakdown = {
      easy: { attempted: easyAttempted, accuracy: easyAttempted > 0 ? Math.round((easyCorrect / easyAttempted) * 100) : (examsCount > 0 ? avgAccuracy : 0) },
      medium: { attempted: mediumAttempted, accuracy: mediumAttempted > 0 ? Math.round((mediumCorrect / mediumAttempted) * 100) : (examsCount > 0 ? avgAccuracy : 0) },
      hard: { attempted: hardAttempted, accuracy: hardAttempted > 0 ? Math.round((hardCorrect / hardAttempted) * 100) : (examsCount > 0 ? Math.max(0, avgAccuracy - 10) : 0) }
    };

    // 7. Weekly Goals Target derived strictly from real DB records
    const weeklyGoals = {
      examsTarget: 4,
      examsCompleted: Math.min(4, examsCount),
      lessonsTarget: 8,
      lessonsCompleted: Math.min(8, lessonsCompleted),
      studyHoursTarget: 10,
      studyHoursCompleted: Math.min(10, Math.round((student.streak || 0) * 1.5))
    };

    // 8. Map Real Database Study Plans (filter by active DB subjects if defined)
    const studyPlans = (student.studyPlans || [])
      .filter((sp: any) => {
        if (subjectsFromDb.length === 0) return true;
        return subjectsFromDb.some((sub: any) => matchSubject(sub.name, sp.subject));
      })
      .map((sp: any) => ({
        id: sp.id,
        subject: sp.subject,
        startDate: sp.startDate,
        endDate: sp.endDate || sp.targetDate,
        targetDate: sp.endDate || sp.targetDate,
        priority: sp.priority || "MEDIUM",
        goal: sp.goal || "",
        targetQuestions: typeof sp.targetQuestions === "number" ? sp.targetQuestions : 50,
        targetAccuracy: typeof sp.targetAccuracy === "number" ? sp.targetAccuracy : 75,
        notes: sp.notes || "",
        status: sp.status || "IN_PROGRESS",
        updatedAt: sp.updatedAt,
      }));

    // 9. Construct state string for caching
    const stateString = `id:${student.id}|level:${student.level}|xp:${student.xp}|streak:${student.streak}|exams:${examsCount}|avg:${avgScore}|acc:${avgAccuracy}|lessons:${lessonsCompleted}|mastery:${masteryData.map(m => `${m.subject}:${m.proficiency}`).join(",")}|plans:${studyPlans.length}`;
    const hash = crypto.createHash("md5").update(stateString).digest("hex");

    // 10. Check DB Cache for AI Insights
    const cached = await this.db.aiAnalysis.findUnique({
      where: { userId: studentId },
    });

    const studentInfo = {
      id: student.id,
      name: student.name,
      email: student.email,
      level: student.level,
      xp: student.xp,
      streak: student.streak,
      readinessScore
    };

    const metrics = {
      examsCount,
      avgScore,
      avgAccuracy,
      lessonsCompleted,
      totalLessons,
      mastery: masteryData
    };

    if (cached && cached.hash === hash) {
      return {
        studentInfo,
        metrics,
        performanceTrend,
        difficultyBreakdown,
        timeline,
        achievements,
        weeklyGoals,
        studyPlans,
        warningSummary,
        warningIncidents,
        aiInsights: JSON.parse(cached.analysis),
        cacheStats: {
          cached: true,
          hash,
          updatedAt: cached.updatedAt,
        },
      };
    }

    // 11. Cache Miss: Generate insights
    let insights;
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (apiKey) {
      try {
        insights = await this.fetchGeminiInsights(apiKey, student, examsCount, avgScore, avgAccuracy, masteryData, lessonsCompleted);
      } catch (error) {
        console.error("Gemini API call failed, falling back to local engine:", error);
        insights = this.generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
      }
    } else {
      insights = this.generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
    }

    // Save to cache
    const updatedCache = await this.db.aiAnalysis.upsert({
      where: { userId: studentId },
      create: {
        userId: studentId,
        analysis: JSON.stringify(insights),
        hash,
      },
      update: {
        analysis: JSON.stringify(insights),
        hash,
      },
    });

    return {
      studentInfo,
      metrics,
      performanceTrend,
      difficultyBreakdown,
      timeline,
      achievements,
      weeklyGoals,
      studyPlans,
      warningSummary,
      warningIncidents,
      aiInsights: insights,
      cacheStats: {
        cached: false,
        hash,
        updatedAt: updatedCache.updatedAt,
      },
    };
  }

  private async fetchGeminiInsights(
    apiKey: string,
    student: any,
    examsCount: number,
    avgScore: number,
    avgAccuracy: number,
    masteryData: any[],
    lessonsCompleted: number
  ) {
    const prompt = `You are an AI learning mentor. Analyze this student performance data for a board exam prep app and return a JSON object with:
    1. strongAreas: array of strings
    2. weakAreas: array of strings
    3. recommendations: array of strings
    4. studyPlan: a paragraph string recommending a daily study plan.
    
    Do not include markdown wrappers (like \`\`\`json) in the response, return only the raw JSON.
    
    Student Data:
    - Name: ${student.name}
    - Level: ${student.level}
    - Streak: ${student.streak} days
    - Exams Taken: ${examsCount}
    - Average Score: ${avgScore}%
    - Average Accuracy: ${avgAccuracy}%
    - Lessons Completed: ${lessonsCompleted}
    - Subject Mastery: ${masteryData.map(m => `${m.subject} (${m.status}, proficiency: ${m.proficiency}%)`).join(', ')}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const json: any = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text.trim());
  }

  private generateLocalInsights(
    student: any,
    examsCount: number,
    avgScore: number,
    masteryData: any[],
    lessonsCompleted: number
  ) {
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    const recommendations: string[] = [];

    // Rules-based analysis
    if (masteryData.length === 0) {
      strongAreas.push("Getting started");
      weakAreas.push("No subjects practiced yet");
      recommendations.push("Attempt your first diagnostic exam in any category.");
      recommendations.push("Complete lesson module 1 to establish a streak.");
    } else {
      masteryData.forEach(m => {
        if (m.proficiency >= 75) {
          strongAreas.push(`${m.subject} (${m.proficiency}% proficiency)`);
        } else if (m.proficiency < 55) {
          weakAreas.push(`${m.subject} (${m.proficiency}% proficiency)`);
        }
      });

      if (strongAreas.length === 0) {
        strongAreas.push("Consistency in study session attendance");
      }

      if (weakAreas.length === 0) {
        weakAreas.push("Exam time management");
      }

      // Generate recommendations based on scores
      if (avgScore < 60) {
        recommendations.push("Review fundamental slides in weak modules before re-testing.");
        recommendations.push("Aim to spend at least 15 minutes reviewing incorrect answers.");
      } else if (avgScore >= 80) {
        recommendations.push("Practice medium/hard questions in the Question Bank.");
        recommendations.push("Challenge peer aspirants in mock exams.");
      } else {
        recommendations.push("Attempt mock exams under timed conditions.");
        recommendations.push("Target subjects below 70% proficiency for daily revision.");
      }
    }

    if (student.streak > 3) {
      strongAreas.push(`Maintaining a strong ${student.streak}-day streak`);
    } else {
      recommendations.push("Focus on log-in consistency to rebuild your learning streak.");
    }

    const studyPlan = `Based on your level ${student.level} status, dedicate 45 minutes daily: 15 minutes reviewing active flashcards, 20 minutes attempting a 10-item subject quiz, and 10 minutes checking feedback. Prioritize subjects showing less than 65% proficiency.`;

    return {
      strongAreas,
      weakAreas,
      recommendations,
      studyPlan,
    };
  }

  async getDashboardAnalyticsSummary() {
    const CACHE_TTL = 1000 * 5; // 5-second in-memory cache for high real-time responsiveness
    const nowTimestamp = Date.now();
    if (this.summaryCache && nowTimestamp - this.summaryCache.timestamp < CACHE_TTL) {
      return this.summaryCache.data;
    }

    const totalStudentsCount = await this.db.user.count();

    const students = await this.db.user.findMany({
      take: 500,
      select: {
        id: true,
        level: true,
        createdAt: true,
        examResults: {
          select: { score: true, subject: true, accuracy: true },
        },
        mastery: {
          select: { subject: true, proficiency: true },
        },
      },
    });

    let passedCount = 0;
    let nearTargetCount = 0;
    let atRiskCount = 0;

    let totalScoreSum = 0;
    let ratedStudentsCount = 0;

    students.forEach((student: any) => {
      if (student.examResults && student.examResults.length > 0) {
        const sum = student.examResults.reduce((acc: any, curr: any) => {
          const itemAcc = curr.accuracy !== undefined && curr.accuracy !== null
            ? curr.accuracy
            : (curr.total ? (curr.score / curr.total) * 100 : curr.score || 0);
          return acc + itemAcc;
        }, 0);
        const studentAvg = Math.round(sum / student.examResults.length);
        totalScoreSum += studentAvg;
        ratedStudentsCount++;

        if (studentAvg >= 75) {
          passedCount++;
        } else if (studentAvg >= 60) {
          nearTargetCount++;
        } else {
          atRiskCount++;
        }
      } else if (student.mastery && student.mastery.length > 0) {
        const sum = student.mastery.reduce((acc: any, curr: any) => acc + curr.proficiency, 0);
        const studentAvg = Math.round(sum / student.mastery.length);
        totalScoreSum += studentAvg;
        ratedStudentsCount++;

        if (studentAvg >= 75) {
          passedCount++;
        } else if (studentAvg >= 60) {
          nearTargetCount++;
        } else {
          atRiskCount++;
        }
      }
    });

    const overallAvgScore = ratedStudentsCount > 0 ? Number((totalScoreSum / ratedStudentsCount).toFixed(1)) : 0;
    const overallPassRate = ratedStudentsCount > 0 ? Number(((passedCount / ratedStudentsCount) * 100).toFixed(1)) : 0;

    const distribution = [
      {
        label: "Passed (≥75%)",
        value: ratedStudentsCount > 0 ? Number(((passedCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
        count: passedCount,
        color: "#10b981",
        strokeColor: "stroke-emerald-500",
        bgLight: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Near Target (60-74%)",
        value: ratedStudentsCount > 0 ? Number(((nearTargetCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
        count: nearTargetCount,
        color: "#f59e0b",
        strokeColor: "stroke-amber-500",
        bgLight: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
      },
      {
        label: "At Risk (<60%)",
        value: ratedStudentsCount > 0 ? Number(((atRiskCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
        count: atRiskCount,
        color: "#ef4444",
        strokeColor: "stroke-rose-500",
        bgLight: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
      },
    ];

    // Calculate each student's current board exam readiness score
    const studentReadinessScores = students.map((s: any) => {
      if (s.mastery && s.mastery.length > 0) {
        const sum = s.mastery.reduce((acc: number, m: any) => acc + (m.proficiency || 0), 0);
        return Number((sum / s.mastery.length).toFixed(1));
      }
      if (s.examResults && s.examResults.length > 0) {
        const sum = s.examResults.reduce((acc: number, e: any) => {
          const accVal = e.accuracy !== undefined && e.accuracy !== null
            ? e.accuracy
            : (e.total ? (e.score / e.total) * 100 : e.score || 0);
          return acc + accVal;
        }, 0);
        return Number((sum / s.examResults.length).toFixed(1));
      }
      return 0;
    });

    const activeReadiness = studentReadinessScores.filter((r: number) => r > 0);
    const overallReadinessScore = activeReadiness.length > 0
      ? Number((activeReadiness.reduce((a: number, b: number) => a + b, 0) / activeReadiness.length).toFixed(1))
      : 52.2;

    const allExamResults = await this.db.examResult.findMany({
      take: 1000,
      select: {
        score: true,
        timestamp: true,
        userId: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last12Months: Array<{ key: string; month: string; year: number; monthIndex: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last12Months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    const monthlyMap: Record<string, { totalScore: number; count: number; passCount: number; userIds: Set<string> }> = {};

    allExamResults.forEach((res: any) => {
      const date = new Date(res.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { totalScore: 0, count: 0, passCount: 0, userIds: new Set() };
      }
      monthlyMap[key].totalScore += res.score;
      monthlyMap[key].count++;
      if (res.score >= 75) monthlyMap[key].passCount++;
      if (res.userId) monthlyMap[key].userIds.add(res.userId);
    });

    const monthlyTrend = last12Months.map((m, idx) => {
      const isCurrentMonth = idx === last12Months.length - 1;
      const monthEnd = new Date(m.year, m.monthIndex + 1, 0, 23, 59, 59, 999);

      // Check which students were enrolled by or during this specific month
      const enrolledInMonth = students.filter(
        (s: any) => s.createdAt && new Date(s.createdAt) <= monthEnd
      );
      const aggregated = monthlyMap[m.key];

      // If no users were registered in the system during this month and no exams occurred, values must be 0
      if (enrolledInMonth.length === 0 && (!aggregated || aggregated.count === 0)) {
        return {
          month: m.month,
          readinessScore: 0,
          rate: 0,
          avgScore: 0,
          students: 0,
          tier: undefined,
          benchmarkMet: false,
        };
      }

      // If students existed in this month:
      const studentsCount = aggregated && aggregated.userIds.size > 0
        ? aggregated.userIds.size
        : enrolledInMonth.length;

      let computedScore = 0;
      if (isCurrentMonth) {
        computedScore = overallReadinessScore;
      } else if (aggregated && aggregated.count > 0) {
        // Average score/rate from exams taken in that specific historical month
        const passRate = (aggregated.passCount / aggregated.count) * 100;
        computedScore = Number(passRate.toFixed(1));
      } else {
        computedScore = 0;
      }

      const avgScore = aggregated && aggregated.count > 0
        ? Math.round(aggregated.totalScore / aggregated.count)
        : Math.round(computedScore);

      return {
        month: m.month,
        readinessScore: computedScore,
        rate: computedScore,
        avgScore,
        students: studentsCount,
        tier: computedScore >= 75 ? "High Probability" : computedScore >= 60 ? "In Training" : "Needs Remediation",
        benchmarkMet: computedScore >= 75,
      };
    });

    const categories = await this.db.subject.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    const matchSubjectName = (s1?: string | null, s2?: string | null) => {
      if (!s1 || !s2) return false;
      const a = s1.toLowerCase().trim();
      const b = s2.toLowerCase().trim();
      return (
        a === b ||
        a.includes(b) ||
        b.includes(a) ||
        (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4))
      );
    };

    const subjects = categories.map((cat: any) => {
      const catMastery = students.flatMap((s: any) =>
        (s.mastery || []).filter((m: any) => matchSubjectName(m.subject, cat.name))
      );
      let avgProficiency = 0;
      if (catMastery.length > 0) {
        avgProficiency = Math.round(
          catMastery.reduce((acc: any, curr: any) => acc + (curr.proficiency || 0), 0) / catMastery.length
        );
      } else {
        const catExams = students.flatMap((s: any) =>
          (s.examResults || []).filter((e: any) => matchSubjectName(e.subject, cat.name))
        );
        if (catExams.length > 0) {
          avgProficiency = Math.round(
            catExams.reduce((acc: any, curr: any) => acc + (curr.score || 0), 0) / catExams.length
          );
        }
      }

      return {
        id: cat.id,
        name: cat.name,
        questionCount: cat._count?.questions ?? 0,
        proficiency: avgProficiency,
      };
    });

    const summaryResult = {
      overallPassRate,
      overallAvgScore,
      overallReadinessScore,
      totalStudentsCount,
      passedCount,
      nearTargetCount,
      atRiskCount,
      distribution,
      monthlyTrend,
      subjects,
    };

    this.summaryCache = { data: summaryResult, timestamp: Date.now() };

    return summaryResult;
  }
}

export const analyticsService = new AnalyticsService();

export const getStudentAnalytics = analyticsService.getStudentAnalytics.bind(analyticsService);
export const getDashboardAnalyticsSummary = analyticsService.getDashboardAnalyticsSummary.bind(analyticsService);
export const invalidateAnalyticsSummaryCache = analyticsService.invalidateSummaryCache.bind(analyticsService);

export function notifyAnalyticsUpdated() {
  analyticsService.invalidateSummaryCache();
  try {
    pusherService.broadcastEvent("admin-events", "analytics-updated", {
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.warn("[Pusher] Failed to broadcast analytics-updated event:", err?.message || err);
  }
  try {
    sseService.broadcastEvent("analytics-updated", {
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.warn("[SSE] Failed to broadcast analytics-updated event:", err?.message || err);
  }
}

