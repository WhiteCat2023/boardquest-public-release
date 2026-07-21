import { UserRole } from "@/types/question";
import type { RoleType, RoleOption } from "../types";

/**
 * Returns allowed roles that a given user role can create.
 */
export const getAllowedRolesToCreate = (currentUserRole: RoleType): RoleOption[] => {
  if (currentUserRole === UserRole.SUPERADMIN) {
    return [
      {
        value: UserRole.ADMIN,
        label: "Admin",
        description: "Full management access across departments and faculty accounts."
      },
      {
        value: UserRole.TEAMLEAD,
        label: "Co-Admin (Team Lead)",
        description: "Departmental lead capable of reviewing questions and managing teachers."
      },
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description: "Academic staff allowed to create questions and manage course materials."
      },
    ];
  }
  if (currentUserRole === UserRole.ADMIN) {
    return [
      {
        value: UserRole.TEAMLEAD,
        label: "Co-Admin (Team Lead)",
        description: "Departmental lead capable of reviewing questions and managing teachers."
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
  if (creatorRole === UserRole.ADMIN) {
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
      return "bg-red-50 text-red-700 border-red-200";
    case UserRole.ADMIN:
      return "bg-orange-50 text-orange-700 border-orange-200";
    case UserRole.TEAMLEAD:
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case UserRole.TEACHER:
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
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
