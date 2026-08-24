export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  DEAN = "DEAN",
  TEAMLEAD = "TEAMLEAD",
  TEACHER = "TEACHER",
}

export interface UserContext {
  id: string;
  role: string;
}

export interface QuestionContext {
  id: string;
  authorId?: string;
  categoryId?: string;
}

/**
 * Checks if a user has permission to view a given question.
 */
export function canViewQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;
  
  // Superadmin, Dean, and Team Lead can view all questions
  if (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.DEAN ||
    user.role === UserRole.TEAMLEAD
  ) {
    return true;
  }

  // Teachers can view questions they authored or general category questions
  if (user.role === UserRole.TEACHER) {
    return true;
  }

  return false;
}

/**
 * Checks if a user has permission to edit a given question.
 */
export function canEditQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  const isAuthor = question.authorId === user.id;

  // Superadmin, Dean, and Team Lead can edit any question
  if (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.DEAN ||
    user.role === UserRole.TEAMLEAD
  ) {
    return true;
  }

  // Author (Teacher) can edit their own questions
  if (isAuthor && user.role === UserRole.TEACHER) {
    return true;
  }

  return false;
}

/**
 * Checks if a user can delete a question.
 */
export function canDeleteQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  const isAuthor = question.authorId === user.id;

  if (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.DEAN ||
    user.role === UserRole.TEAMLEAD
  ) {
    return true;
  }

  if (user.role === UserRole.TEACHER && isAuthor) {
    return true;
  }

  return false;
}
