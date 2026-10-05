import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications, createNotification, } from "../../services/admin/notification.service";
import sseService from "../../services/admin/sse.service";
export async function getNotificationsHandler(req, res) {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const unreadOnly = req.query.unreadOnly === "true";
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const search = req.query.search ? String(req.query.search) : undefined;
        const type = req.query.type ? String(req.query.type) : undefined;
        const result = await getUserNotifications({ userId, role, unreadOnly, limit, skip, search, type });
        let notifications;
        let unreadCount;
        let hasMore;
        if (Array.isArray(result)) {
            notifications = result;
            unreadCount = notifications.filter((n) => !n.isRead).length;
            hasMore = false;
        }
        else {
            notifications = result?.notifications || [];
            unreadCount =
                typeof result?.unreadCount === "number"
                    ? result.unreadCount
                    : notifications.filter((n) => !n.isRead).length;
            hasMore = Boolean(result?.hasMore);
        }
        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
                hasMore,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications.",
        });
    }
}
export async function markAsReadHandler(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!id) {
            return res.status(400).json({ success: false, message: "Notification ID is required." });
        }
        const result = await markNotificationAsRead(id, userId, role);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to mark notification as read.",
        });
    }
}
export async function markAllAsReadHandler(req, res) {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const result = await markAllNotificationsAsRead({ userId, role });
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to mark all notifications as read.",
        });
    }
}
export async function deleteNotificationHandler(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!id) {
            return res.status(400).json({ success: false, message: "Notification ID is required." });
        }
        const result = await deleteNotification(id, userId, role);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete notification.",
        });
    }
}
export async function clearAllNotificationsHandler(req, res) {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const result = await clearAllNotifications({ userId, role });
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to clear notifications.",
        });
    }
}
export async function createNotificationHandler(req, res) {
    try {
        const { recipientId, recipientRole, title, message, type, link, metadata } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required." });
        }
        const result = await createNotification({
            recipientId,
            recipientRole: recipientRole || "ALL",
            title,
            message,
            type,
            link,
            metadata,
        });
        return res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create notification.",
        });
    }
}
export function streamNotificationsHandler(req, res) {
    const userId = req.user?.id;
    const role = req.user?.role;
    sseService.addClient(userId, role, res);
}
export async function sendDigestHandler(req, res) {
    try {
        const { dispatchWeeklyDigest } = await import("../../services/queue.service");
        const targetUserId = req.body?.forSelfOnly ? req.user?.id : req.body?.userId;
        const result = await dispatchWeeklyDigest(targetUserId);
        return res.status(200).json({
            success: true,
            message: "Weekly performance digest dispatched successfully.",
            data: result,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to dispatch weekly performance digest.",
        });
    }
}
