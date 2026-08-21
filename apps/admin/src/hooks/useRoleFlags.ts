import useAuth from "./useAuth";

export interface RoleFlags {
  isSuperAdmin: boolean;
  isDean: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isTeamLead: boolean;
  isDeanOrSuperAdmin: boolean;
  isAdminOrSuperAdmin: boolean;
  isStaff: boolean;
}

export function getRoleFlags(role?: string): RoleFlags {
  const isSuperAdmin = role === "SUPERADMIN";
  const isDean = role === "DEAN";
  const isAdmin = isDean; // backward compatibility
  const isTeacher = role === "TEACHER";
  const isTeamLead = role === "TEAMLEAD";
  const isDeanOrSuperAdmin = isSuperAdmin || isDean;

  return {
    isSuperAdmin,
    isDean,
    isAdmin,
    isTeacher,
    isTeamLead,
    isDeanOrSuperAdmin,
    isAdminOrSuperAdmin: isDeanOrSuperAdmin,
    isStaff: isSuperAdmin || isDean || isTeamLead,
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
