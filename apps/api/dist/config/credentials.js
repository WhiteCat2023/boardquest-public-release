/**
 * Standardized Super Admin & System Credentials Configuration
 *
 * Dedicated hardcoded credentials and configuration for the system Super Admin.
 * Used across services, bootstrap routines, middleware, and controllers without environment variable dependency.
 */
/**
 * Hardcoded Super Admin Credentials
 */
export const superAdminCredentials = {
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
    accountStatus: "ACTIVE",
    isActive: true,
};
/**
 * Returns a sanitized Super Admin profile without sensitive fields (password).
 */
export function getSuperAdminProfile() {
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
export function isSuperAdmin(identifier) {
    if (!identifier)
        return false;
    const normalized = identifier.trim().toLowerCase();
    return (identifier === superAdminCredentials.id ||
        identifier === "superadmin-env-id" ||
        normalized === superAdminCredentials.email);
}
export default superAdminCredentials;
