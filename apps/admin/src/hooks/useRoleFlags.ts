import useAuth from "./useAuth";

export interface RoleFlags {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isTeamLead: boolean;
  isAdminOrSuperAdmin: boolean;
  isStaff: boolean;
}

export function getRoleFlags(role?: string): RoleFlags {
  const isSuperAdmin = role === "SUPERADMIN";
  const isAdmin = role === "ADMIN";
  const isTeacher = role === "TEACHER";
  const isTeamLead = role === "TEAMLEAD";

  return {
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isTeamLead,
    isAdminOrSuperAdmin: isSuperAdmin || isAdmin,
    isStaff: isSuperAdmin || isAdmin || isTeamLead,
  };
}

export function useRoleFlags() {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const userRole = currentUser?.role as string | undefined;

  const flags = getRoleFlags(userRole);

  const handledCategories: Array<{ id: string; name: string }> =
    currentUser?.handledCategories || [];
  const handledCategoryIds: string[] =
    currentUser?.handledCategoryIds ||
    handledCategories.map((cat) => cat.id) ||
    [];

  const isSubjectAssigned = (categoryId?: string): boolean => {
    if (!categoryId) return false;
    if (flags.isAdminOrSuperAdmin) return true;
    return handledCategoryIds.includes(categoryId);
  };

  return {
    currentUser,
    userRole,
    handledCategories,
    handledCategoryIds,
    isSubjectAssigned,
    ...flags,
  };
}

export default useRoleFlags;
