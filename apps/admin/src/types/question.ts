export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  DEAN = "DEAN",
  TEAMLEAD = "TEAMLEAD",
  TEACHER = "TEACHER",
  EXTERNAL = "EXTERNAL",
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

export interface Question {
  id: string;
  text?: string;
  question?: string;
  imageUrl?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  category: Category;
  topic: string;
  authorId: string;
  author: { name: string } | string;
  choices?: string[];
  choiceImages?: string[];
  correctAnswer: string;
  status: QuestionStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}
