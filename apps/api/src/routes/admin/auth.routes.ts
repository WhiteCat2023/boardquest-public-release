import { Router } from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updateProfile,
  firstLoginSetup,
  acceptTerms,
} from "../../controller/admin/auth.controller";
import { me } from "../../controller/admin/user.controller";
import {
  authLimiter,
  passwordResetLimiter,
} from "../../middleware/rateLimit.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/signup", authLimiter, signup);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.get("/verify-reset-token", passwordResetLimiter, verifyResetToken);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/first-login-setup", authenticateToken, firstLoginSetup);
router.post("/accept-terms", authenticateToken, acceptTerms);
router.get("/me", authenticateToken, me);
router.put("/profile", authenticateToken, updateProfile);
router.get("/refresh", refreshToken);

export default router;
