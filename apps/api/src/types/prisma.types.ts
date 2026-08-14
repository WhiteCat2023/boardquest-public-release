/**
 * Dedicated Prisma Enums and Type Definitions Replicated from Prisma Schema
 * Centralized, self-contained type system eliminating brittle relative imports to generated output.
 */

export enum Role {
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
  TEACHER = "TEACHER",
  TEAMLEAD = "TEAMLEAD",
}

export enum QuestionDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum QuestionType {
  MCQ = "MCQ",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
}

export enum QuestionStatus {
  APPROVED = "APPROVED",
  PENDING_REVIEW = "PENDING_REVIEW",
  PENDING_REVISION = "PENDING_REVISION",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
}

export enum GuidanceStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CANCELLED = "CANCELLED",
}

// Re-export Prisma Client & Model Types
export { PrismaClient } from "@prisma/client";
export type {
  AdminUser,
  Category,
  Question,
  QuestionComment,
  Notification,
  GuidanceAssignment,
  SystemLog,
  Prisma,
} from "@prisma/client";
