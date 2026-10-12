import type { Student } from "../../../types/types";
import type { StudentAnalyticsResult } from "@/features/analytics/types/types";

export interface StudentAiActionCenterCardProps {
  student: Student;
  report?: StudentAnalyticsResult | null;
  onAssignGuidance?: () => void;
  onOpenScorecard?: () => void;
}

export type InsightFilter = "all" | "strengths" | "gaps" | "suggestions";

export interface StrengthOrGapItem {
  subject: string;
  proficiency: number;
  completion: number;
  mastery?: number;
  status?: string;
  totalQuestionsAnswered?: number;
  totalCorrect?: number;
  weight?: string;
  weightPercent?: number;
  dynamicRationale?: string;
}

export interface DynamicAiInsights {
  primaryStrength: StrengthOrGapItem | null;
  secondaryStrength: StrengthOrGapItem | null;
  hasAcademicStrength: boolean;
  academicStrengthRationale: string;
  primaryGap: StrengthOrGapItem;
  secondaryGap: StrengthOrGapItem | null;
  targetBatch: string;
  dailyQuota: number;
  daysRemaining: number;
  streak: number;
  currentReadiness: number;
  projectedReadiness: number;
}

export function calculateDaysRemaining(targetExamDate?: string | null): number {
  if (!targetExamDate) return 42;
  const diff = new Date(targetExamDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getBoardSubjectWeight(subject: string): { label: string; percent: number } {
  const s = (subject || "").toLowerCase();
  if (s.includes("chemistry")) return { label: "High Board Weight (20%)", percent: 20 };
  if (s.includes("microbio") || s.includes("parasit")) return { label: "High Board Weight (20%)", percent: 20 };
  if (s.includes("hematolog")) return { label: "High Board Weight (20%)", percent: 20 };
  if (s.includes("blood") || s.includes("serolog") || s.includes("immuno")) return { label: "High Board Weight (20%)", percent: 20 };
  if (s.includes("microscopy") || s.includes("urine") || s.includes("fluid")) return { label: "Core Board Weight (10%)", percent: 10 };
  if (s.includes("histopath") || s.includes("law")) return { label: "Core Board Weight (10%)", percent: 10 };
  return { label: "Core Discipline", percent: 15 };
}

export function computeStrengthsAndGaps(
  student: Student,
  report?: StudentAnalyticsResult | null
): DynamicAiInsights {
  const settings = student.userSettings;
  const daysRemaining = calculateDaysRemaining(settings?.targetExamDate);
  const targetBatch = settings?.targetBatch || "March 2026 Batch";
  const dailyQuota = settings?.dailyQuota || 50;
  const streak = student.streak || 0;

  // 1. Gather all candidate metrics from student.subjectMetrics or analytics report
  let rawList: StrengthOrGapItem[] = [];

  if (student.subjectMetrics && student.subjectMetrics.length > 0) {
    rawList = student.subjectMetrics.map((m) => {
      const weightInfo = getBoardSubjectWeight(m.subject);
      return {
        subject: m.subject,
        proficiency: Math.round(m.proficiency || 0),
        completion: Math.round(m.completion || 0),
        mastery: Math.round(m.mastery || m.proficiency || 0),
        status: m.status || (m.completion > 0 ? "In Training" : "Not Started"),
        totalQuestionsAnswered: m.totalQuestionsAnswered || 0,
        totalCorrect: m.totalCorrect || 0,
        weight: weightInfo.label,
        weightPercent: weightInfo.percent,
      };
    });
  } else if (report?.metrics?.mastery && report.metrics.mastery.length > 0) {
    rawList = report.metrics.mastery.map((m) => {
      const weightInfo = getBoardSubjectWeight(m.subject);
      const completion = m.totalLessons
        ? Math.round((m.lessonsDone / m.totalLessons) * 100)
        : 0;
      return {
        subject: m.subject,
        proficiency: Math.round(m.proficiency || 0),
        completion,
        mastery: Math.round(m.proficiency || 0),
        status: m.status || (completion > 0 ? "In Training" : "Not Started"),
        totalQuestionsAnswered: 0,
        weight: weightInfo.label,
        weightPercent: weightInfo.percent,
      };
    });
  }

  // Cross-reference with accuracyHistory to enrich attempt counts if available
  if (student.accuracyHistory && student.accuracyHistory.length > 0) {
    student.accuracyHistory.forEach((hist) => {
      const match = rawList.find(
        (r) =>
          r.subject.toLowerCase().includes(hist.subject.toLowerCase()) ||
          hist.fullSubjectName?.toLowerCase().includes(r.subject.toLowerCase())
      );
      if (match) {
        if (!match.totalQuestionsAnswered && hist.totalQuestions) {
          match.totalQuestionsAnswered = hist.totalQuestions;
        }
        if (hist.avgAccuracy && !match.proficiency) {
          match.proficiency = Math.round(hist.avgAccuracy);
        }
      }
    });
  }

  // If still empty, supply the standard 6 Medical Technology board disciplines
  if (rawList.length === 0) {
    const defaultSubjects = [
      "Clinical Chemistry",
      "Microbiology & Parasitology",
      "Hematology",
      "Blood Banking & Serology",
      "Clinical Microscopy",
      "Histopathologic Techniques & MT Laws",
    ];
    rawList = defaultSubjects.map((subject) => {
      const weightInfo = getBoardSubjectWeight(subject);
      return {
        subject,
        proficiency: 0,
        completion: 0,
        mastery: 0,
        status: "Not Started",
        totalQuestionsAnswered: 0,
        weight: weightInfo.label,
        weightPercent: weightInfo.percent,
      };
    });
  }

  // 2. Identify True Dynamic Academic Strengths
  // A genuine academic strength requires positive proficiency and engagement:
  // e.g. proficiency >= 50% with at least 1 question answered, OR completion >= 20% with proficiency >= 40%, OR proficiency >= 60%
  const validStrengthCandidates = rawList.filter(
    (m) =>
      (m.proficiency >= 50 && (m.totalQuestionsAnswered || 0) > 0) ||
      (m.completion >= 20 && m.proficiency >= 40) ||
      m.proficiency >= 60
  );

  validStrengthCandidates.sort(
    (a, b) => b.proficiency - a.proficiency || b.completion - a.completion
  );

  let primaryStrength: StrengthOrGapItem | null = null;
  let secondaryStrength: StrengthOrGapItem | null = null;
  let hasAcademicStrength = false;
  let academicStrengthRationale = "";

  if (validStrengthCandidates.length > 0) {
    hasAcademicStrength = true;
    primaryStrength = validStrengthCandidates[0];
    secondaryStrength = validStrengthCandidates[1] || null;

    if (primaryStrength.proficiency >= 75) {
      primaryStrength.dynamicRationale = `Demonstrates consistent question accuracy (${primaryStrength.proficiency}%) exceeding the 75% PRC board passing standard. Serves as the candidate's core anchor discipline.`;
      academicStrengthRationale = primaryStrength.dynamicRationale;
    } else if (primaryStrength.proficiency >= 50) {
      primaryStrength.dynamicRationale = `Shows developing competency with ${primaryStrength.proficiency}% accuracy across active modules. Positioned to exceed the 75% benchmark with sustained drill practice.`;
      academicStrengthRationale = primaryStrength.dynamicRationale;
    } else {
      primaryStrength.dynamicRationale = `Highest performing subject (${primaryStrength.proficiency}% proficiency) among active diagnostic simulations.`;
      academicStrengthRationale = primaryStrength.dynamicRationale;
    }
  } else {
    // When no subject has positive proficiency/attempts yet, avoid fabricating a 0% discipline as a strength!
    hasAcademicStrength = false;
    primaryStrength = null;
    secondaryStrength = null;
    academicStrengthRationale =
      "Candidate is in the baseline diagnostic phase. Academic anchor disciplines will populate dynamically once practice drills or simulated mock exams are completed.";
  }

  // 3. Identify Dynamic Critical Gaps & Weaknesses
  // MUST EXCLUDE any subject chosen as primary or secondary strength to avoid mutual contradictions!
  const availableForGaps = rawList.filter(
    (m) =>
      m.subject !== primaryStrength?.subject &&
      m.subject !== secondaryStrength?.subject
  );

  // Sort gaps by vulnerability priority:
  // 1. Lower proficiency first
  // 2. If equal proficiency (e.g. 0%), prioritize 20% high board weight subjects over 10%
  // 3. Lower completion first
  availableForGaps.sort((a, b) => {
    if (a.proficiency !== b.proficiency) {
      return a.proficiency - b.proficiency;
    }
    if ((b.weightPercent || 0) !== (a.weightPercent || 0)) {
      return (b.weightPercent || 0) - (a.weightPercent || 0);
    }
    return a.completion - b.completion;
  });

  const primaryGap: StrengthOrGapItem = availableForGaps[0] || {
    subject: "Clinical Chemistry",
    proficiency: 0,
    completion: 0,
    mastery: 0,
    status: "Not Started",
    weight: "High Board Weight (20%)",
  };

  const secondaryGap: StrengthOrGapItem | null =
    availableForGaps[1] && availableForGaps[1].subject !== primaryGap.subject
      ? availableForGaps[1]
      : null;

  // Generate dynamic rationale for primaryGap
  if (
    primaryGap.completion === 0 &&
    (primaryGap.totalQuestionsAnswered || 0) === 0
  ) {
    primaryGap.dynamicRationale =
      "Severe curriculum void: Candidate has not attempted diagnostic simulations or completed syllabus modules in this high-yield discipline.";
  } else if (primaryGap.proficiency < 50) {
    primaryGap.dynamicRationale = `Critical performance lag: Question accuracy is currently at ${primaryGap.proficiency}%, significantly lagging the 75% PRC board exam standard with low module completion (${primaryGap.completion}%).`;
  } else {
    primaryGap.dynamicRationale = `Proficiency is currently at ${primaryGap.proficiency}%, below the 75% passing benchmark. Needs focused remediation to bridge the score gap.`;
  }

  // 4. Dynamic Projected Outcome Calculations
  const currentReadiness =
    student.scorecardSummary?.avgProficiency ??
    report?.studentInfo?.readinessScore ??
    0;

  const projectedReadiness =
    currentReadiness > 0
      ? Math.min(95, Math.max(76, Math.round(currentReadiness + 36)))
      : 84;

  return {
    primaryStrength,
    secondaryStrength,
    hasAcademicStrength,
    academicStrengthRationale,
    primaryGap,
    secondaryGap,
    targetBatch,
    dailyQuota,
    daysRemaining,
    streak: streak > 0 ? streak : 1,
    currentReadiness,
    projectedReadiness,
  };
}
