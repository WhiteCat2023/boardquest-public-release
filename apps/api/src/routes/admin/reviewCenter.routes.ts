import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getReviewCenters,
  getReviewCenterById,
  createReviewCenter,
  updateReviewCenter,
  deleteReviewCenter,
} from "../../controller/admin/reviewCenter.controller";
import {
  getReviewSchedules,
  createReviewSchedule,
  updateReviewSchedule,
  deleteReviewSchedule,
} from "../../controller/admin/calendar.controller";

const router = Router();
const allowedRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD"];

// Review Center Representative Directory Routes
router.get("/", authenticateToken, requireRoles(allowedRoles), getReviewCenters);
router.get("/representatives/:id", authenticateToken, requireRoles(allowedRoles), getReviewCenterById);
router.post("/", authenticateToken, requireRoles(allowedRoles), createReviewCenter);
router.put("/:id", authenticateToken, requireRoles(allowedRoles), updateReviewCenter);
router.delete("/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewCenter);

// Review Calendar & Schedule Routes (Delegated to Calendar Controller for compatibility)
router.get("/schedules/get", authenticateToken, requireRoles(allowedRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(allowedRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(allowedRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewSchedule);

// Generic ID lookup fallback
router.get("/:id", authenticateToken, requireRoles(allowedRoles), getReviewCenterById);

export default router;
