import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getReviewSchedules, createReviewSchedule, updateReviewSchedule, deleteReviewSchedule, getCalendarEvents, getCalendarEventById, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, } from "../../controller/admin/calendar.controller";
const router = Router();
const manageRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];
const viewRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];
// ==========================================
// Calendar Events (MongoDB Database)
// ==========================================
router.get("/events", authenticateToken, requireRoles(viewRoles), getCalendarEvents);
router.post("/events", authenticateToken, requireRoles(manageRoles), createCalendarEvent);
router.get("/events/:id", authenticateToken, requireRoles(viewRoles), getCalendarEventById);
router.put("/events/:id", authenticateToken, requireRoles(manageRoles), updateCalendarEvent);
router.delete("/events/:id", authenticateToken, requireRoles(manageRoles), deleteCalendarEvent);
// ==========================================
// Review Schedules (ReviewCenterProgram)
// ==========================================
router.get("/schedules/get", authenticateToken, requireRoles(viewRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(manageRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(manageRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(manageRoles), deleteReviewSchedule);
// Standard RESTful Calendar endpoints
router.get("/", authenticateToken, requireRoles(viewRoles), getCalendarEvents);
router.post("/", authenticateToken, requireRoles(manageRoles), createCalendarEvent);
router.get("/:id", authenticateToken, requireRoles(viewRoles), getCalendarEventById);
router.put("/:id", authenticateToken, requireRoles(manageRoles), updateCalendarEvent);
router.delete("/:id", authenticateToken, requireRoles(manageRoles), deleteCalendarEvent);
export default router;
