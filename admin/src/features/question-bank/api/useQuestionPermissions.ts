import useAuth from "@/hooks/useAuth";
import { QuestionStatus, UserRole, type Question } from "@/types/question";

export interface QuestionPermissions {
  currentUserRole: string | undefined;
  currentUserId: string | undefined;
  isAuthor: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canFeedback: boolean;
  canApprove: boolean;
  canComment: boolean;
}

export function useQuestionPermissions(question?: Question | null): QuestionPermissions {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId = currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;
  const currentUserRole = currentUser?.role || (auth as any)?.data?.user?.role;

  if (!currentUserRole) {
    return {
      currentUserRole: undefined,
      currentUserId: undefined,
      isAuthor: false,
      canView: false,
      canEdit: false,
      canDelete: false,
      canFeedback: false,
      canApprove: false,
      canComment: false,
    };
  }

  const isAuthor = Boolean(
    question && question.authorId && currentUserId && question.authorId === currentUserId
  );

  // View Permissions
  const canView = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER && isAuthor)
  );

  // Edit Permissions
  const canEdit = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER &&
        isAuthor &&
        (question?.status === QuestionStatus.DRAFT ||
          question?.status === QuestionStatus.PENDING_REVISION ||
          question?.status === QuestionStatus.PENDING_REVIEW))
  );

  // Delete Permissions
  const canDelete = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      (currentUserRole === UserRole.TEACHER && isAuthor && question?.status === QuestionStatus.DRAFT)
  );

  // Feedback & Revision Request Permissions
  const canFeedback = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      currentUserRole === UserRole.TEAMLEAD
  );

  // Approval Permissions
  const canApprove = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      currentUserRole === UserRole.TEAMLEAD
  );

  // Comment / Feedback reply permissions
  const canComment = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.ADMIN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER && isAuthor)
  );

  return {
    currentUserRole,
    currentUserId,
    isAuthor,
    canView,
    canEdit,
    canDelete,
    canFeedback,
    canApprove,
    canComment,
  };
}

export default useQuestionPermissions;
