import { Request, Response } from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} from "../../services/admin/notification.service";
import sseService from "../../services/admin/sse.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

export async function getNotificationsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const unreadOnly = req.query.unreadOnly === "true";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
    const search = req.query.search ? String(req.query.search) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;

    const result = await getUserNotifications({ userId, role, unreadOnly, limit, skip, search, type });

    let notifications: any[];
    let unreadCount: number;
    let hasMore: boolean;

    if (Array.isArray(result)) {
      notifications = result;
      unreadCount = notifications.filter((n: any) => !n.isRead).length;
      hasMore = false;
    } else {
      notifications = result?.notifications || [];
      unreadCount =
        typeof result?.unreadCount === "number"
          ? result.unreadCount
          : notifications.filter((n: any) => !n.isRead).length;
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications.",
    });
  }
}

export async function markAsReadHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification as read.",
    });
  }
}

export async function markAllAsReadHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await markAllNotificationsAsRead({ userId, role });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all notifications as read.",
    });
  }
}

export async function deleteNotificationHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification.",
    });
  }
}

export async function clearAllNotificationsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await clearAllNotifications({ userId, role });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear notifications.",
    });
  }
}

export async function createNotificationHandler(req: AuthenticatedRequest, res: Response) {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create notification.",
    });
  }
}

export function streamNotificationsHandler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user?.id;
  const role = req.user?.role;
  sseService.addClient(userId, role, res);
}
