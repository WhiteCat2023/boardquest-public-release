import { Router } from "express";
import {
  reviewCenterLogin,
  reviewCenterLogout,
  getReviewCenterMe,
} from "../../controller/review-center/auth.controller";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";

const router = Router();

//Review Center Routes
router.post("/login", authLimiter, reviewCenterLogin);
router.post("/logout", reviewCenterLogout);
router.get("/me", authenticateReviewCenterToken, getReviewCenterMe);

export default router;
