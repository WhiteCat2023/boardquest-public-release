export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  level: number;
}

export interface PerformanceTrendItem {
  id?: string;
  date: string;
  examName: string;
  score: number;
  accuracy: number;
  subject: string;
}

export interface TimelineEventItem {
  id: string;
  type: "exam" | "achievement" | "lesson" | "level_up";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    score?: number;
    accuracy?: number;
    subject?: string;
    badge?: string;
    xp?: number;
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

export interface StudyPlanItem {
  id: string;
  subject: string;
  targetDate: string;
  updatedAt?: string;
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
  studyPlans?: StudyPlanItem[];
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

export type TabType = "overview" | "graphs" | "timeline" | "progress" | "achievements";
