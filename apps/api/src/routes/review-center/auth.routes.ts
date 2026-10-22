import { Router } from "express";
import {
  reviewCenterLogin,
  reviewCenterLogout,
  getReviewCenterMe,
  reviewCenterRefreshToken,
  reviewCenterForgotPassword,
  reviewCenterResetPassword,
  reviewCenterVerifyResetToken,
  updateReviewCenterProfile,
  reviewCenterAcceptTerms,
  reviewCenterFirstLoginSetup,
} from "../../controller/review-center/auth.controller";
import {
  authLimiter,
  passwordResetLimiter,
} from "../../middleware/rateLimit.middleware";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";

const router = Router();

// Review Center Auth Routes
router.post("/login", authLimiter, reviewCenterLogin);
router.post("/logout", reviewCenterLogout);
router.post("/forgot-password", passwordResetLimiter, reviewCenterForgotPassword);
router.get("/verify-reset-token", passwordResetLimiter, reviewCenterVerifyResetToken);
router.post("/reset-password", passwordResetLimiter, reviewCenterResetPassword);
router.get("/refresh", reviewCenterRefreshToken);
router.get("/me", authenticateReviewCenterToken, getReviewCenterMe);
router.put("/profile", authenticateReviewCenterToken, updateReviewCenterProfile);
router.post("/accept-terms", authenticateReviewCenterToken, reviewCenterAcceptTerms);
router.post("/first-login-setup", authenticateReviewCenterToken, reviewCenterFirstLoginSetup);

export default router;
