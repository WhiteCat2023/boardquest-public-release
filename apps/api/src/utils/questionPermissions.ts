export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  DEAN = "DEAN",
  TEAMLEAD = "TEAMLEAD",
  TEACHER = "TEACHER",
  REVIEWCENTER = "REVIEWCENTER",
  EXTERNAL = "EXTERNAL",
}

export const normalizeRole = (role?: any): string => {
  if (!role) return "";
  const s = String(role).toUpperCase().trim();
  if (s === "SUPERADMIN") return "SUPERADMIN";
  if (s === "DEAN") return "DEAN";
  if (s === "TEAMLEAD") return "TEAMLEAD";
  if (s === "TEACHER") return "TEACHER";
  if (s === "REVIEWCENTER" || s === "EXTERNAL") return "REVIEWCENTER";
  return s;
};

export enum QuestionStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  PENDING_REVISION = "PENDING_REVISION",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface UserContext {
  id: string;
  role: string | number;
}

export interface QuestionContext {
  id: string;
  authorId?: string;
  status?: string;
  isPublished?: boolean;
  categoryId?: string;
}

/**
 * Checks if a user has permission to view a given question.
 */
export function canViewQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);
  
  // Superadmin, Dean, and Team Lead can view all questions
  if (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  ) {
    return true;
  }

  // Teachers can view questions they authored or general category questions
  if (role === "TEACHER") {
    if (question.isPublished) return true;
    if (question.authorId && question.authorId === user.id) return true;
    return true;
  }

  return false;
}

/**
 * Checks if a user has permission to edit a given question.
 */
export function canEditQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);
  const isAuthor = question.authorId === user.id;

  // Superadmin, Dean, and Team Lead can edit any question
  if (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  ) {
    return true;
  }

  // Author (Teacher) can edit their own questions (if in pending state or drafting)
  if (isAuthor && role === "TEACHER") {
    return (
      !question.status ||
      question.status === QuestionStatus.PENDING_REVISION ||
      question.status === QuestionStatus.PENDING_REVIEW ||
      question.status === "DRAFT"
    );
  }

  return false;
}

/**
 * Checks if a user can delete a question.
 */
export function canDeleteQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);
  const isAuthor = question.authorId === user.id;

  if (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  ) {
    return true;
  }

  if (role === "TEACHER" && isAuthor) {
    return (
      !question.status ||
      question.status === QuestionStatus.PENDING_REVIEW ||
      question.status === QuestionStatus.PENDING_REVISION ||
      question.status === "DRAFT"
    );
  }

  return false;
}

/**
 * Checks if a user can provide review feedback or request revisions.
 */
export function canFeedbackQuestion(user: UserContext, question?: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);

  return (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  );
}

/**
 * Checks if a user can approve a question.
 */
export function canApproveQuestion(user: UserContext, question?: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);

  return (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  );
}

/**
 * Checks if a user can publish or unpublish a question.
 */
export function canPublishQuestion(user: UserContext, question?: QuestionContext): boolean {
  if (!user || !user.role) return false;
  const role = normalizeRole(user.role);

  return (
    role === "SUPERADMIN" ||
    role === "DEAN" ||
    role === "TEAMLEAD"
  );
}

