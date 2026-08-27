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

const normalizeRole = (role?: any): string => {
  if (!role) return "";
  const s = String(role).toUpperCase().trim();
  if (s === "SUPERADMIN") return "SUPERADMIN";
  if (s === "DEAN") return "DEAN";
  if (s === "TEAMLEAD") return "TEAMLEAD";
  if (s === "TEACHER") return "TEACHER";
  if (s === "REVIEWCENTER" || s === "EXTERNAL") return "REVIEWCENTER";
  return s;
};

export function useQuestionPermissions(question?: Question | null): QuestionPermissions {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId = currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;
  const currentUserRole = currentUser?.role || (auth as any)?.data?.user?.role;
  const normRole = normalizeRole(currentUserRole);

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
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      (normRole === "TEACHER" && isAuthor) ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      (currentUserRole === UserRole.TEACHER && isAuthor)
  );

  // Edit Permissions
  const canEdit = Boolean(
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      ((normRole === "TEACHER" || currentUserRole === UserRole.TEACHER) &&
        isAuthor &&
        (!question?.status ||
          question?.status === QuestionStatus.PENDING_REVISION ||
          question?.status === QuestionStatus.PENDING_REVIEW ||
          (question?.status as string) === "NEEDS_REVISION" ||
          (question?.status as string) === "DRAFT"))
  );

  // Delete Permissions
  const canDelete = Boolean(
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      ((normRole === "TEACHER" || currentUserRole === UserRole.TEACHER) &&
        isAuthor &&
        (!question?.status ||
          question?.status === QuestionStatus.PENDING_REVIEW ||
          question?.status === QuestionStatus.PENDING_REVISION ||
          (question?.status as string) === "NEEDS_REVISION" ||
          (question?.status as string) === "DRAFT"))
  );

  // Feedback & Revision Request Permissions
  const canFeedback = Boolean(
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD
  );

  // Approval Permissions
  const canApprove = Boolean(
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD
  );

  // Comment / Feedback reply permissions
  const canComment = Boolean(
    normRole === "SUPERADMIN" ||
      normRole === "DEAN" ||
      normRole === "TEAMLEAD" ||
      currentUserRole === UserRole.SUPERADMIN ||
      currentUserRole === UserRole.DEAN ||
      currentUserRole === UserRole.TEAMLEAD ||
      ((normRole === "TEACHER" || currentUserRole === UserRole.TEACHER) && isAuthor)
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
