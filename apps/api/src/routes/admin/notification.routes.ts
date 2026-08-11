import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
  getNotificationsHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  clearAllNotificationsHandler,
  createNotificationHandler,
} from "../../controller/admin/notification.controller";

const router = Router();

router.use(authenticateToken);

router.get("/get", getNotificationsHandler);
router.patch("/:id/read", markAsReadHandler);
router.patch("/read-all", markAllAsReadHandler);
router.delete("/:id", deleteNotificationHandler);
router.delete("/clear-all", clearAllNotificationsHandler);
router.post("/create", createNotificationHandler);

export default router;
