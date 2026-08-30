import { reviewCenterAuthService } from "../../services/review-center/auth.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { signJWT, verifyJWT } from "../../utils/jwt.utils";
import { logInfo, logWarn } from "../../services/admin/logger.service";
export const reviewCenterLogin = asyncHandler(async (req, res) => {
    let user;
    const attemptedEmail = req.body?.email || req.body?.employeeId || "unknown";
    try {
        user = await reviewCenterAuthService.login(req.body);
    }
    catch (err) {
        await logWarn("RC_AUTH_LOGIN_FAILED", `Failed review center login attempt for "${attemptedEmail}". ${err.message || "Invalid credentials"}.`, "ReviewCenterAuthService", attemptedEmail, req.ip, { error: err.message });
        throw err;
    }
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }
    const accessToken = signJWT({
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
        companyName: user.companyName,
    }, "1d");
    const refreshToken = signJWT({
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
    }, "7d");
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
    res.cookie("rc_accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("rc_refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await logInfo("RC_USER_LOGIN_SUCCESS", `Review Center Representative (${user.email} - ${user.companyName}) logged in successfully.`, "ReviewCenterAuthService", user.email, req.ip);
    return new ApiResponse(200, { user, accessToken, refreshToken }, "Review Center Representative logged in successfully").send(res);
});
export const reviewCenterLogout = asyncHandler(async (_req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
    res.clearCookie("rc_accessToken", cookieOptions);
    res.clearCookie("rc_refreshToken", cookieOptions);
    return new ApiResponse(200, null, "Logged out successfully").send(res);
});
export const getReviewCenterMe = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Not authenticated");
    }
    const user = await reviewCenterAuthService.getMe(userId);
    return new ApiResponse(200, { user }, "Review Center profile retrieved successfully").send(res);
});
export const reviewCenterRefreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.rc_refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }
    const { payload, expired } = verifyJWT(refreshToken);
    if (expired || !payload) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
    const decoded = payload;
    const user = await reviewCenterAuthService.getMe(decoded.id);
    if (!user) {
        throw new ApiError(404, "User profile not found");
    }
    const newAccessToken = signJWT({
        id: user.id,
        email: user.email,
        role: "REVIEW_CENTER_REPRESENTATIVE",
        reviewCenterId: user.reviewCenterId,
        companyName: user.companyName,
    }, "1d");
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
    res.cookie("rc_accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });
    return new ApiResponse(200, { user, accessToken: newAccessToken }, "Access token refreshed successfully").send(res);
});
