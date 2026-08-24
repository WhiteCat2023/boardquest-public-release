import prisma from "../services/prisma";
import { verifyJWT } from "../utils/jwt.utils";
import { ensureSuperAdminExists } from "../services/admin/bootstrap.service";
import { isSuperAdmin, getSuperAdminProfile } from "../config/credentials";
export const authenticateToken = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken || req.cookies?.token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.slice(7); // Remove "Bearer " prefix
            }
        }
        if (!token) {
            res.status(401).json({
                message: "Access token is required",
                error: "UNAUTHORIZED",
            });
            return;
        }
        const { payload, expired } = verifyJWT(token);
        if (expired || !payload) {
            res.status(401).json({
                message: "Invalid or expired token",
                error: "INVALID_TOKEN",
            });
            return;
        }
        const decoded = payload;
        let user;
        if (isSuperAdmin(decoded.id)) {
            const dbSuperAdmin = await ensureSuperAdminExists();
            if (dbSuperAdmin) {
                user = {
                    id: dbSuperAdmin.id,
                    email: dbSuperAdmin.email,
                    name: dbSuperAdmin.name,
                    role: dbSuperAdmin.role,
                    accountStatus: "ACTIVE",
                    isActive: true,
                };
            }
            else {
                user = getSuperAdminProfile();
            }
        }
        else {
            user = await prisma.adminUser.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    accountStatus: true,
                    isActive: true,
                    handledCategoryIds: true,
                    handledCategories: { select: { id: true, name: true } },
                },
            });
            if (!user) {
                res.status(401).json({
                    message: "User not found",
                    error: "USER_NOT_FOUND",
                });
                return;
            }
            const accountStatus = user.accountStatus;
            if (accountStatus === "DEACTIVATED") {
                res.status(403).json({
                    message: "Your account has been deactivated. Please contact your administrator for assistance.",
                    error: "ACCOUNT_DEACTIVATED",
                });
                return;
            }
            user.accountStatus = accountStatus;
            // Update lastActiveAt asynchronously without touching accountStatus
            prisma.adminUser
                .update({
                where: { id: user.id },
                data: {
                    lastActiveAt: new Date(),
                },
            })
                .catch((err) => console.error("Error updating user active status:", err));
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        res.status(403).json({
            message: "Invalid or expired token",
            error: "INVALID_TOKEN",
        });
        return;
    }
};
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            message: "Authentication required",
            error: "AUTHENTICATION_REQUIRED",
        });
        return;
    }
    if (req.user.role !== "DEAN" && req.user.role !== "SUPERADMIN") {
        res.status(403).json({
            message: "Dean or Superadmin privileges required",
            error: "INSUFFICIENT_PRIVILEGES",
        });
        return;
    }
    next();
};
export const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                message: "Authentication required",
                error: "AUTHENTICATION_REQUIRED",
            });
            return;
        }
        if (!req.user.role || !roles.includes(req.user.role)) {
            res.status(403).json({
                message: "Insufficient privileges",
                error: "INSUFFICIENT_PRIVILEGES",
            });
            return;
        }
        next();
    };
};
// Optional authentication - user can be authenticated or not
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.cookies?.token;
        if (!token) {
            next();
            return;
        }
        const { payload, expired } = verifyJWT(token);
        if (expired || !payload) {
            next();
            return;
        }
        const decoded = payload;
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Invalid token, but continue without user
        next();
    }
};
