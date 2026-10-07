import { Router } from "express";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware.js";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
  clearAllNotificationsHandler,
  sseStreamHandler,
} from "../../controller/review-center/rcNotification.controller.js";

const router = Router();

// Live SSE Stream
router.get("/stream", authenticateReviewCenterToken, sseStreamHandler);

// Notification Data & Counts
router.get("/get", authenticateReviewCenterToken, getNotificationsHandler);
router.get("/", authenticateReviewCenterToken, getNotificationsHandler);
router.get("/unread-count", authenticateReviewCenterToken, getUnreadCountHandler);

// Read Status Actions
router.patch("/read/:id", authenticateReviewCenterToken, markAsReadHandler);
router.patch("/:id/read", authenticateReviewCenterToken, markAsReadHandler);
router.patch("/read-all", authenticateReviewCenterToken, markAllAsReadHandler);

// Delete / Clear Actions
router.delete("/delete/:id", authenticateReviewCenterToken, deleteNotificationHandler);
router.delete("/:id", authenticateReviewCenterToken, deleteNotificationHandler);
router.delete("/clear-all", authenticateReviewCenterToken, clearAllNotificationsHandler);

export default router;
