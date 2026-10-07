export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "CANDIDATE"
  | "SCHEDULE"
  | "ASSESSMENT"
  | "SYSTEM"
  | "CANDIDATE_ENROLLED"
  | "BULK_ENROLLMENT"
  | "SCHEDULE_CREATED"
  | "SCORES_SAVED"
  | "QUESTION_APPROVED"
  | "STUDENT_ASSIGNED"
  | "SYSTEM_UPDATE";

export interface NotificationItem {
  id: string;
  reviewCenterId?: string;
  recipientId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export type NotificationFilterTab = "ALL" | "UNREAD";
