import prisma from "../services/prisma";
import { verifyJWT } from "../utils/jwt.utils";
import { ensureSuperAdminExists, SUPERADMIN_DEFAULT_ID } from "../services/admin/bootstrap.service";
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
        const superAdminId = "superadmin-env-id";
        const envSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || "superadmin@boardquest.edu.ph").toLowerCase();
        let user;
        if (decoded.id === superAdminId || decoded.id === envSuperAdminEmail || decoded.id === SUPERADMIN_DEFAULT_ID) {
            const dbSuperAdmin = await ensureSuperAdminExists();
            if (dbSuperAdmin) {
                user = {
                    id: dbSuperAdmin.id,
                    email: dbSuperAdmin.email,
                    username: dbSuperAdmin.username,
                    name: dbSuperAdmin.name,
                    role: dbSuperAdmin.role,
                    isActive: true,
                };
            }
            else {
                user = {
                    id: SUPERADMIN_DEFAULT_ID,
                    email: envSuperAdminEmail,
                    username: process.env.SUPERADMIN_USERNAME || "superadmin",
                    name: process.env.SUPERADMIN_NAME || "System Super Administrator",
                    role: "SUPERADMIN",
                    isActive: true,
                };
            }
        }
        else {
            user = await prisma.adminUser.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    role: true,
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
            // Update isActive and lastActiveAt asynchronously
            prisma.adminUser
                .update({
                where: { id: user.id },
                data: {
                    isActive: true,
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
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
        res.status(403).json({
            message: "Admin privileges required",
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
