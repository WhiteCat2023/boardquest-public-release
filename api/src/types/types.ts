export interface ParaphraseResult {
  original: string;
  paraphrases: string[];
}

export interface PerformanceInput {
  studentId: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  examStats: {
    totalAttempts: number;
    averageScore: number;
    averageAccuracy: number;
    highestScore: number;
    lowestScore: number;
  };
  subjectMastery: Array<{
    subject: string;
    proficiency: number;
    status: string;
  }>;
  lessonProgress: Record<
    string,
    { completed: number; inProgress: number; notStarted: number; total: number }
  >;
  totalAchievements: number;
}

export interface PerformanceAnalysis {
  studentId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallRating: "Excellent" | "Good" | "Average" | "Needs Improvement";
}
