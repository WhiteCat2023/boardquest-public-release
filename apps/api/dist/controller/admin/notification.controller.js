import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications, createNotification, } from "../../services/admin/notification.service";
import sseService from "../../services/admin/sse.service";
export async function getNotificationsHandler(req, res) {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const unreadOnly = req.query.unreadOnly === "true";
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const notifications = await getUserNotifications({ userId, role, unreadOnly, limit });
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
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
