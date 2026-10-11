export type EncodingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE";

export interface FacultyTeacherInfo {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  employeeId?: string | null;
  avatarUrl?: string | null;
  role: string;
}

export interface FacultySubjectInfo {
  id: string;
  name: string;
  icon?: string | null;
}

export interface EncodingQualityBreakdown {
  approved: number;
  pendingReview: number;
  pendingRevision: number;
}

export interface FacultyTrackItem {
  id: string;
  assignmentId: string | null;
  teacher: FacultyTeacherInfo;
  subject: FacultySubjectInfo;
  schoolYear: string;
  targetCount: number;
  encodedCount: number;
  remainingCount: number;
  progressPercentage: number;
  breakdown: EncodingQualityBreakdown;
  deadline: string | null;
  isPastDeadline: boolean;
  notes?: string | null;
  assignedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  status: EncodingStatus;
  lastEncodedAt: string | null;
}

export interface EncodingTrackerKPIs {
  totalFaculty: number;
  totalAssignments: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  overdueCount: number;
  totalTargetQuestions: number;
  totalEncodedQuestions: number;
  totalApprovedQuestions: number;
  overallCompletionRate: number;
}

export interface TrackerOverviewResponse {
  kpis: EncodingTrackerKPIs;
  items: FacultyTrackItem[];
  schoolYear: string;
}

export interface TeacherGoalProgress {
  subject: FacultySubjectInfo;
  targetCount: number;
  encodedCount: number;
  remainingCount: number;
  progressPercentage: number;
  breakdown: EncodingQualityBreakdown;
  deadline: string | null;
  isPastDeadline: boolean;
  status: EncodingStatus;
}

export interface MyProgressResponse {
  schoolYear: string;
  overall: {
    totalTarget: number;
    totalEncoded: number;
    totalApproved: number;
    remainingCount: number;
    progressPercentage: number;
  };
  goals: TeacherGoalProgress[];
}
