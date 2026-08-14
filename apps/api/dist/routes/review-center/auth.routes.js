import { Router } from "express";
import { reviewCenterLogin, reviewCenterLogout, getReviewCenterMe, } from "../../controller/review-center/reviewCenterAuth.controller";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";
const router = Router();
// Dedicated Review Center Representative Authentication Endpoints
router.post("/login", authLimiter, reviewCenterLogin);
router.post("/logout", reviewCenterLogout);
router.get("/me", authenticateReviewCenterToken, getReviewCenterMe);
export default router;
