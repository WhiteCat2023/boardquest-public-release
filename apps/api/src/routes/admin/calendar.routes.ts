import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getReviewSchedules,
  createReviewSchedule,
  updateReviewSchedule,
  deleteReviewSchedule,
} from "../../controller/admin/calendar.controller";

const router = Router();
const manageRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];
const viewRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];

// Calendar & Schedule Routes
router.get("/schedules/get", authenticateToken, requireRoles(viewRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(manageRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(manageRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(manageRoles), deleteReviewSchedule);

// Standard RESTful Calendar endpoints
router.get("/", authenticateToken, requireRoles(viewRoles), getReviewSchedules);
router.post("/", authenticateToken, requireRoles(manageRoles), createReviewSchedule);
router.put("/:id", authenticateToken, requireRoles(manageRoles), updateReviewSchedule);
router.delete("/:id", authenticateToken, requireRoles(manageRoles), deleteReviewSchedule);

export default router;
