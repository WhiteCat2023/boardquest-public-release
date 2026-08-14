import { Router } from "express";
import authRoutes from "./auth.routes.js";
import departmentRoutes from "./admin/department.routes.js";
import questionRoutes from "./admin/question.routes.js";
import studentRoutes from "./admin/student.routes.js";
import facultyRoutes from "./admin/faculty.routes.js";
import analyticsRoutes from "./admin/analytics.routes.js";
import reviewCenterRoutes from "./admin/reviewCenter.routes.js";
import reviewCenterAuthRoutes from "./review-center/auth.routes.js";
import calendarRoutes from "./admin/calendar.routes.js";
import logsRoutes from "./admin/logs.routes.js";
import guidanceRoutes from "./admin/guidance.routes.js";
import notificationRoutes from "./admin/notification.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/questions", questionRoutes);
router.use("/students", studentRoutes);
router.use("/faculty", facultyRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/review-center", reviewCenterRoutes);
router.use("/review-center-app/auth", reviewCenterAuthRoutes);
router.use("/calendar", calendarRoutes);
router.use("/logs", logsRoutes);
router.use("/guidance", guidanceRoutes);
router.use("/notifications", notificationRoutes);

export default router;
