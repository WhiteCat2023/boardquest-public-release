import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getLogsController,
  getLogStatsController,
  clearLogsController,
} from "../../controller/admin/logs.controller";

const router = Router();

router.get("/get", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), getLogsController);
router.get("/stats", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), getLogStatsController);
router.post("/clear", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), clearLogsController);

export default router;
