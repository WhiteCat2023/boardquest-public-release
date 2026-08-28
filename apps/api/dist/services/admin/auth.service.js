import { ApiError } from "../../utils/apiError";
import { hashedPassword, verifyPassword } from "../../utils/hash";
import { signJWT, verifyJWT } from "../../utils/jwt.utils";
import { sendPasswordResetEmail } from "../mail.service";
import prisma from "../prisma";
import { ensureSuperAdminExists } from "./bootstrap.service";
import { superAdminCredentials, getSuperAdminProfile, isSuperAdmin, } from "../../config/credentials";
import { z } from "zod";
/*

addNewAdminUser = Functionality for super admin to send sign up link to new admin users

*/
export const addNewAdminUserSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"], "Role required"),
});
// Alias for backward compatibility
export const addNewAdminUser = addNewAdminUserSchema;
export const createAdminUserSchema = z
    .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email"),
    role: z.enum(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"], "Role required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 11 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
        .string()
        .min(6, "Confirm Password must be at least 6 characters"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
})
    .refine((data) => Boolean((data.name && data.name.trim().length > 0) ||
    (data.firstName && data.firstName.trim().length > 0) ||
    (data.lastName && data.lastName.trim().length > 0)), {
    message: "First name and last name, or full name, are required",
});
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is required"),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
export const resetPasswordSchema = z
    .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
});
export const createReviewCenterRepUserSchema = z
    .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    companyName: z.string().min(1, "Company Name is required"),
    phoneNumber: z.string().min(11, "Phone number must be at least 11 digits"),
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z
        .string()
        .min(12, "Confirm Password must be at least 12 characters"),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});
