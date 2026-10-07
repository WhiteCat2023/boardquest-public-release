import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import rcNotificationService from "../../services/review-center/rcNotification.service.js";
import rcSseService from "../../services/review-center/rcSse.service.js";
import prisma from "../../services/prisma.js";

/**
 * Helper to reliably resolve reviewCenterId from authenticated user
 */
async function resolveReviewCenterId(req: AuthenticatedRequest): Promise<string> {
  const user = req.user as any;
  if (user?.reviewCenterId) {
    return String(user.reviewCenterId);
  }

  // Fallback: look up by companyName or userId
  if (user?.id) {
    const rep = await prisma.reviewCenterRepresentativeUser.findUnique({
      where: { id: user.id },
      select: { reviewCenterId: true, companyName: true },
    });
    if (rep?.reviewCenterId) {
      return String(rep.reviewCenterId);
    }
    if (rep?.companyName) {
      const center = await prisma.reviewCenter.findFirst({
        where: { name: { equals: rep.companyName, mode: "insensitive" } },
        select: { id: true },
      });
      if (center?.id) {
        return String(center.id);
      }
    }
  }

  if (user?.companyName) {
    const center = await prisma.reviewCenter.findFirst({
      where: { name: { equals: user.companyName, mode: "insensitive" } },
      select: { id: true },
    });
    if (center?.id) {
      return String(center.id);
    }
  }

  // Last resort fallback: if no formal review center linked, use representative ID as scope
  return String(user?.id || "default-rc");
}

export const getNotificationsHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);

    const unreadOnly = req.query.unreadOnly === "true";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
    const search = req.query.search ? String(req.query.search) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;

    const result = await rcNotificationService.getRCNotifications({
      reviewCenterId,
      userId,
      unreadOnly,
      limit,
      skip,
      search,
      type,
    });

    return new ApiResponse(200, result, "Review center notifications retrieved successfully").send(res);
  }
);

export const getUnreadCountHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);

    const count = await rcNotificationService.getRCUnreadCount(reviewCenterId, userId);
    return new ApiResponse(200, { unreadCount: count }, "Unread count retrieved successfully").send(res);
  }
);

export const markAsReadHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);
    const id = String(req.params.id || "");

    if (!id) {
      throw new ApiError(400, "Notification ID is required");
    }

    const success = await rcNotificationService.markRCNotificationAsRead(id, reviewCenterId, userId);
    return new ApiResponse(200, { success }, "Notification marked as read").send(res);
  }
);

export const markAllAsReadHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);

    const success = await rcNotificationService.markAllRCNotificationsAsRead(reviewCenterId, userId);
    return new ApiResponse(200, { success }, "All review center notifications marked as read").send(res);
  }
);

export const deleteNotificationHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);
    const id = String(req.params.id || "");

    if (!id) {
      throw new ApiError(400, "Notification ID is required");
    }

    const success = await rcNotificationService.deleteRCNotification(id, reviewCenterId, userId);
    return new ApiResponse(200, { success }, "Notification dismissed").send(res);
  }
);

export const clearAllNotificationsHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const reviewCenterId = await resolveReviewCenterId(req);

    const success = await rcNotificationService.clearAllRCNotifications(reviewCenterId, userId);
    return new ApiResponse(200, { success }, "All review center notifications cleared").send(res);
  }
);

/**
 * Dedicated SSE Stream for live review center notifications
 */
export const sseStreamHandler = async (req: AuthenticatedRequest, res: Response) => {
  const reviewCenterId = await resolveReviewCenterId(req);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.flushHeaders?.();

  // Send initial ping to confirm stream connection
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", reviewCenterId })}\n\n`);

  // Register client
  rcSseService.addClient(reviewCenterId, res);

  // Keep-alive heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    rcSseService.removeClient(reviewCenterId, res);
  });
};
