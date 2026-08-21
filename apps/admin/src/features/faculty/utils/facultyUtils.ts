import { UserRole } from "@/types/question";
import type { RoleType, RoleOption } from "@/features/faculty";

/**
 * Returns allowed roles that a given user role can create.
 */
export const getAllowedRolesToCreate = (currentUserRole: RoleType): RoleOption[] => {
  if (currentUserRole === UserRole.SUPERADMIN) {
    return [
      {
        value: UserRole.DEAN,
        label: "Dean",
        description: "Full management access across academic programs and faculty accounts."
      },
      {
        value: UserRole.TEAMLEAD,
        label: "Co-Admin (Team Lead)",
        description: "Academic lead capable of reviewing questions and managing teachers."
      },
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description: "Academic staff allowed to create questions and manage course materials."
      },
    ];
  }
  if (currentUserRole === UserRole.DEAN) {
    return [
      {
        value: UserRole.TEAMLEAD,
        label: "Co-Admin (Team Lead)",
        description: "Academic lead capable of reviewing questions and managing teachers."
      },
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description: "Academic staff allowed to create questions and manage course materials."
      },
    ];
  }
  if (currentUserRole === UserRole.TEAMLEAD) {
    return [
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description: "Academic staff allowed to create questions and manage course materials."
      },
    ];
  }
  return [];
};

/**
 * Checks if creator role has permissions to manage (e.g. delete) target role.
 */
export const isAllowedToManageRole = (creatorRole: RoleType, targetRole: RoleType): boolean => {
  if (creatorRole === UserRole.SUPERADMIN) return true;
  if (creatorRole === UserRole.DEAN) {
    return targetRole === UserRole.TEAMLEAD || targetRole === UserRole.TEACHER;
  }
  if (creatorRole === UserRole.TEAMLEAD) {
    return targetRole === UserRole.TEACHER;
  }
  return false;
};

/**
 * Utility to return styling classes for role badges.
 */
export const getRoleBadgeColor = (role: RoleType): string => {
  switch (role) {
    case UserRole.SUPERADMIN:
      return "bg-primary/10 text-primary border-primary/20";
    case UserRole.DEAN:
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case UserRole.TEAMLEAD:
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    case UserRole.TEACHER:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Determines if a faculty member is currently online (active within last 5 minutes and account active).
 */
export const isUserOnline = (lastActiveAt?: string, isActive?: boolean): boolean => {
  if (isActive === false || !lastActiveAt) return false;
  const lastActiveDate = new Date(lastActiveAt);
  const diffMinutes = (Date.now() - lastActiveDate.getTime()) / (1000 * 60);
  return diffMinutes <= 5;
};
