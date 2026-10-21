export type EncodingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
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
  title?: string | null;
  term?: string;
  allowOverQuota?: boolean;
  completedAt?: string | null;
  teacher: FacultyTeacherInfo;
  subject: FacultySubjectInfo;
  schoolYear: string;
  targetCount: number;
  encodedCount: number;
  approvedCount?: number;
  pendingReviewCount?: number;
  pendingRevisionCount?: number;
  pendingCount?: number;
  remainingCount: number;
  progressPercentage: number;
  approvedPercentage?: number;
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
  inReviewCount?: number;
  inProgressCount: number;
  notStartedCount: number;
  overdueCount: number;
  totalTargetQuestions: number;
  totalEncodedQuestions: number;
  totalApprovedQuestions: number;
  overallCompletionRate: number;
  overallSubmissionRate?: number;
}

export interface TrackerOverviewResponse {
  kpis: EncodingTrackerKPIs;
  items: FacultyTrackItem[];
  schoolYear: string;
}

export interface TeacherGoalProgress {
  subject: FacultySubjectInfo;
  assignmentId?: string | null;
  title?: string | null;
  term?: string;
  allowOverQuota?: boolean;
  completedAt?: string | null;
  targetCount: number;
  encodedCount: number;
  approvedCount?: number;
  pendingReviewCount?: number;
  pendingRevisionCount?: number;
  pendingCount?: number;
  remainingCount: number;
  progressPercentage: number;
  approvedPercentage?: number;
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
    approvedPercentage?: number;
  };
  goals: TeacherGoalProgress[];
}

export type TrackerViewMode = "teacher" | "subject";

export interface TeacherQuotaAllocation {
  teacherId: string;
  targetCount: number;
}

export interface SubjectTrackItem {
  id: string;
  subject: FacultySubjectInfo;
  assignedTeachers: FacultyTrackItem[];
  teacherCount: number;
  targetCount: number;
  encodedCount: number;
  approvedCount?: number;
  remainingCount: number;
  progressPercentage: number;
  approvedPercentage?: number;
  breakdown: EncodingQualityBreakdown;
  status: EncodingStatus;
  earliestDeadline: string | null;
  hasOverdueTeacher: boolean;
  schoolYear: string;
  term?: string;
  title?: string | null;
  allowOverQuota?: boolean;
}
