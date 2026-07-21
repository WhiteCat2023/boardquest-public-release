import { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma";
import { verifyJWT } from "../utils/jwt.utils";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
    role?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    const decoded = payload as { id: string };

    // Fetch user details from database
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
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

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    res.status(403).json({
      message: "Admin privileges required",
      error: "INSUFFICIENT_PRIVILEGES",
    });
    return;
  }

  next();
};

export const requireRoles = (roles: string[]) => {
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
        username: true,
        name: true,
        role: true,
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

export type { AuthenticatedRequest };
