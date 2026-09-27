import { UserRole } from "@/types/question";
import type { RoleType, RoleOption } from "@/features/users";

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

/**
 * Returns allowed roles that a given user role can create.
 */
export const getAllowedRolesToCreate = (
  currentUserRole: RoleType,
): RoleOption[] => {
  const norm = normalizeRole(currentUserRole);
  if (norm === "SUPERADMIN" || currentUserRole === UserRole.SUPERADMIN) {
    return [
      {
        value: UserRole.DEAN,
        label: "Dean",
        description:
          "Full management access across academic programs and user accounts.",
      },
      {
        value: UserRole.TEAMLEAD,
        label: "Team Lead",
        description:
          "Academic lead capable of reviewing questions and managing instructors.",
      },
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description:
          "Academic staff allowed to create questions and manage course materials.",
      },
    ];
  }
  if (norm === "DEAN" || currentUserRole === UserRole.DEAN) {
    return [
      {
        value: UserRole.TEAMLEAD,
        label: "Team Lead",
        description:
          "Academic lead capable of reviewing questions and managing instructors.",
      },
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description:
          "Academic staff allowed to create questions and manage course materials.",
      },
    ];
  }
  if (norm === "TEAMLEAD" || currentUserRole === UserRole.TEAMLEAD) {
    return [
      {
        value: UserRole.TEACHER,
        label: "Teacher",
        description:
          "Academic staff allowed to create questions and manage course materials.",
      },
    ];
  }
  return [];
};

/**
 * Returns role options that can be filtered based on the current user's role.
 * - Superadmin: Dean, Team Lead, Teacher
 * - Dean: Team Lead, Teacher
 * - Teamlead: No filter (only manages Teacher accounts)
 */
const MANAGED_ROLES_MAP: Record<string, { value: string; label: string }[]> = {
  SUPERADMIN: [
    { value: "DEAN", label: "Dean" },
    { value: "TEAMLEAD", label: "Team Lead" },
    { value: "TEACHER", label: "Teacher" },
  ],
  DEAN: [
    { value: "TEAMLEAD", label: "Team Lead" },
    { value: "TEACHER", label: "Teacher" },
  ],
  TEAMLEAD: [],
};
export const getManagedRolesForFilter = (role?: RoleType | string) => {
  const norm = normalizeRole(role);
  return MANAGED_ROLES_MAP[norm] || [];
};

/**
 * Checks if creator role has permissions to manage (e.g. delete) target role.
 */
export const isAllowedToManageRole = (
  creatorRole: RoleType,
  targetRole: RoleType,
): boolean => {
  const cNorm = normalizeRole(creatorRole);
  const tNorm = normalizeRole(targetRole);
  if (cNorm === "SUPERADMIN" || creatorRole === UserRole.SUPERADMIN)
    return true;
  if (cNorm === "DEAN" || creatorRole === UserRole.DEAN) {
    return (
      tNorm === "TEAMLEAD" ||
      tNorm === "TEACHER" ||
      tNorm === "REVIEWCENTER" ||
      tNorm === "EXTERNAL" ||
      targetRole === UserRole.TEAMLEAD ||
      targetRole === UserRole.TEACHER ||
      targetRole === UserRole.REVIEWCENTER ||
      targetRole === UserRole.EXTERNAL
    );
  }
  if (cNorm === "TEAMLEAD" || creatorRole === UserRole.TEAMLEAD) {
    return tNorm === "TEACHER" || targetRole === UserRole.TEACHER;
  }
  return false;
};

/**
 * Utility to return styling classes for role badges.
 */
export const getRoleBadgeColor = (role: RoleType): string => {
  const norm = normalizeRole(role);
  switch (norm) {
    case "SUPERADMIN":
      return "bg-primary/10 text-primary border-primary/20";
    case "DEAN":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "TEAMLEAD":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    case "TEACHER":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "REVIEWCENTER":
    case "EXTERNAL":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

/**
 * Determines if a user member is currently online (active within last 5 minutes and account active).
 */
export const isUserOnline = (
  lastActiveAt?: string,
  isActive?: boolean,
): boolean => {
  if (isActive === false || !lastActiveAt) return false;
  const lastActiveDate = new Date(lastActiveAt);
  const diffMinutes = (Date.now() - lastActiveDate.getTime()) / (1000 * 60);
  return diffMinutes <= 5;
};

/**
 * Returns a human-friendly display title for a user role.
 */
export const getRoleTitle = (role?: RoleType | string | number): string => {
  const r = String(role || "").toUpperCase();
  switch (r) {
    case "SUPERADMIN":
      return "Super Administrator";
    case "DEAN":
      return "Dean";
    case "TEAMLEAD":
      return "Team Lead";
    case "TEACHER":
      return "Teacher";
    case "REVIEWCENTER":
    case "EXTERNAL":
      return "Review Center Partner";
    default:
      return role ? String(role) : "User Member";
  }
};

