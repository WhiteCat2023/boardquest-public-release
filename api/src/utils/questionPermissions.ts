export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  TEAMLEAD = "TEAMLEAD",
  TEACHER = "TEACHER",
}

export enum QuestionStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  NEEDS_REVISION = "NEEDS_REVISION",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface UserContext {
  id: string;
  role: string;
  departmentId?: string;
}

export interface QuestionContext {
  id: string;
  authorId?: string;
  collaboratorIds?: string[];
  status: string;
  isPublished?: boolean;
  categoryId?: string;
}

/**
 * Checks if a user has permission to view a given question.
 */
export function canViewQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;
  
  // Superadmin, Admin, and Team Lead can view all questions
  if (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.TEAMLEAD
  ) {
    return true;
  }

  const isCollaborator = Boolean(
    question.collaboratorIds && Array.isArray(question.collaboratorIds) && question.collaboratorIds.includes(user.id)
  );

  // Teachers can view published questions, questions they authored, or questions shared as collaborator
  if (user.role === UserRole.TEACHER) {
    if (question.isPublished) return true;
    if (question.authorId && question.authorId === user.id) return true;
    if (isCollaborator) return true;
  }

  return false;
}

/**
 * Checks if a user has permission to edit a given question.
 * Note: Published questions cannot be directly edited by anyone without unpublishing first.
 */
export function canEditQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  // Published questions are locked for editing
  if (question.isPublished) return false;

  const isAuthor = question.authorId === user.id;
  const isCollaborator = Boolean(
    question.collaboratorIds && Array.isArray(question.collaboratorIds) && question.collaboratorIds.includes(user.id)
  );

  // Superadmin and Admin can edit any unpublished question
  if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) {
    return true;
  }

  // Team Lead can edit draft, pending review, or revision questions
  if (user.role === UserRole.TEAMLEAD) {
    return true;
  }

  // Author or explicitly granted Collaborator can edit
  if ((isAuthor || isCollaborator) && user.role === UserRole.TEACHER) {
    return (
      question.status === QuestionStatus.DRAFT ||
      question.status === QuestionStatus.NEEDS_REVISION ||
      question.status === QuestionStatus.PENDING_REVIEW
    );
  }

  return false;
}

/**
 * Checks if a user can delete a question.
 * Note: Published questions cannot be deleted without unpublishing first.
 */
export function canDeleteQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  if (question.isPublished) return false;

  const isAuthor = question.authorId === user.id;

  if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.TEACHER && isAuthor) {
    return question.status === QuestionStatus.DRAFT;
  }

  return false;
}

/**
 * Checks if a user can provide review feedback or request revisions.
 */
export function canFeedbackQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  if (question.isPublished) return false;

  return (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.TEAMLEAD
  );
}

/**
 * Checks if a user can approve a question.
 */
export function canApproveQuestion(user: UserContext, question: QuestionContext): boolean {
  if (!user || !user.role) return false;

  return (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.TEAMLEAD
  );
}

/**
 * Checks if a user can publish or unpublish a question.
 */
export function canPublishQuestion(user: UserContext, question?: QuestionContext): boolean {
  if (!user || !user.role) return false;

  return (
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.TEAMLEAD
  );
}
