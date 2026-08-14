import { Request, Response, NextFunction } from "express";
import prisma from "../services/prisma";
import { verifyJWT } from "../utils/jwt.utils";
import { AuthenticatedRequest } from "./auth.middleware";

export const authenticateReviewCenterToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.rc_accessToken || req.cookies?.accessToken || req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      res.status(401).json({
        message: "Review Center authentication token is required",
        error: "UNAUTHORIZED",
      });
      return;
    }

    const { payload, expired } = verifyJWT(token);
    if (expired || !payload) {
      res.status(401).json({
        message: "Invalid or expired Review Center token",
        error: "INVALID_TOKEN",
      });
      return;
    }

    const decoded = payload as { id: string };
    const repUser = await prisma.reviewCenterRepresentativeUser.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        reviewCenterId: true,
        isActive: true,
      },
    });

    if (!repUser || !repUser.isActive) {
      res.status(401).json({
        message: "Review Center Representative user not found or inactive",
        error: "USER_NOT_FOUND",
      });
      return;
    }

    req.user = {
      ...repUser,
      role: "REVIEW_CENTER_REPRESENTATIVE",
    };

    next();
  } catch (error) {
    console.error("Review Center auth error:", error);
    res.status(403).json({
      message: "Invalid or expired token",
      error: "INVALID_TOKEN",
    });
  }
};
