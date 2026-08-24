import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getLogsController, getLogStatsController, clearLogsController, } from "../../controller/admin/logs.controller";
const router = Router();
router.get("/get", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), getLogsController);
router.get("/stats", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), getLogStatsController);
router.post("/clear", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), clearLogsController);
export default router;
