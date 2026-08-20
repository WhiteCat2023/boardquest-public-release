/**
 * Dedicated Prisma Enums and Type Definitions Replicated from Prisma Schema
 * Centralized, self-contained type system eliminating brittle relative imports to generated output.
 */

import type * as PrismaClientPkg from "@prisma/client";

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

export interface AdminUser {
  id: string;
  employeeId: string;
  email: string;
  username: string;
  password?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  phoneNumber: string;
  handledCategoryIds?: string[];
  isActive?: boolean;
  lastActiveAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  verified?: boolean;
  level?: number;
  xp?: number;
  streak?: number;
  inventory?: string;
  equippedItem?: string;
  location?: string;
  createdAt?: Date;
}

export interface ReviewCenterRepresentativeUser {
  id: string;
  employeeId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName: string;
  phonenumber: string;
  location?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  authorId?: string;
  handlerIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Question {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  categoryId: string;
  authorId?: string;
  topic: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  status: QuestionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionComment {
  id: string;
  questionId: string;
  authorId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: string;
  recipientId?: string;
  recipientRole?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readUserIds?: string[];
  deletedUserIds?: string[];
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface GuidanceAssignment {
  id: string;
  studentId: string;
  advisorId: string;
  subjectCategory?: string;
  reason: string;
  status: GuidanceStatus;
  createdAt?: Date;
}

export interface SystemLog {
  id: string;
  level: string;
  action: string;
  message: string;
  source?: string;
  userEmail?: string;
  ipAddress?: string;
  metadata?: any;
  createdAt?: Date;
}

export type PrismaClient = PrismaClientPkg.PrismaClient;
