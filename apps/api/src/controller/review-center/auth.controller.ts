import { Request, Response } from "express";
import { reviewCenterAuthService } from "../../services/review-center/auth.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { signJWT, verifyJWT } from "../../utils/jwt.utils";
import { logInfo, logWarn } from "../../services/admin/logger.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const reviewCenterLogin = asyncHandler(
  async (req: Request, res: Response) => {
    let user: any;
    const attemptedEmail = req.body?.email || req.body?.employeeId || "unknown";

    try {
      user = await reviewCenterAuthService.login(req.body);
    } catch (err: any) {
      await logWarn(
        "RC_AUTH_LOGIN_FAILED",
        `Failed review center login attempt for "${attemptedEmail}". ${err.message || "Invalid credentials"}.`,
        "ReviewCenterAuthService",
        attemptedEmail,
        req.ip,
        { error: err.message },
      );
      throw err;
    }

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = signJWT(
      {
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
        companyName: user.companyName,
      },
      "1d",
    );

    const refreshToken = signJWT(
      {
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
      },
      "7d",
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
    };

    res.cookie("rc_accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("rc_refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logInfo(
      "RC_USER_LOGIN_SUCCESS",
      `Review Center Representative (${user.email} - ${user.companyName}) logged in successfully.`,
      "ReviewCenterAuthService",
      user.email,
      req.ip,
    );

    return new ApiResponse(
      200,
      { user, accessToken, refreshToken },
      "Review Center Representative logged in successfully",
    ).send(res);
  },
);

export const reviewCenterLogout = asyncHandler(
  async (_req: Request, res: Response) => {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
    };
    res.clearCookie("rc_accessToken", cookieOptions);
    res.clearCookie("rc_refreshToken", cookieOptions);
    return new ApiResponse(200, null, "Logged out successfully").send(res);
  },
);

export const getReviewCenterMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await reviewCenterAuthService.getMe(userId);
    return new ApiResponse(
      200,
      { user },
      "Review Center profile retrieved successfully",
    ).send(res);
  },
);

export const reviewCenterRefreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.rc_refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not found");
    }

    const { payload, expired } = verifyJWT(refreshToken);
    if (expired || !payload) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const decoded = payload as { id: string };
    const user = await reviewCenterAuthService.getMe(decoded.id);
    if (!user) {
      throw new ApiError(404, "User profile not found");
    }

    const newAccessToken = signJWT(
      {
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
        companyName: user.companyName,
      },
      "1d",
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
    };

    res.cookie("rc_accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return new ApiResponse(
      200,
      { user, accessToken: newAccessToken },
      "Access token refreshed successfully",
    ).send(res);
  },
);

export const reviewCenterForgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewCenterAuthService.forgotPassword(req.body);
    return new ApiResponse(
      200,
      result,
      "Password reset request processed successfully",
    ).send(res);
  },
);

export const reviewCenterResetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await reviewCenterAuthService.resetPassword(req.body);
    return new ApiResponse(
      200,
      result,
      "Password has been reset successfully",
    ).send(res);
  },
);

export const reviewCenterVerifyResetToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = (req.query.token as string) || (req.body.token as string);
    const result = await reviewCenterAuthService.verifyResetToken(token);
    return new ApiResponse(
      200,
      result,
      "Reset token is valid",
    ).send(res);
  },
);

export const updateReviewCenterProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Not authenticated");
    }

    const updatedUser = await reviewCenterAuthService.updateProfile(
      userId,
      req.body,
    );

    return new ApiResponse(
      200,
      { user: updatedUser },
      "Profile updated successfully",
    ).send(res);
  },
);

export const reviewCenterAcceptTerms = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await reviewCenterAuthService.acceptTerms(userId);
    return new ApiResponse(
      200,
      { user },
      "Terms & Conditions accepted successfully",
    ).send(res);
  },
);

export const reviewCenterFirstLoginSetup = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Not authenticated");
    }

    const user = await reviewCenterAuthService.firstLoginSetup(userId, req.body);
    return new ApiResponse(
      200,
      { user },
      "First-login password setup completed successfully",
    ).send(res);
  },
);


