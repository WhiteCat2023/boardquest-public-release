import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getLogsController,
  getLogStatsController,
  clearLogsController,
} from "../../controller/admin/logs.controller";

const router = Router();

router.get("/get", authenticateToken, getLogsController);
router.get("/stats", authenticateToken, getLogStatsController);
router.post("/clear", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), clearLogsController);

export default router;
