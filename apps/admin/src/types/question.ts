export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  DEAN = "DEAN",
  TEAMLEAD = "TEAMLEAD",
  TEACHER = "TEACHER",
  REVIEWCENTER = "REVIEWCENTER",
  EXTERNAL = "EXTERNAL",
}

export enum QuestionDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum CognitiveLevel {
  LOTS = "LOTS",
  HOTS = "HOTS",
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

export interface Subject {
  id: string;
  name: string;
  icon?: string;
  code?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
}

export type Category = Subject;

export interface Question {
  id: string;
  text?: string;
  question?: string;
  imageUrl?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  cognitiveLevel?: CognitiveLevel | string;
  subject?: Subject;
  category?: Category;
  subjectId?: string;
  categoryId?: string;
  topic: string;
  authorId: string;
  author: { name: string } | string;
  choices?: string[];
  choiceImages?: string[];
  correctAnswer: string;
  status: QuestionStatus;
  createdAt: string;
}
