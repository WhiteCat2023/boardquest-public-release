import prisma from "../prisma.js";
import rcSseService from "./rcSse.service.js";
import pusherService from "../admin/pusher.service.js";

export type RCNotificationType =
  | "CANDIDATE"
  | "SCHEDULE"
  | "ASSESSMENT"
  | "SYSTEM"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export interface CreateRCNotificationInput {
  reviewCenterId: string;
  recipientId?: string;
  title: string;
  message: string;
  type?: RCNotificationType;
  link?: string;
  metadata?: any;
}

export interface GetRCNotificationsInput {
  reviewCenterId: string;
  userId?: string;
  unreadOnly?: boolean;
  limit?: number;
  skip?: number;
  search?: string;
  type?: string;
}

export interface RCNotificationItem {
  id: string;
  reviewCenterId: string;
  recipientId?: string | null;
  title: string;
  message: string;
  type: RCNotificationType;
  link?: string | null;
  isRead: boolean;
  readUserIds: string[];
  deletedUserIds: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = "ReviewCenterNotification";

class ReviewCenterNotificationService {
  private db = prisma;

  /**
   * Create a new notification strictly for a Review Center
   */
  async createRCNotification(input: CreateRCNotificationInput): Promise<RCNotificationItem> {
    const {
      reviewCenterId,
      recipientId,
      title,
      message,
      type = "INFO",
      link,
      metadata,
    } = input;

    if (!reviewCenterId) {
      throw new Error("reviewCenterId is required to create a Review Center notification");
    }

    const now = new Date();
    const metadataStr = metadata
      ? typeof metadata === "string"
        ? metadata
        : JSON.stringify(metadata)
      : null;

    const docToInsert = {
      reviewCenterId,
      recipientId: recipientId || null,
      title: title.trim(),
      message: message.trim(),
      type,
      link: link || null,
      isRead: false,
      readUserIds: [],
      deletedUserIds: [],
      metadata: metadataStr,
      createdAt: now,
      updatedAt: now,
    };

    const insertResult: any = await this.db.$runCommandRaw({
      insert: COLLECTION_NAME,
      documents: [docToInsert],
    });

    // Query back the created document
    const queryResult: any = await this.db.$runCommandRaw({
      find: COLLECTION_NAME,
      filter: {
        reviewCenterId,
        title: docToInsert.title,
        createdAt: now,
      },
      limit: 1,
    });

    const doc = queryResult?.cursor?.firstBatch?.[0] || {
      ...docToInsert,
      _id: { $oid: "rc-notif-" + Date.now() },
    };

    const formatted: RCNotificationItem = this.formatDoc(doc, recipientId);

    // 1. Broadcast to Review Center SSE clients (strictly partitioned by reviewCenterId)
    try {
      rcSseService.broadcastToReviewCenter(reviewCenterId, formatted);
    } catch (err) {
      console.warn("RC SSE broadcast error:", err);
    }

    // 2. Pusher broadcast
    try {
      pusherService.broadcastNotification({
        ...formatted,
        createdAt: new Date(formatted.createdAt),
      } as any);
    } catch (err) {
      console.warn("RC Pusher broadcast error:", err);
    }

    return formatted;
  }

