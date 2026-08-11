import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getStudentAnalyticsReport, getDashboardAnalyticsSummary } from "../../controller/admin/analytics.controller";

const router = Router();

router.get("/dashboard-summary", authenticateToken, getDashboardAnalyticsSummary);
router.get("/student/:studentId", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), getStudentAnalyticsReport);

export default router;
