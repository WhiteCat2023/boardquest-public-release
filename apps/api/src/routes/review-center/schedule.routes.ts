import { Router } from "express";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";
import {
  getMyReviewSchedules,
  createMyReviewSchedule,
  updateMyReviewSchedule,
  deleteMyReviewSchedule,
} from "../../controller/review-center/schedule.controller";

const router = Router();

// Schedule Endpoints for Review Center Representative
router.get("/schedules/get", authenticateReviewCenterToken, getMyReviewSchedules);
router.post("/schedules/create", authenticateReviewCenterToken, createMyReviewSchedule);
router.put("/schedules/update/:id", authenticateReviewCenterToken, updateMyReviewSchedule);
router.delete("/schedules/delete/:id", authenticateReviewCenterToken, deleteMyReviewSchedule);

// Standard REST endpoints
router.get("/", authenticateReviewCenterToken, getMyReviewSchedules);
router.post("/", authenticateReviewCenterToken, createMyReviewSchedule);
router.put("/:id", authenticateReviewCenterToken, updateMyReviewSchedule);
router.delete("/:id", authenticateReviewCenterToken, deleteMyReviewSchedule);

export default router;
