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
        // If no representative user exists in DB, check demo credentials or bootstrap one
        if (!repUser) {
            if ((normalizedIdent === "rep@reviewcenter.edu.ph" ||
                normalizedIdent === "rc-001") &&
                password === "password123") {
                // Try creating default demo review center and rep user
                const hash = await hashedPassword("password123");
                let defaultCenter = await this.db.reviewCenter.findFirst();
                if (!defaultCenter) {
                    defaultCenter = await this.db.reviewCenter.create({
                        data: {
                            name: "St. Jude Review Center HQ",
                            code: "RC-STJUDE",
                            location: "Manila, Philippines",
                            contactEmail: "contact@stjude.edu.ph",
                            contactPhone: "+63-2-8888-1234",
                        },
                    });
                }
                repUser = await this.db.reviewCenterRepresentativeUser.create({
                    data: {
                        employeeId: "RC-001",
                        name: "Dr. Roberto Cruz",
                        email: "rep@reviewcenter.edu.ph",
                        companyName: defaultCenter.name,
                        phonenumber: "+63-917-555-1234",
                        password: hash,
                        location: defaultCenter.location,
                        accountStatus: "ACTIVE",
                        isActive: true,
                        reviewCenterId: defaultCenter.id,
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
            }
            else {
                throw new ApiError(401, "Invalid Review Center credentials");
            }
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
        return {
            ...sanitizedUser,
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
        return {
            ...sanitizedUser,
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
            const resetToken = signJWT({ id: user.id, email: user.email, type: "rc_password_reset" }, "1h");
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
            throw new ApiError(400, "Invalid or expired password reset token");
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
        const hash = await hashedPassword(newPassword);
        await this.db.reviewCenterRepresentativeUser.update({
            where: { id: user.id },
            data: { password: hash },
        });
        return { message: "Password has been reset successfully." };
    }
}
export const reviewCenterAuthService = new ReviewCenterAuthService();
