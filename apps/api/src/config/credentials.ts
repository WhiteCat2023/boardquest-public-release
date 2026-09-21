/**
 * Standardized Super Admin & System Credentials Configuration
 *
 * Dedicated hardcoded credentials and configuration for the system Super Admin.
 * Used across services, bootstrap routines, middleware, and controllers without environment variable dependency.
 */

export interface SuperAdminCredentialsConfig {
  id: string;
  employeeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber: string;
  role: "SUPERADMIN";
  location: string;
  avatarUrl?: string | null;
  accountStatus: "ACTIVE" | "DEACTIVATED";
  isActive: boolean;
}

export interface SuperAdminProfile {
  id: string;
  employeeId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "SUPERADMIN";
  phoneNumber: string;
  location: string;
  avatarUrl?: string | null;
  accountStatus: "ACTIVE" | "DEACTIVATED";
  isActive: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hardcoded Super Admin Credentials
 */
export const superAdminCredentials: SuperAdminCredentialsConfig = {
  id: "000000000000000000000001",
  employeeId: "SA-0001",
  email: "boardquest.swu@gmail.com",
  password: "Berndt@123",
  firstName: "Super",
  lastName: "Admin",
  name: "Super Admin",
  phoneNumber: "00000000000",
  role: "SUPERADMIN",
  location: "Main HQ",
  avatarUrl: null,
  accountStatus: "ACTIVE",
  isActive: true,
};

/**
 * Returns a sanitized Super Admin profile without sensitive fields (password).
 */
export function getSuperAdminProfile(): SuperAdminProfile {
  return {
    id: superAdminCredentials.id,
    employeeId: superAdminCredentials.employeeId,
    name: superAdminCredentials.name,
    firstName: superAdminCredentials.firstName,
    lastName: superAdminCredentials.lastName,
    email: superAdminCredentials.email,
    role: superAdminCredentials.role,
    phoneNumber: superAdminCredentials.phoneNumber,
    location: superAdminCredentials.location,
    avatarUrl: superAdminCredentials.avatarUrl ?? null,
    accountStatus: "ACTIVE",
    isActive: true,
    lastActiveAt: new Date(),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date(),
  };
}

/**
 * Check whether a given identifier (ID or email) matches the Super Admin.
 */
export function isSuperAdmin(identifier?: string | null): boolean {
  if (!identifier) return false;
  const normalized = identifier.trim().toLowerCase();

  return (
    identifier === superAdminCredentials.id ||
    identifier === "superadmin-env-id" ||
    normalized === superAdminCredentials.email
  );
}

export default superAdminCredentials;
