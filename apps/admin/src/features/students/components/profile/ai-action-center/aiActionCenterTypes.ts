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
}

export function calculateDaysRemaining(targetExamDate?: string | null): number {
  if (!targetExamDate) return 42;
  const diff = new Date(targetExamDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function computeStrengthsAndGaps(student: Student) {
  const settings = student.userSettings;
  const metrics = student.subjectMetrics || [];

  const daysRemaining = calculateDaysRemaining(settings?.targetExamDate);

  // Sort metrics ascending (weakest first) and descending (strongest first)
  const sortedAsc = [...metrics].sort(
    (a, b) => (a.proficiency || 0) - (b.proficiency || 0)
  );
  const sortedDesc = [...metrics].sort(
    (a, b) => (b.proficiency || 0) - (a.proficiency || 0)
  );

  // Determine top strengths
  const topStrengths = sortedDesc.filter(
    (m) => (m.proficiency || 0) >= 50 || m.completion > 0
  );
  const primaryStrength: StrengthOrGapItem =
    topStrengths[0] ||
    sortedDesc[0] || {
      subject: "Clinical Chemistry",
      proficiency: 68,
      completion: 8,
      mastery: 71,
      status: "In Training",
    };
  const secondaryStrength = topStrengths[1] || null;

  // Determine critical gaps & weaknesses (subjects below 75% benchmark or unstarted)
  const weakSubjects = sortedAsc.filter(
    (m) => (m.proficiency || 0) < 75 || m.completion < 50
  );
  const primaryGap: StrengthOrGapItem =
    weakSubjects[0] ||
    sortedAsc[0] || {
      subject: "Immunology & Serology and Immunohematology",
      proficiency: 0,
      completion: 0,
      mastery: 0,
      status: "Not Started",
    };
  const secondaryGap = weakSubjects[1] || sortedAsc[1] || null;

  const targetBatch = settings?.targetBatch || "March 2026 Batch";
  const dailyQuota = settings?.dailyQuota || 50;

  return {
    primaryStrength,
    secondaryStrength,
    primaryGap,
    secondaryGap,
    targetBatch,
    dailyQuota,
    daysRemaining,
    streak: student.streak || 1,
  };
}
