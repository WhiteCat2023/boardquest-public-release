import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getStudentAnalyticsReport,
  getStudentTopicMasteryReport,
  getDashboardAnalyticsSummary,
} from "../../controller/admin/analytics.controller";

const router = Router();

router.get("/dashboard-summary", authenticateToken, getDashboardAnalyticsSummary);
router.get(
  "/student/:studentId/topic-mastery",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"]),
  getStudentTopicMasteryReport,
);
router.get(
  "/student/:studentId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"]),
  getStudentAnalyticsReport,
);

export default router;
