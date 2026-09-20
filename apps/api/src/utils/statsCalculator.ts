/**
 * Statistical calculations engine for Review Center assessments and board ratings.
 */

export const MEDTECH_SUBJECT_WEIGHTS: Record<string, number> = {
  "Clinical Chemistry": 0.20,
  "Microbiology": 0.20,
  "Microbiology & Parasitology": 0.20,
  "Hematology": 0.20,
  "Immunology & Serology and Immunohematology": 0.20,
  "Clinical Microscopy & Parasitology": 0.10,
  "Histopathology and Medtech Laws": 0.10,
};

export const MEDTECH_SUBJECTS = [
  "Clinical Chemistry",
  "Microbiology & Parasitology",
  "Hematology",
  "Immunology & Serology and Immunohematology",
  "Clinical Microscopy & Parasitology",
  "Histopathology and Medtech Laws",
] as const;

export type MedTechSubject = (typeof MEDTECH_SUBJECTS)[number];

/**
 * Standardize subject name matching
 */
export function normalizeMedTechSubject(subject: string): string {
  const s = subject.trim().toLowerCase();
  if (s.includes("chem")) return "Clinical Chemistry";
  if (s.includes("microscopy") || s.includes("urine") || s.includes("body fluid")) {
    return "Clinical Microscopy & Parasitology";
  }
  if (s.includes("micro") || s.includes("parasit")) {
    return "Microbiology & Parasitology";
  }
  if (s.includes("immuno") || s.includes("sero") || s.includes("blood bank")) {
    return "Immunology & Serology and Immunohematology";
  }
  if (s.includes("hema")) return "Hematology";
  if (s.includes("histo") || s.includes("law") || s.includes("ethics")) {
    return "Histopathology and Medtech Laws";
  }
  return subject.trim();
}

/**
 * Compute the Mean of an array of numeric scores.
 */
export function calculateMean(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / scores.length).toFixed(2));
}

/**
 * Compute the Median of an array of numeric scores.
 */
