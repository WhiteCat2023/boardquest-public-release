import { Router } from "express";
import { login, logout, signup, refreshToken, forgotPassword, resetPassword, updateProfile } from "../controller/auth.controller";
import { me } from "../controller/user.controller";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/signup", authLimiter, signup);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/me", authenticateToken, me);
router.put("/profile", authenticateToken, updateProfile);
router.get("/refresh", refreshToken);

export default router;