  /**
   * Get notifications scoped strictly to the given reviewCenterId
   */
  async getRCNotifications(input: GetRCNotificationsInput): Promise<{
    notifications: RCNotificationItem[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
  }> {
    const {
      reviewCenterId,
      userId,
      unreadOnly = false,
      limit = 15,
      skip = 0,
      search,
      type,
    } = input;

    if (!reviewCenterId) {
      return { notifications: [], unreadCount: 0, total: 0, hasMore: false };
    }

    // Build MongoDB filter
    const filter: any = {
      reviewCenterId,
    };

    // Exclude deleted for this user
    if (userId) {
      filter.deletedUserIds = { $nin: [userId] };
    }

    // Filter by type
    if (type && type !== "ALL") {
      filter.type = type.toUpperCase();
    }

    // Search query in title or message
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Fetch batch
    const fetchLimit = limit + 1;
    let docs: any[] = [];
    try {
      const rawRes: any = await this.db.$runCommandRaw({
        find: COLLECTION_NAME,
        filter,
        sort: { createdAt: -1 },
        skip: Math.max(0, skip),
        limit: fetchLimit,
      });
      docs = rawRes?.cursor?.firstBatch || [];
    } catch (err) {
      console.error("Error querying ReviewCenterNotification:", err);
      docs = [];
    }

    const hasMore = docs.length > limit;
    if (hasMore) {
      docs.pop();
    }

    // Format items and evaluate user read status
    const formatted = docs.map((d: any) => this.formatDoc(d, userId));

    // If unreadOnly requested, filter client-side / view-side
    const displayList = unreadOnly ? formatted.filter((item) => !item.isRead) : formatted;

    const unreadCount = await this.getRCUnreadCount(reviewCenterId, userId);

    return {
      notifications: displayList,
      unreadCount,
      total: formatted.length,
      hasMore,
    };
  }

  /**
   * Get unread notifications count strictly for this reviewCenterId and user
   */
  async getRCUnreadCount(reviewCenterId: string, userId?: string): Promise<number> {
    if (!reviewCenterId) return 0;

    const filter: any = {
      reviewCenterId,
      isRead: false,
    };

    if (userId) {
      filter.deletedUserIds = { $nin: [userId] };
      filter.readUserIds = { $nin: [userId] };
    }

    try {
      const countRes: any = await this.db.$runCommandRaw({
        count: COLLECTION_NAME,
        query: filter,
      });
      return countRes?.n || 0;
    } catch (err) {
      console.warn("Error counting unread RC notifications:", err);
      return 0;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markRCNotificationAsRead(
    id: string,
    reviewCenterId: string,
    userId?: string
  ): Promise<boolean> {
    if (!id || !reviewCenterId) return false;

    const updateOps: any = {
      $set: { isRead: true, updatedAt: new Date() },
    };

    if (userId) {
      updateOps.$addToSet = { readUserIds: userId };
    }

    try {
      await this.db.$runCommandRaw({
        update: COLLECTION_NAME,
        updates: [
          {
            q: {
              _id: { $oid: id },
              reviewCenterId,
            },
            u: updateOps,
          },
        ],
      });
      return true;
    } catch {
      try {
        await this.db.$runCommandRaw({
          update: COLLECTION_NAME,
          updates: [
            {
              q: {
                _id: id,
                reviewCenterId,
              },
              u: updateOps,
            },
          ],
        });
        return true;
      } catch (err) {
        console.error("Error marking RC notification as read:", err);
        return false;
      }
    }
  }

  /**
   * Mark all notifications as read for this review center
   */
  async markAllRCNotificationsAsRead(
    reviewCenterId: string,
    userId?: string
  ): Promise<boolean> {
    if (!reviewCenterId) return false;

    const updateOps: any = {
      $set: { isRead: true, updatedAt: new Date() },
    };

    if (userId) {
      updateOps.$addToSet = { readUserIds: userId };
    }

    try {
      await this.db.$runCommandRaw({
        update: COLLECTION_NAME,
        updates: [
          {
            q: { reviewCenterId },
            u: updateOps,
            multi: true,
          },
        ],
      });
      return true;
    } catch (err) {
      console.error("Error marking all RC notifications as read:", err);
      return false;
    }
  }

  /**
   * Delete / dismiss a notification for a user
   */
  async deleteRCNotification(
    id: string,
    reviewCenterId: string,
    userId?: string
  ): Promise<boolean> {
    if (!id || !reviewCenterId) return false;

    if (userId) {
      // Soft-delete for specific user by recording in deletedUserIds
      try {
        await this.db.$runCommandRaw({
          update: COLLECTION_NAME,
          updates: [
            {
              q: { _id: { $oid: id }, reviewCenterId },
              u: { $addToSet: { deletedUserIds: userId } },
            },
          ],
        });
        return true;
      } catch {
        await this.db.$runCommandRaw({
          update: COLLECTION_NAME,
          updates: [
            {
              q: { _id: id, reviewCenterId },
              u: { $addToSet: { deletedUserIds: userId } },
            },
          ],
        });
        return true;
      }
    } else {
      // Hard delete if no specific user context
      try {
        await this.db.$runCommandRaw({
          delete: COLLECTION_NAME,
          deletes: [{ q: { _id: { $oid: id }, reviewCenterId }, limit: 1 }],
        });
        return true;
      } catch {
        await this.db.$runCommandRaw({
          delete: COLLECTION_NAME,
          deletes: [{ q: { _id: id, reviewCenterId }, limit: 1 }],
        });
        return true;
      }
    }
  }

  /**
   * Clear all notifications for this user in this review center
   */
  async clearAllRCNotifications(
    reviewCenterId: string,
    userId?: string
  ): Promise<boolean> {
    if (!reviewCenterId) return false;

    if (userId) {
      try {
        await this.db.$runCommandRaw({
          update: COLLECTION_NAME,
          updates: [
            {
              q: { reviewCenterId },
              u: { $addToSet: { deletedUserIds: userId } },
              multi: true,
            },
          ],
        });
        return true;
      } catch (err) {
        console.error("Error clearing all RC notifications:", err);
        return false;
      }
    } else {
      try {
        await this.db.$runCommandRaw({
          delete: COLLECTION_NAME,
          deletes: [{ q: { reviewCenterId }, limit: 0 }],
        });
        return true;
      } catch (err) {
        console.error("Error deleting all RC notifications:", err);
        return false;
      }
    }
  }

  private formatDoc(doc: any, currentUserId?: string): RCNotificationItem {
    const id = doc._id?.$oid || doc._id?.toString?.() || String(doc._id || "");
    const readUserIds: string[] = Array.isArray(doc.readUserIds) ? doc.readUserIds : [];
    const deletedUserIds: string[] = Array.isArray(doc.deletedUserIds) ? doc.deletedUserIds : [];

    let isRead = Boolean(doc.isRead);
    if (currentUserId && readUserIds.includes(currentUserId)) {
      isRead = true;
    }

    let parsedMetadata = doc.metadata;
    if (typeof doc.metadata === "string") {
      try {
        parsedMetadata = JSON.parse(doc.metadata);
      } catch {
        parsedMetadata = doc.metadata;
      }
    }

    return {
      id,
      reviewCenterId: doc.reviewCenterId,
      recipientId: doc.recipientId || null,
      title: doc.title,
      message: doc.message,
      type: doc.type || "INFO",
      link: doc.link || null,
      isRead,
      readUserIds,
      deletedUserIds,
      metadata: parsedMetadata,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const rcNotificationService = new ReviewCenterNotificationService();
export default rcNotificationService;
