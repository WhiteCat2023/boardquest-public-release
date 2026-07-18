export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEAMLEAD = 'TEAMLEAD',
  TEACHER = 'TEACHER'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export enum QuestionStatus {
  APPROVED = 'APPROVED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  NEEDS_REVISION = 'NEEDS_REVISION',
  DRAFT = 'DRAFT'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: Category;
  topic: string;
  authorId: string;
  author: { name: string } | string;
  choices?: string[];
  correctAnswer: string;
  status: QuestionStatus;
  feedback?: string;
  createdAt: string;
  isPublished?: boolean;
}

export interface Category {
  id: string;
  name: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}