export class AuthService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async login(data) {
        const parsed = loginSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Email or Password is not valid", [
                JSON.stringify(errors),
            ]);
        }
        const { email, password } = parsed.data;
        // Environment Super Admin check (Bypasses database storage completely or uses seeded Super Admin)
        const inputIdent = email.trim().toLowerCase();
        if (superAdminCredentials.password &&
            inputIdent === superAdminCredentials.email) {
            if (password !== superAdminCredentials.password) {
                throw new ApiError(401, "Invalid email or password");
            }
            const dbSuperAdmin = await ensureSuperAdminExists();
            if (dbSuperAdmin) {
                return {
                    id: dbSuperAdmin.id,
                    employeeId: dbSuperAdmin.employeeId || superAdminCredentials.employeeId,
                    email: dbSuperAdmin.email,
                    name: dbSuperAdmin.name,
                    role: "SUPERADMIN",
                    phoneNumber: dbSuperAdmin.phoneNumber || superAdminCredentials.phoneNumber,
                    location: "Main HQ",
                    accountStatus: "ACTIVE",
                    isActive: true,
                    lastActiveAt: new Date(),
                    createdAt: dbSuperAdmin.createdAt,
                    updatedAt: dbSuperAdmin.updatedAt,
                };
            }
            return getSuperAdminProfile();
        }
        const user = await this.db.adminUser.findUnique({
            where: { email },
            select: {
                password: true,
                id: true,
                employeeId: true,
                email: true,
                name: true,
                role: true,
                phoneNumber: true,
                accountStatus: true,
                isActive: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
                handledSubjectIds: true,
                handledSubjects: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!user) {
            const isRep = await this.db.reviewCenterRepresentativeUser.findUnique({
                where: { email },
            });
            if (isRep) {
                throw new ApiError(403, "External Review Center accounts cannot access the admin management portal. Please log in via the Review Center portal.");
            }
            throw new ApiError(401, "Invalid email or password");
        }
        const isValid = (await verifyPassword(user.password, password)) ||
            user.password === password;
        if (!isValid) {
            throw new ApiError(401, "Invalid email or password");
        }
        const accountStatus = user.accountStatus;
        if (accountStatus === "DEACTIVATED") {
            throw new ApiError(403, "Your account has been deactivated. Please contact your administrator for assistance.");
        }
        await this.db.adminUser.update({
            where: { id: user.id },
            data: {
                isActive: true,
                lastActiveAt: new Date(),
            },
        });
        const { password: _password, ...sanitizeUser } = user;
        return {
            ...sanitizeUser,
            accountStatus,
            isActive: true,
        };
    }
    async createNewAdminUser(data) {
        const parsed = addNewAdminUserSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten();
            throw new ApiError(400, "Email or Password is not valid", [
                JSON.stringify(errors),
            ]);
        }
        //sends email with sign up link to the new admin user
    }
    createNewStudent() { }
    createNewPartner() { }
    async signupAdmin(data) {
        const parsed = createAdminUserSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten();
            throw new ApiError(400, "Email or Password is not valid", [
                JSON.stringify(errors),
            ]);
        }
        const { employeeId, name: rawName, firstName: rawFirst, lastName: rawLast, email, role, phoneNumber, password, } = parsed.data;
        let firstName = rawFirst?.trim() || "";
        let lastName = rawLast?.trim() || "";
        let name = rawName?.trim() || "";
        if (!name && (firstName || lastName)) {
            name = [firstName, lastName].filter(Boolean).join(" ").trim();
        }
        else if (name && !firstName && !lastName) {
            const parts = name.split(" ");
            firstName = parts[0] || "";
            lastName = parts.slice(1).join(" ") || "";
        }
        else if (firstName && lastName && !name) {
            name = `${firstName} ${lastName}`.trim();
        }
        const existingUser = await this.db.adminUser.findFirst({
            where: { OR: [{ email }, { employeeId }] },
        });
        if (existingUser) {
            throw new ApiError(409, "Email already in use");
        }
        const hash = await hashedPassword(password);
        const user = await this.db.adminUser.create({
            data: {
                employeeId,
                email,
                name: name || "Admin User",
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                role,
                phoneNumber,
                password: hash,
            },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
            },
        });
        return user;
    }
    async signupReviewCenterRep(data) {
        const parsed = createReviewCenterRepUserSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten();
            throw new ApiError(400, "Email or Password is not valid", [
                JSON.stringify(errors),
            ]);
        }
        // SEND SIGN UP LINK TO REVIEW CENTER REPRESENTATIVE
    }
    async forgotPassword(data) {
        const parsed = forgotPasswordSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten();
            throw new ApiError(400, "Valid email address is required", [
                JSON.stringify(errors),
            ]);
        }
        const { email } = parsed.data;
        const user = await this.db.adminUser.findUnique({ where: { email } });
        if (!user) {
            console.log(`\n[AuthService] Password reset requested for: ${email}`);
            console.log(`⚠️  User with email "${email}" was NOT found in the database. No email sent.`);
        }
        else {
            console.log(`\n[AuthService] Password reset requested for: ${email} (User: ${user.name})`);
            const resetToken = signJWT({ id: user.id, email: user.email, type: "password_reset" }, "1h");
            await sendPasswordResetEmail({
                toEmail: user.email,
                resetToken,
                userName: user.name,
            });
        }
        return {
            message: "If an account with that email exists, password reset instructions have been sent.",
        };
    }
    async resetPassword(data) {
        const parsed = resetPasswordSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten();
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { token, newPassword } = parsed.data;
        const { payload, expired } = verifyJWT(token);
        if (expired || !payload) {
            throw new ApiError(400, "Invalid or expired password reset token");
        }
        const tokenPayload = payload;
        if (tokenPayload.type !== "password_reset") {
            throw new ApiError(400, "Invalid password reset token type");
        }
        const user = await this.db.adminUser.findUnique({
            where: { id: tokenPayload.id },
        });
        if (!user) {
            throw new ApiError(404, "User account not found");
        }
        const hash = await hashedPassword(newPassword);
        await this.db.adminUser.update({
            where: { id: user.id },
            data: { password: hash },
        });
        return { message: "Password has been reset successfully." };
    }
    async updateProfile(userId, data) {
        if (isSuperAdmin(userId)) {
            throw new ApiError(400, "Environment Super Admin account profile cannot be modified.");
        }
        const user = await this.db.adminUser.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError(404, "User account not found");
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.email)
            updateData.email = data.email;
        if (data.phoneNumber)
            updateData.phoneNumber = data.phoneNumber;
        if (data.password) {
            updateData.password = await hashedPassword(data.password);
        }
        const updated = await this.db.adminUser.update({
            where: { id: userId },
            data: updateData,
        });
        const { password, ...sanitized } = updated;
        return sanitized;
    }
}
export const authService = new AuthService();
export const login = authService.login.bind(authService);
export const createNewAdminUser = authService.createNewAdminUser.bind(authService);
export const createNewStudent = authService.createNewStudent.bind(authService);
export const createNewPartner = authService.createNewPartner.bind(authService);
export const signupAdmin = authService.signupAdmin.bind(authService);
export const signupReviewCenterRep = authService.signupReviewCenterRep.bind(authService);
export const forgotPassword = authService.forgotPassword.bind(authService);
export const resetPassword = authService.resetPassword.bind(authService);
export const updateProfile = authService.updateProfile.bind(authService);
