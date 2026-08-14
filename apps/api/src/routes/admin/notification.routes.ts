import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  clearAllNotificationsHandler,
  createNotificationHandler,
  streamNotificationsHandler,
} from "../../controller/admin/notification.controller";

const router = Router();

router.use(authenticateToken);

router.get("/get", getNotificationsHandler);
router.get("/stream", streamNotificationsHandler);
router.patch("/:id/read", markAsReadHandler);
router.patch("/read-all", markAllAsReadHandler);
router.delete("/:id", deleteNotificationHandler);
router.delete("/clear-all", clearAllNotificationsHandler);
router.post("/create", requireRoles(["ADMIN", "SUPERADMIN", "TEAMLEAD"]), createNotificationHandler);

export default router;