export function calculateMedian(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return Number(sorted[mid].toFixed(2));
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

/**
 * Compute the Mode(s) of an array of numeric scores.
 * Returns array of modal scores. If all scores have frequency 1 or identical frequency, returns [].
 */
export function calculateMode(scores: number[]): number[] {
  if (!scores || scores.length === 0) return [];
  if (scores.length === 1) return [scores[0]];

  const freqMap = new Map<number, number>();
  for (const s of scores) {
    const val = Number(s.toFixed(2));
    freqMap.set(val, (freqMap.get(val) || 0) + 1);
  }

  let maxFreq = 0;
  for (const freq of freqMap.values()) {
    if (freq > maxFreq) {
      maxFreq = freq;
    }
  }

  // If max frequency is 1 (all distinct) or every item has the same frequency, there is no unique mode
  if (maxFreq === 1) return [];

  const modes: number[] = [];
  let allEqualFreq = true;
  for (const [val, freq] of freqMap.entries()) {
    if (freq === maxFreq) {
      modes.push(val);
    } else {
      allEqualFreq = false;
    }
  }

  if (allEqualFreq && freqMap.size > 1) {
    return [];
  }

  return modes.sort((a, b) => a - b);
}

/**
 * Calculate Midpoint Percentile Rank for each student.
 * Midpoint formula properly handles ties:
 * Percentile = ((scores_less + 0.5 * scores_equal) / N) * 100
 */
export function calculatePercentileRanks(
  items: { candidateId: string; score: number }[]
): Map<string, number> {
  const result = new Map<string, number>();
  if (!items || items.length === 0) return result;

  const N = items.length;
  const allScores = items.map((i) => i.score);

  for (const item of items) {
    let strictlyLess = 0;
    let equal = 0;

    for (const s of allScores) {
      if (s < item.score) {
        strictlyLess++;
      } else if (s === item.score) {
        equal++;
      }
    }

    const percentile = ((strictlyLess + 0.5 * equal) / N) * 100;
    result.set(item.candidateId, Number(percentile.toFixed(2)));
  }

  return result;
}

/**
 * Calculate General Weighted Average (GWA) based on official Philippine MedTech Board Exam weights.
 */
export function calculateMedTechGeneralAverage(
  subjectScores: { subject: string; score: number }[]
): {
  gwa: number;
  passed: boolean;
  conditionFailed: boolean;
  failedSubjects: string[];
} {
  let weightedSum = 0;
  let totalWeight = 0;
  const failedSubjects: string[] = [];

  for (const item of subjectScores) {
    const normalized = normalizeMedTechSubject(item.subject);
    const weight = MEDTECH_SUBJECT_WEIGHTS[normalized] || 0.1667; // fallback equal weight
    weightedSum += item.score * weight;
    totalWeight += weight;

    if (item.score < 50) {
      failedSubjects.push(normalized);
    }
  }

  const gwa = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;
  const conditionFailed = failedSubjects.length > 0;
  const passed = gwa >= 75 && !conditionFailed;

  return {
    gwa,
    passed,
    conditionFailed,
    failedSubjects,
  };
}

/**
 * Input parameters for evaluating subject proficiency across exams, database mastery, and lessons.
 */
export interface SubjectProficiencyInput {
  dbMastery?: {
    proficiency?: number | null;
    status?: string | null;
  } | null;
  exams?: {
    score?: number | null;
    accuracy?: number | null;
    total?: number | null;
  }[];
  completedLessons?: number;
  totalLessons?: number;
}

export interface SubjectProficiencyResult {
  proficiency: number;
  status: string;
  lessonsDone: number;
}

/**
 * Unified calculation of subject proficiency, status, and completed lessons.
 * Ensures consistent resolution priority across student profile and analytics engines:
 * 1. Prioritize authoritative DB mastery record when available and positive (>0).
 * 2. If exams exist, blend exam accuracy (60% score + 40% accuracy) with lesson completion (70/30 weight).
 * 3. If only lessons completed, derive proficiency from lesson completion ratio.
 * 4. Fallback to existing DB mastery record if 0, or default to 0.
 */
export function calculateSubjectProficiency(input: SubjectProficiencyInput): SubjectProficiencyResult {
  const { dbMastery, exams = [], completedLessons = 0, totalLessons = 5 } = input;
  const safeTotalLessons = Math.max(totalLessons, 1);
  const actualLessonsDone = Math.max(0, completedLessons);

  let proficiency = 0;

  if (dbMastery && typeof dbMastery.proficiency === "number" && dbMastery.proficiency > 0) {
    proficiency = dbMastery.proficiency;
  } else if (exams && exams.length > 0) {
    const examAvgScore = Math.round(exams.reduce((acc, curr) => acc + (curr.score || 0), 0) / exams.length);
    const examAvgAccuracy = Math.round(exams.reduce((acc, curr) => acc + (curr.accuracy ?? curr.score ?? 0), 0) / exams.length);
    const examBase = Math.round(examAvgScore * 0.6 + examAvgAccuracy * 0.4);

    if (actualLessonsDone > 0) {
      const lessonRatio = Math.round((actualLessonsDone / safeTotalLessons) * 100);
      proficiency = Math.min(100, Math.round(examBase * 0.7 + lessonRatio * 0.3));
    } else {
      proficiency = examBase;
    }
  } else if (actualLessonsDone > 0) {
    proficiency = Math.min(100, Math.round((actualLessonsDone / safeTotalLessons) * 100));
  } else if (dbMastery && typeof dbMastery.proficiency === "number") {
    proficiency = dbMastery.proficiency;
  }

  // Derive completed lessons count
  let lessonsDone = actualLessonsDone;
  if (lessonsDone === 0 && proficiency > 0) {
    lessonsDone = Math.min(safeTotalLessons, Math.round((proficiency / 100) * safeTotalLessons));
  }

  // Derive standardized status
  let status = "Not Started";
  if (dbMastery?.status) {
    status = dbMastery.status;
  } else if (exams.length === 0 && actualLessonsDone === 0 && proficiency === 0) {
    status = "Not Started";
  } else if (proficiency >= 80) {
    status = "Mastered";
  } else if (proficiency >= 65) {
    status = "Proficient";
  } else if (proficiency >= 35 || exams.length > 0 || actualLessonsDone > 0) {
    status = "In Training";
  } else {
    status = "Needs Focus";
  }

  return {
    proficiency,
    status,
    lessonsDone,
  };
}

/**
 * Unified calculation of student board exam readiness score across all subjects.
 * Takes an array of numeric scores or objects with a proficiency field and returns
 * the canonical arithmetic mean rounded to 1 decimal place.
 */
export function calculateReadinessScore(
  items: (number | { proficiency?: number | null })[]
): number {
  if (!items || items.length === 0) return 0;
  const scores = items.map((item) =>
    typeof item === "number" ? item : (item.proficiency ?? 0)
  );
  const total = scores.reduce((sum, s) => sum + (s || 0), 0);
  return Math.round((total / scores.length) * 10) / 10;
}

/**
 * Calculate standing tier based on average proficiency and total gamified points.
 */
export function calculateStandingTier(
  readinessScore: number,
  totalPoints: number = 0
): string {
  if (readinessScore >= 85) return "High Distinction";
  if (readinessScore >= 70) return "Proficient Standing";
  if (readinessScore < 50 && totalPoints < 500) return "Needs Focus";
  return "In Training";
}
