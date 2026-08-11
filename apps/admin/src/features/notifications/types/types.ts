export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "QUESTION_APPROVED"
  | "STUDENT_ASSIGNED"
  | "SYSTEM_UPDATE";

export interface NotificationItem {
  id: string;
  recipientId?: string | null;
  recipientRole?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  metadata?: string | null;
  createdAt: string;
}

export type NotificationFilterTab = "ALL" | "UNREAD";
