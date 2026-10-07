import { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma";
import { verifyJWT } from "../utils/jwt.utils";
import { ensureSuperAdminExists } from "../services/admin/bootstrap.service";
import { isSuperAdmin, getSuperAdminProfile } from "../config/credentials";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
    accountStatus?: string;
    isActive?: boolean;
    handledCategoryIds?: string[];
    handledCategories?: Array<{ id: string; name: string }>;
    reviewCenterId?: string | null;
    companyName?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Explicit Authorization header takes highest priority
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    // 2. Cookie fallback: route-aware token selection
    if (!token) {
      const isReviewCenterRoute =
        req.baseUrl?.includes("review-center-app") ||
        req.originalUrl?.includes("/review-center-app") ||
        req.baseUrl?.includes("review-center") ||
        req.originalUrl?.includes("/review-center/");

      if (isReviewCenterRoute) {
        token =
          req.cookies?.rc_accessToken ||
          req.cookies?.accessToken ||
          req.cookies?.token;
      } else {
        // Admin routes MUST prioritize accessToken over rc_accessToken
        token =
          req.cookies?.accessToken ||
          req.cookies?.token ||
          req.cookies?.rc_accessToken;
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

    const decoded = payload as { id: string };

    let user: any;
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
      } else {
        user = getSuperAdminProfile();
      }
    } else {
      user = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accountStatus: true,
          isActive: true,
          handledSubjectIds: true,
          handledSubjects: { select: { id: true, name: true } },
        },
      });

      if (!user) {
        const repUser = await prisma.reviewCenterRepresentativeUser.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
            reviewCenterId: true,
            accountStatus: true,
            isActive: true,
          },
        });

        if (repUser) {
          user = {
            id: repUser.id,
            email: repUser.email,
            name: repUser.name,
            role: "REVIEW_CENTER_REPRESENTATIVE",
            accountStatus: repUser.accountStatus,
            isActive: repUser.isActive,
            reviewCenterId: repUser.reviewCenterId,
            companyName: repUser.companyName,
            handledCategoryIds: [],
            handledCategories: [],
          };

          if (repUser.accountStatus === "DEACTIVATED") {
            res.status(403).json({
              message:
                "Your account has been deactivated. Please contact your administrator for assistance.",
              error: "ACCOUNT_DEACTIVATED",
            });
            return;
          }

          prisma.reviewCenterRepresentativeUser
            .update({
              where: { id: repUser.id },
              data: {
                lastActiveAt: new Date(),
              },
            })
            .catch((err: any) =>
              console.error("Error updating review center user active status:", err),
            );
        }
      }

      if (!user) {
        res.status(401).json({
          message: "User not found",
          error: "USER_NOT_FOUND",
        });
        return;
      }

      // Map handledSubjects and handledSubjectIds for backward compatibility
      user.handledCategoryIds = user.handledSubjectIds || [];
      user.handledCategories = user.handledSubjects || [];

      const accountStatus = user.accountStatus!;
      if (accountStatus === "DEACTIVATED") {
        res.status(403).json({
          message:
            "Your account has been deactivated. Please contact your administrator for assistance.",
          error: "ACCOUNT_DEACTIVATED",
        });
        return;
      }

      user.accountStatus = accountStatus;

      // Update lastActiveAt asynchronously without touching accountStatus if adminUser
      if (user.role !== "REVIEW_CENTER_REPRESENTATIVE") {
        prisma.adminUser
          .update({
            where: { id: user.id },
            data: {
              lastActiveAt: new Date(),
            },
          })
          .catch((err: any) =>
            console.error("Error updating user active status:", err),
          );
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({
      message: "Invalid or expired token",
      error: "INVALID_TOKEN",
    });
    return;
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
      error: "AUTHENTICATION_REQUIRED",
    });
    return;
  }

  const userRole = String(req.user.role || "").toUpperCase();
  if (
    userRole !== "DEAN" &&
    userRole !== "SUPERADMIN"
  ) {
    res.status(403).json({
      message: "Dean or Superadmin privileges required",
      error: "INSUFFICIENT_PRIVILEGES",
    });
    return;
  }

  next();
};

export const normalizeRole = (role?: any): string => {
  if (!role) return "";
  const s = String(role).toUpperCase().trim();
  if (s === "SUPERADMIN") return "SUPERADMIN";
  if (s === "DEAN") return "DEAN";
  if (s === "TEAMLEAD") return "TEAMLEAD";
  if (s === "TEACHER") return "TEACHER";
  if (s === "REVIEWCENTER" || s === "EXTERNAL")
    return "REVIEWCENTER";
  return s;
};

export const requireRoles = (roles: (string | number)[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
        error: "AUTHENTICATION_REQUIRED",
      });
      return;
    }

    const userRole = req.user.role;
    const isAllowed =
      userRole &&
      roles.some((r) => {
        if (r === userRole || String(r) === String(userRole)) return true;
        return normalizeRole(r) === normalizeRole(userRole);
      });

    if (!isAllowed) {
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
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    const decoded = payload as { id: string };

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
  } catch (error) {
    // Invalid token, but continue without user
    next();
  }
};
