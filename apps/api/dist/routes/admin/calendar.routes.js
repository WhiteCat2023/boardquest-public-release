import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getReviewSchedules, createReviewSchedule, updateReviewSchedule, deleteReviewSchedule, } from "../../controller/admin/calendar.controller";
const router = Router();
const allowedRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD"];
// Calendar & Schedule Routes
router.get("/schedules/get", authenticateToken, requireRoles(allowedRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(allowedRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(allowedRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewSchedule);
// Standard RESTful Calendar endpoints
router.get("/", authenticateToken, requireRoles(allowedRoles), getReviewSchedules);
router.post("/", authenticateToken, requireRoles(allowedRoles), createReviewSchedule);
router.put("/:id", authenticateToken, requireRoles(allowedRoles), updateReviewSchedule);
router.delete("/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewSchedule);
export default router;
