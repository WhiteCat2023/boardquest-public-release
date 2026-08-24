import useAuth from "@/hooks/useAuth";
import { UserRole, type Question } from "@/types/question";

export interface QuestionPermissions {
  currentUserRole: string | undefined;
  currentUserId: string | undefined;
  isAuthor: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
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
      canComment: false,
    };
  }

  const isAuthor = Boolean(
    question && question.authorId && currentUserId && question.authorId === currentUserId
  );

  // View Permissions
  const canView = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      currentUserRole === UserRole.TEACHER
  );

  // Edit Permissions
  const canEdit = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER && isAuthor)
  );

  // Delete Permissions
  const canDelete = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER && isAuthor)
  );

  // Comment permissions
  const canComment = Boolean(
    currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
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
    canComment,
  };
}

export default useQuestionPermissions;
