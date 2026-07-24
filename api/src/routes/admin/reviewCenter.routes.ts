import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getReviewCenters,
  getReviewCenterById,
  createReviewCenter,
  updateReviewCenter,
  deleteReviewCenter,
  getReviewSchedules,
  createReviewSchedule,
  updateReviewSchedule,
  deleteReviewSchedule,
} from "../../controller/admin/reviewCenter.controller";

const router = Router();

const allowedRoles = ["SUPERADMIN", "ADMIN", "TEAMLEAD"];

// Review Center Representative Directory Routes
router.get("/", authenticateToken, requireRoles(allowedRoles), getReviewCenters);
router.get("/representatives/:id", authenticateToken, requireRoles(allowedRoles), getReviewCenterById);
router.post("/", authenticateToken, requireRoles(allowedRoles), createReviewCenter);
router.put("/:id", authenticateToken, requireRoles(allowedRoles), updateReviewCenter);
router.delete("/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewCenter);

// Review Calendar & Schedule Routes
router.get("/schedules/get", authenticateToken, requireRoles(allowedRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(allowedRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(allowedRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewSchedule);

export default router;
