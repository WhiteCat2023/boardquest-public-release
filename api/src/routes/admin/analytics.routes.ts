import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getStudentAnalyticsReport } from "../../controller/admin/analytics.controller";

const router = Router();

// Only SUPERADMIN, ADMIN, and TEAMLEAD can access student analytics reports
router.get("/student/:studentId", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), getStudentAnalyticsReport);

export default router;
