import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import { hashedPassword, verifyPassword } from "../../utils/hash";
import { signJWT, verifyJWT } from "../../utils/jwt.utils";
import { sendPasswordResetEmail } from "../mail.service";
import { z } from "zod";
export const reviewCenterLoginSchema = z.object({
    email: z.string().min(1, "Email or Employee ID is required"),
    password: z.string().min(1, "Password is required"),
});
export const reviewCenterForgotPasswordSchema = z.object({
    email: z.string().email("Valid email address is required"),
});
export const reviewCenterResetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(),
});
export const reviewCenterFirstLoginSetupSchema = z
    .object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().optional(),
    acceptedPrivacyPolicy: z.boolean().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export class ReviewCenterAuthService {
    db = prisma;
    async login(data) {
        const parsed = reviewCenterLoginSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { email: inputIdent, password } = parsed.data;
        const normalizedIdent = inputIdent.trim().toLowerCase();
        // Check database for ReviewCenterRepresentativeUser by email or employeeId
        let repUser = await this.db.reviewCenterRepresentativeUser.findFirst({
            where: {
                OR: [{ email: normalizedIdent }, { employeeId: inputIdent.trim() }],
            },
            include: {
                reviewCenter: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
            },
        });
        if (!repUser) {
            throw new ApiError(401, "Invalid Review Center credentials");
        }
        const accountStatus = repUser.accountStatus;
        if (accountStatus === "DEACTIVATED") {
            throw new ApiError(403, "Your account has been deactivated. Please contact your administrator for assistance.");
        }
        const isValidPassword = (await verifyPassword(repUser.password, password)) ||
            repUser.password === password;
        if (!isValidPassword) {
            throw new ApiError(401, "Invalid Review Center credentials");
        }
        await this.db.reviewCenterRepresentativeUser.update({
            where: { id: repUser.id },
            data: {
                isActive: true,
                lastActiveAt: new Date(),
            },
        });
        const { password: _pw, ...sanitizedUser } = repUser;
        const mustChangePassword = repUser.mustChangePassword !== false;
        const termsAcceptedAt = repUser.termsAcceptedAt || null;
        return {
            ...sanitizedUser,
            mustChangePassword,
            termsAcceptedAt,
            lastActiveAt: new Date(),
            role: "REVIEW_CENTER_REPRESENTATIVE",
        };
    }
    async getMe(id) {
        const repUser = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id },
            include: {
                reviewCenter: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        contactEmail: true,
                        contactPhone: true,
                    },
                },
            },
        });
        if (!repUser) {
            throw new ApiError(404, "Review center representative profile not found");
        }
        const { password: _pw, ...sanitizedUser } = repUser;
        const mustChangePassword = repUser.mustChangePassword !== false;
        const termsAcceptedAt = repUser.termsAcceptedAt || null;
        return {
            ...sanitizedUser,
            mustChangePassword,
            termsAcceptedAt,
            role: "REVIEW_CENTER_REPRESENTATIVE",
        };
    }
    async acceptTerms(userId) {
        const user = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError(404, "Review center user account not found");
        }
        const now = new Date();
        const updated = await this.db.reviewCenterRepresentativeUser.update({
            where: { id: userId },
            data: {
                termsAcceptedAt: now,
                lastActiveAt: now,
            },
        });
        const { password: _pw, ...sanitizedUser } = updated;
        return {
            ...sanitizedUser,
            mustChangePassword: updated.mustChangePassword !== false,
            termsAcceptedAt: now,
            role: "REVIEW_CENTER_REPRESENTATIVE",
        };
    }
    async firstLoginSetup(userId, data) {
        const parsed = reviewCenterFirstLoginSetupSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            const firstErrorMessage = Object.values(errors).flat()[0] || "Validation failed";
            throw new ApiError(400, firstErrorMessage, [JSON.stringify(errors)]);
        }
        const user = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError(404, "User account not found");
        }
        const isSameAsCurrent = await verifyPassword(user.password, parsed.data.password);
        if (isSameAsCurrent || user.password === parsed.data.password) {
            throw new ApiError(400, "New password must be different from your current temporary password");
        }
        const hash = await hashedPassword(parsed.data.password);
        const now = new Date();
        const updatedUser = await this.db.reviewCenterRepresentativeUser.update({
            where: { id: userId },
            data: {
                password: hash,
                mustChangePassword: false,
                termsAcceptedAt: now,
                lastActiveAt: now,
            },
            include: {
                reviewCenter: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
            },
        });
        const { password: _pw, ...sanitizedUser } = updatedUser;
        return {
            ...sanitizedUser,
            mustChangePassword: false,
            termsAcceptedAt: now,
            role: "REVIEW_CENTER_REPRESENTATIVE",
        };
    }
    async forgotPassword(data) {
        const parsed = reviewCenterForgotPasswordSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Valid email address is required", [
                JSON.stringify(errors),
            ]);
        }
        const { email } = parsed.data;
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.db.reviewCenterRepresentativeUser.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { email: { equals: normalizedEmail, mode: "insensitive" } },
                ],
            },
        });
        if (!user) {
            console.log(`\n[RCAuthService] Password reset requested for: ${email}`);
            console.log(`⚠️  User with email "${email}" was NOT found in reviewCenterRepresentativeUser table.`);
        }
        else {
            console.log(`\n[RCAuthService] Password reset requested for: ${email} (User: ${user.name})`);
            const resetToken = signJWT({
                id: user.id,
                email: user.email,
                type: "rc_password_reset",
                sig: user.password ? user.password.slice(-12) : undefined,
            }, "5m");
            const frontendUrl = process.env.REVIEW_CENTER_FRONTEND_URL ||
                process.env.FRONTEND_URL ||
                "http://localhost:5173";
            const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
            await sendPasswordResetEmail({
                toEmail: user.email,
                resetToken,
                userName: user.name,
                portalName: "Review Center Portal",
                resetUrl,
            });
        }
        return {
            message: "If an account with that email exists, password reset instructions have been sent.",
        };
    }
    async verifyResetToken(token) {
        if (!token) {
            throw new ApiError(400, "Password reset token is required");
        }
        const { payload, expired } = verifyJWT(token);
        if (expired || !payload) {
            throw new ApiError(400, "This password reset link has expired (links are valid for 5 minutes). Please request a new one.");
        }
        const tokenPayload = payload;
        if (tokenPayload.type !== "rc_password_reset" &&
            tokenPayload.type !== "password_reset") {
            throw new ApiError(400, "Invalid password reset token type");
        }
        const user = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id: tokenPayload.id },
        });
        if (!user) {
            throw new ApiError(404, "Review center user account not found");
        }
        if (tokenPayload.sig && tokenPayload.sig !== user.password.slice(-12)) {
            throw new ApiError(400, "This password reset link has already been used. Please request a new reset email.");
        }
        return {
            valid: true,
            email: user.email,
            name: user.name,
        };
    }
    async resetPassword(data) {
        const parsed = reviewCenterResetPasswordSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { token, newPassword, confirmPassword } = parsed.data;
        if (confirmPassword && newPassword !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }
        const { payload, expired } = verifyJWT(token);
        if (expired || !payload) {
            throw new ApiError(400, "This password reset link has expired (links are valid for 5 minutes). Please request a new one.");
        }
        const tokenPayload = payload;
        if (tokenPayload.type !== "rc_password_reset" &&
            tokenPayload.type !== "password_reset") {
            throw new ApiError(400, "Invalid password reset token type");
        }
        const user = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id: tokenPayload.id },
        });
        if (!user) {
            throw new ApiError(404, "Review center user account not found");
        }
        if (tokenPayload.sig && tokenPayload.sig !== user.password.slice(-12)) {
            throw new ApiError(400, "This password reset link has already been used. Please request a new reset email.");
        }
        const hash = await hashedPassword(newPassword);
        await this.db.reviewCenterRepresentativeUser.update({
            where: { id: user.id },
            data: { password: hash },
        });
        return { message: "Password has been reset successfully." };
    }
    async updateProfile(userId, data) {
        const repUser = await this.db.reviewCenterRepresentativeUser.findUnique({
            where: { id: userId },
        });
        if (!repUser) {
            throw new ApiError(404, "Review center representative profile not found");
        }
        const updateData = {};
        if (data.name && data.name.trim()) {
            updateData.name = data.name.trim();
            if (data.firstName === undefined && data.lastName === undefined) {
                const parts = data.name.trim().split(" ");
                if (parts.length > 1) {
                    updateData.firstName = parts[0];
                    updateData.lastName = parts.slice(1).join(" ");
                }
                else {
                    updateData.firstName = data.name.trim();
                    updateData.lastName = null;
                }
            }
        }
        if (data.firstName !== undefined) {
            updateData.firstName = data.firstName.trim() || null;
        }
        if (data.lastName !== undefined) {
            updateData.lastName = data.lastName.trim() || null;
        }
        if (!data.name && (data.firstName !== undefined || data.lastName !== undefined)) {
            const fn = updateData.firstName !== undefined ? updateData.firstName : (repUser.firstName || "");
            const ln = updateData.lastName !== undefined ? updateData.lastName : (repUser.lastName || "");
            const combined = `${fn || ""} ${ln || ""}`.trim();
            if (combined) {
                updateData.name = combined;
            }
        }
        if (data.phonenumber !== undefined) {
            updateData.phonenumber = data.phonenumber.trim();
        }
        if (data.employeeId !== undefined && data.employeeId.trim()) {
            updateData.employeeId = data.employeeId.trim();
        }
        if (data.location !== undefined) {
            updateData.location = data.location.trim();
        }
        // Password change verification
        if (data.newPassword && data.newPassword.trim()) {
            if (!data.currentPassword) {
                throw new ApiError(400, "Current password is required to set a new password.");
            }
            if (data.newPassword.length < 6) {
                throw new ApiError(400, "New password must be at least 6 characters.");
            }
            const isCurrentValid = (await verifyPassword(repUser.password, data.currentPassword)) ||
                repUser.password === data.currentPassword;
            if (!isCurrentValid) {
                throw new ApiError(400, "Current password does not match our records.");
            }
            updateData.password = await hashedPassword(data.newPassword);
        }
        // Handle companyName changes
        if (data.companyName && data.companyName.trim()) {
            const newCompanyName = data.companyName.trim();
            const oldCompanyName = repUser.companyName;
            updateData.companyName = newCompanyName;
            if (oldCompanyName.toLowerCase() !== newCompanyName.toLowerCase()) {
                // Sync ReviewCenter model if linked
                if (repUser.reviewCenterId) {
                    await this.db.reviewCenter.update({
                        where: { id: repUser.reviewCenterId },
                        data: {
                            name: newCompanyName,
                            ...(data.location ? { location: data.location.trim() } : {}),
                        },
                    });
                }
                // Sync candidates
                const rcFilter = repUser.reviewCenterId
                    ? { reviewCenterId: repUser.reviewCenterId }
                    : { companyName: { equals: oldCompanyName, mode: "insensitive" } };
                await this.db.reviewCenterCandidate.updateMany({
                    where: rcFilter,
                    data: { companyName: newCompanyName },
                });
                // Sync assessments
                await this.db.reviewCenterAssessment.updateMany({
                    where: rcFilter,
                    data: { companyName: newCompanyName },
                });
                // Sync school years
                if (this.db.reviewCenterSchoolYear) {
                    await this.db.reviewCenterSchoolYear.updateMany({
                        where: rcFilter,
                        data: { companyName: newCompanyName },
                    });
                }
            }
            else if (data.location && repUser.reviewCenterId) {
                // Update location on ReviewCenter
                await this.db.reviewCenter.update({
                    where: { id: repUser.reviewCenterId },
                    data: { location: data.location.trim() },
                });
            }
        }
        else if (data.location && repUser.reviewCenterId) {
            await this.db.reviewCenter.update({
                where: { id: repUser.reviewCenterId },
                data: { location: data.location.trim() },
            });
        }
        const updated = await this.db.reviewCenterRepresentativeUser.update({
            where: { id: userId },
            data: updateData,
            include: {
                reviewCenter: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        contactEmail: true,
                        contactPhone: true,
                    },
                },
            },
        });
        const { password: _pw, ...sanitizedUser } = updated;
        return {
            ...sanitizedUser,
            role: "REVIEW_CENTER_REPRESENTATIVE",
        };
    }
}
export const reviewCenterAuthService = new ReviewCenterAuthService();
