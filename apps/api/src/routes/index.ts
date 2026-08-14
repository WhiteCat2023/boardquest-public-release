import { Router } from "express";
import authRoutes from "./auth.routes";
import departmentRoutes from "./admin/department.routes";
import questionRoutes from "./admin/question.routes";
import studentRoutes from "./admin/student.routes";
import facultyRoutes from "./admin/faculty.routes";
import analyticsRoutes from "./admin/analytics.routes";
import reviewCenterRoutes from "./admin/reviewCenter.routes";
import reviewCenterAuthRoutes from "./review-center/auth.routes";
import calendarRoutes from "./admin/calendar.routes";
import logsRoutes from "./admin/logs.routes";
import guidanceRoutes from "./admin/guidance.routes";
import notificationRoutes from "./admin/notification.routes";

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
