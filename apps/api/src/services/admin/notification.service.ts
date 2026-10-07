import prisma from "../prisma";
import sseService from "./sse.service";
import pusherService from "./pusher.service";

export interface CreateNotificationInput {
  recipientId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type?:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "QUESTION_APPROVED"
    | "STUDENT_ASSIGNED"
    | "SYSTEM_UPDATE";
  link?: string;
  metadata?: any;
}

export interface GetNotificationsInput {
  userId?: string;
  role?: string;
  reviewCenterId?: string;
  companyName?: string;
  unreadOnly?: boolean;
  limit?: number;
  skip?: number;
  search?: string;
  type?: string;
}

function getOrConditions(
  userId?: string,
  role?: string,
  reviewCenterId?: string,
  companyName?: string,
) {
  const uppercaseRole = role ? role.toUpperCase() : "";
  const isReviewCenter =
    uppercaseRole === "REVIEW_CENTER_REPRESENTATIVE" ||
    uppercaseRole === "REVIEWCENTER";

  // If the user is a Review Center representative:
  // Strictly scope to their user, reviewCenterId, and review center roles.
  // Never pull generic "ALL" notifications from faculty/question-bank.
  if (isReviewCenter) {
    const rcConditions: any[] = [];
    if (userId) {
      rcConditions.push({ recipientId: userId });
    }
    if (reviewCenterId) {
      rcConditions.push({ recipientId: reviewCenterId });
    }
    rcConditions.push({ recipientRole: "REVIEWCENTER" });
    rcConditions.push({ recipientRole: "REVIEW_CENTER_REPRESENTATIVE" });
    return rcConditions.length > 0 ? rcConditions : [{ recipientId: "NONE" }];
  }

  const OR_conditions: any[] = [{ recipientRole: "ALL" }];

  if (userId) {
    OR_conditions.push({ recipientId: userId });
  }
  if (role) {
    OR_conditions.push({ recipientRole: uppercaseRole });
    if (["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(uppercaseRole)) {
      OR_conditions.push({ recipientRole: "REVIEWER" });
      OR_conditions.push({ recipientRole: "STAFF" });
    }
  }

  return OR_conditions;
}

export async function getUnreadNotificationsCount(
  userId?: string,
  role?: string,
  reviewCenterId?: string,
  companyName?: string,
): Promise<number> {
  if (!userId) return 0;

  try {
    const uppercaseRole = role ? role.toUpperCase() : "";
    const isReviewCenter =
      uppercaseRole === "REVIEW_CENTER_REPRESENTATIVE" ||
      uppercaseRole === "REVIEWCENTER";

    const unreadWhere: any = {
      AND: [
        { OR: getOrConditions(userId, role, reviewCenterId, companyName) },
        { NOT: { deletedUserIds: { has: userId } } },
        {
          OR: [
            { recipientId: userId, isRead: false },
            {
              recipientId: { not: userId },
              NOT: { readUserIds: { has: userId } },
            },
            {
              recipientId: null,
              NOT: { readUserIds: { has: userId } },
            },
          ],
        },
      ],
    };

    if (isReviewCenter) {
      const unreadItems = await (prisma as any).notification.findMany({
        where: unreadWhere,
        select: { id: true, type: true, link: true, title: true, metadata: true },
      });
      const validItems = unreadItems.filter((notif: any) => {
        if (notif.link && notif.link.includes("question-bank")) return false;
        if (notif.link && notif.link.includes("subject-management")) return false;
        if (notif.type === "QUESTION_APPROVED") return false;
        if (
          notif.title &&
          notif.title.toLowerCase().includes("question bank")
        ) {
          return false;
        }
        if (notif.metadata) {
          try {
            const meta =
              typeof notif.metadata === "string"
                ? JSON.parse(notif.metadata)
                : notif.metadata;
            if (
              meta.reviewCenterId &&
              reviewCenterId &&
              meta.reviewCenterId !== reviewCenterId
            ) {
              return false;
            }
            if (
              meta.companyName &&
              companyName &&
              meta.companyName.trim().toLowerCase() !==
                companyName.trim().toLowerCase()
            ) {
              return false;
            }
          } catch {}
        }
        return true;
      });
      return validItems.length;
    }

    return await (prisma as any).notification.count({ where: unreadWhere });
  } catch (err: any) {
    console.warn("getUnreadNotificationsCount error:", err?.message);
    return 0;
  }
}

export async function createNotification(input: CreateNotificationInput) {
  const {
    recipientId,
    recipientRole = "ALL",
    title,
    message,
    type = "INFO",
    link,
    metadata,
  } = input;
  const metadataStr = metadata
    ? typeof metadata === "string"
      ? metadata
      : JSON.stringify(metadata)
    : null;

  const notif = await (prisma as any).notification.create({
    data: {
      recipientId: recipientId || null,
      recipientRole,
      title,
      message,
      type,
      link: link || null,
      readUserIds: [],
      deletedUserIds: [],
      metadata: metadataStr,
    },
  });

  try {
    sseService.broadcastNotification(notif);
  } catch (err) {
    console.warn("SSE broadcast error:", err);
  }

  try {
    pusherService.broadcastNotification(notif);
  } catch (err) {
    console.warn("Pusher broadcast error:", err);
  }

  return notif;
}

export async function getUserNotifications(input: GetNotificationsInput) {
  const {
    userId,
    role,
    reviewCenterId,
    companyName,
    unreadOnly = false,
    limit = 15,
    skip = 0,
    search,
    type,
  } = input;

  const uppercaseRole = role ? role.toUpperCase() : "";
  const isReviewCenter =
    uppercaseRole === "REVIEW_CENTER_REPRESENTATIVE" ||
    uppercaseRole === "REVIEWCENTER";

  const andConditions: any[] = [];

  if (userId) {
    andConditions.push({
      NOT: {
        deletedUserIds: { has: userId },
      },
    });
  }

  // If review center, strictly exclude question-bank / faculty notifications
  if (isReviewCenter) {
    andConditions.push({
      NOT: {
        OR: [
          { link: { contains: "question-bank" } },
          { link: { contains: "subject-management" } },
          { type: "QUESTION_APPROVED" },
        ],
      },
    });
  }

  if (unreadOnly && userId) {
    andConditions.push({
      OR: [
        { recipientId: userId, isRead: false },
        {
          recipientId: { not: userId },
          NOT: { readUserIds: { has: userId } },
        },
        {
          recipientId: null,
          NOT: { readUserIds: { has: userId } },
        },
      ],
    });
  }

  if (type && type !== "ALL") {
    andConditions.push({
      type: type.toUpperCase(),
    });
  }

  if (search && search.trim()) {
    const q = search.trim();
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const whereClause: any = {
    AND: [
      { OR: getOrConditions(userId, role, reviewCenterId, companyName) },
      ...andConditions,
    ],
  };

  const [rawNotifications, unreadCount] = await Promise.all([
    (prisma as any).notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: Math.max(0, skip),
      take: isReviewCenter ? limit + 50 : limit + 1,
    }),
    getUnreadNotificationsCount(userId, role, reviewCenterId, companyName),
  ]);

  let items = rawNotifications;
  if (isReviewCenter) {
    items = rawNotifications.filter((notif: any) => {
      if (notif.link && notif.link.includes("question-bank")) return false;
      if (notif.link && notif.link.includes("subject-management")) return false;
      if (notif.type === "QUESTION_APPROVED") return false;
      if (
        notif.title &&
        notif.title.toLowerCase().includes("question bank")
      ) {
        return false;
      }
      if (notif.metadata) {
        try {
          const meta =
            typeof notif.metadata === "string"
              ? JSON.parse(notif.metadata)
              : notif.metadata;
          if (
            meta.reviewCenterId &&
            reviewCenterId &&
            meta.reviewCenterId !== reviewCenterId
          ) {
            return false;
          }
          if (
            meta.companyName &&
            companyName &&
            meta.companyName.trim().toLowerCase() !==
              companyName.trim().toLowerCase()
          ) {
            return false;
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
      return true;
    });
  }

  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;

  const processed = sliced.map((n: any) => {
    const isReadForUser =
      n.recipientId === userId
        ? n.isRead
        : (userId
            ? Array.isArray(n.readUserIds) && n.readUserIds.includes(userId)
            : false);

    return {
      ...n,
      isRead: isReadForUser,
    };
  });

  return {
    notifications: processed,
    unreadCount,
    hasMore,
  };
}

export async function markNotificationAsRead(
  id: string,
  userId?: string,
  role?: string,
) {
  if (!id) return { success: false };

  try {
    const existing = await (prisma as any).notification.findUnique({
      where: { id },
    });
    if (!existing) return { success: false };

    if (userId && existing.recipientId === userId) {
      return await (prisma as any).notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    if (userId && !existing.readUserIds?.includes(userId)) {
      return await (prisma as any).notification.update({
        where: { id },
        data: {
          readUserIds: { push: userId },
        },
      });
    }

    return { id, isRead: true };
  } catch (error: any) {
    console.warn("markNotificationAsRead DB error:", error?.message);
    return { id, isRead: true };
  }
}

export async function markAllNotificationsAsRead(input: GetNotificationsInput) {
  const { userId, role, reviewCenterId, companyName } = input;

  if (!userId) return { success: true };

  try {
    const notificationsToMark = await (prisma as any).notification.findMany({
      where: {
        OR: getOrConditions(userId, role, reviewCenterId, companyName),
        NOT: { deletedUserIds: { has: userId } },
      },
      select: { id: true, recipientId: true, isRead: true, readUserIds: true },
    });

    for (const notif of notificationsToMark) {
      if (notif.recipientId === userId) {
        if (!notif.isRead) {
          await (prisma as any).notification.update({
            where: { id: notif.id },
            data: { isRead: true },
          });
        }
      } else if (!notif.readUserIds?.includes(userId)) {
        await (prisma as any).notification.update({
          where: { id: notif.id },
          data: { readUserIds: { push: userId } },
        });
      }
    }
  } catch (error: any) {
    console.warn("markAllNotificationsAsRead DB error:", error?.message);
  }

  return { success: true };
}

export async function deleteNotification(
  id: string,
  userId?: string,
  role?: string,
) {
  if (!id) return { success: false };

  try {
    const existing = await (prisma as any).notification.findUnique({
      where: { id },
    });
    if (!existing) return { success: false };

    if (userId && existing.recipientId === userId) {
      await (prisma as any).notification.delete({ where: { id } });
    } else if (userId && !existing.deletedUserIds?.includes(userId)) {
      await (prisma as any).notification.update({
        where: { id },
        data: {
          deletedUserIds: { push: userId },
        },
      });
    }
  } catch (error: any) {
    console.warn("deleteNotification DB error:", error?.message);
  }

  return { success: true };
}

export async function clearAllNotifications(input: GetNotificationsInput) {
  const { userId, role, reviewCenterId, companyName } = input;

  if (!userId) return { success: true };

  try {
    const notificationsToClear = await (prisma as any).notification.findMany({
      where: {
        OR: getOrConditions(userId, role, reviewCenterId, companyName),
        NOT: { deletedUserIds: { has: userId } },
      },
      select: { id: true, recipientId: true, deletedUserIds: true },
    });

    for (const notif of notificationsToClear) {
      if (notif.recipientId === userId) {
        await (prisma as any).notification.delete({ where: { id: notif.id } });
      } else if (!notif.deletedUserIds?.includes(userId)) {
        await (prisma as any).notification.update({
          where: { id: notif.id },
          data: { deletedUserIds: { push: userId } },
        });
      }
    }
  } catch (error: any) {
    console.warn("clearAllNotifications DB error:", error?.message);
  }

  return { success: true };
}
