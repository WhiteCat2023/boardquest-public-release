import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import { hashedPassword, verifyPassword } from "../../utils/hash";
import { z } from "zod";
export const reviewCenterLoginSchema = z.object({
    email: z.string().min(1, "Email or Employee ID is required"),
    password: z.string().min(1, "Password is required"),
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
}
export const reviewCenterAuthService = new ReviewCenterAuthService();
