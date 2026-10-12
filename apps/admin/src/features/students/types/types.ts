export interface Achievement {
  id: string;
  userId: string;
  task: string;
  type: "quest" | "exam" | string;
  badge?: string;
  xp: number;
  confidenceLevel?: "Shaky" | "Steady" | "Unyielding" | string;
  accuracy?: number;
  questMode?: "learning" | "test" | string;
  subject?: string;
  timestamp: string;
}

export interface StudyPlanItem {
  id: string;
  userId?: string;
  subject: string;
  startDate?: string;
  endDate?: string;
  targetDate?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
  goal?: string;
  targetQuestions?: number;
  targetAccuracy?: number;
  notes?: string;
  status?: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  id?: string;
  userId?: string;
  focusSubject?: string;
  targetExamDate?: string | null;
  targetBatch?: string;
  school?: string;
  dailyQuota?: number;
  defaultDifficulty?: string;
  confidencePrompts?: boolean;
}

export interface SubjectMetricItem {
  subject: string;
  shortName?: string;
  radarLabel?: string;
  completion: number;
  mastery: number;
  proficiency: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  masteryStatus: string;
  status: string;
  points: number;
}

export interface SubjectAccuracyHistoryItem {
  subject: string;
  fullSubjectName: string;
  avgAccuracy: number;
  attemptCount: number;
  totalScore: number;
  totalQuestions: number;
}

export interface StudentScorecardSummary {
  totalPoints: number;
  disciplinePoints: number;
  avgProficiency: number;
  avgCompletion: number;
  masteredCount: number;
  totalSubjects: number;
  tierStanding: string;
}

export interface ActiveStudyObjective {
  id: string;
  subject: string;
  startDate: string;
  endDate: string;
  targetDate?: string;
  daysRemaining: number;
  mastery: number;
  completion: number;
  status: string;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
  goal?: string;
  targetQuestions?: number;
  targetAccuracy?: number;
  notes?: string;
  statusMastery?: string;
}

export type CalendarPaceStatus = "ON_TRACK" | "BEHIND" | "CRITICAL" | "NOT_SCHEDULED";
export type EngagementStatus = "ACTIVE" | "LOW_CADENCE" | "DORMANT";

export interface StudentCalendarPace {
  status: CalendarPaceStatus;
  expectedPercent: number;
  actualPercent: number;
  lagPercent: number;
  activeSubject?: string;
  targetDate?: string | null;
}

export interface StudentEngagement {
  status: EngagementStatus;
  lastActiveAt?: string | null;
  daysSinceLastActive: number;
  weeklyAttemptCount: number;
}

export interface StudentCohortSummary {
  total: number;
  onTrack: number;
  behind: number;
  critical: number;
  dormant: number;
  failing: number;
  atRisk: number;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  level: number;
  xp: number;
  streak: number;
  location?: string;
  createdAt: string;
  equippedItem?: string | null;
  inventory?: string | null;
  mastery?: any[];
  studyPlans?: StudyPlanItem[];
  achievements?: Achievement[];
  examResults?: ExamResult[];
  lessonCompletions?: any[];
  userBadges?: any[];
  guidanceAssignments?: any[];
  activeGuidance?: any;

  isFailing?: boolean;
  avgAccuracy?: number;
  totalExamsTaken?: number;
  failingSubjects?: string[];
  academicStanding?: "FAILING" | "PASSING" | "UNTESTED";
  lastContactedAt?: string | null;
  outreachLogs?: any[];

  // BoardQuesters Performance & Target synchronization fields
  userSettings?: UserSettings | null;
  subjectMetrics?: SubjectMetricItem[];
  accuracyHistory?: SubjectAccuracyHistoryItem[];
  scorecardSummary?: StudentScorecardSummary;
  activeObjective?: ActiveStudyObjective | null;
  calendarPace?: StudentCalendarPace;
  engagement?: StudentEngagement;
  reviewCenterTranscript?: any;
}

export interface ExamResult {
  id: string;
  userId: string;
  score: number;
  total: number;
  accuracy: number;
  subject?: string | null;
  timestamp: string;
}

export interface ExamResultStats {
  totalAttempts: number;
  averageScore: number;
  averageAccuracy: number;
  highestScore: number;
  lowestScore: number;
}

