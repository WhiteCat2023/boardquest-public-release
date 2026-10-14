import { Router } from "express";
import authRoutes from "../admin/auth.routes.js";
import questionRoutes from "../admin/question.routes.js";
import studentRoutes from "../admin/student.routes.js";
import facultyRoutes from "../admin/user.routes.js";
import analyticsRoutes from "../admin/analytics.routes.js";
import reviewCenterRoutes from "../review-center/reviewCenter.routes.js";
import calendarRoutes from "../admin/calendar.routes.js";
import logsRoutes from "../admin/logs.routes.js";
import guidanceRoutes from "../admin/guidance.routes.js";
import notificationRoutes from "../admin/notification.routes.js";
import uploadRoutes from "../admin/upload.routes.js";
import gameRoutes from "../admin/game_module/game.routes.js";
import rcAuthRoutes from "../review-center/auth.routes.js";
import rcScheduleRoutes from "../review-center/schedule.routes.js";
import rcCandidateRoutes from "../review-center/candidate.routes.js";
import rcAssessmentRoutes from "../review-center/assessment.routes.js";
import rcNotificationRoutes from "../review-center/rcNotification.routes.js";

const v1Router = Router();

// ── Admin Routes (v1) ──
v1Router.use("/auth", authRoutes);
v1Router.use("/questions", questionRoutes);
v1Router.use("/students", studentRoutes);
v1Router.use("/faculty", facultyRoutes);
v1Router.use("/users", facultyRoutes);
v1Router.use("/analytics", analyticsRoutes);
v1Router.use("/review-center", reviewCenterRoutes);
v1Router.use("/calendar", calendarRoutes);
v1Router.use("/logs", logsRoutes);
v1Router.use("/guidance", guidanceRoutes);
v1Router.use("/notifications", notificationRoutes);
v1Router.use("/upload", uploadRoutes);
v1Router.use("/game", gameRoutes);

// ── Review Center Routes (v1) ──
v1Router.use("/review-center-app/auth", rcAuthRoutes);
v1Router.use("/auth/review-center", rcAuthRoutes);
v1Router.use("/review-center/auth", rcAuthRoutes);
v1Router.use("/review-center-app/schedules", rcScheduleRoutes);
v1Router.use("/review-center-app/calendar", rcScheduleRoutes);
v1Router.use("/review-center/schedules", rcScheduleRoutes);
v1Router.use("/review-center-app/candidates", rcCandidateRoutes);
v1Router.use("/review-center-app/students", rcCandidateRoutes);
v1Router.use("/review-center/candidates", rcCandidateRoutes);
v1Router.use("/review-center-app/assessments", rcAssessmentRoutes);
v1Router.use("/review-center-app/scores", rcAssessmentRoutes);
v1Router.use("/review-center/assessments", rcAssessmentRoutes);
v1Router.use("/review-center/scores", rcAssessmentRoutes);
v1Router.use("/review-center-app/notifications", rcNotificationRoutes);
v1Router.use("/review-center/notifications", rcNotificationRoutes);

export default v1Router;
