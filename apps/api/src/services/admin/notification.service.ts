import prisma from "../prisma";
import sseService from "./sse.service";

export interface CreateNotificationInput {
  recipientId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "QUESTION_APPROVED" | "STUDENT_ASSIGNED" | "SYSTEM_UPDATE";
  link?: string;
  metadata?: any;
}

export interface GetNotificationsInput {
  userId?: string;
  role?: string;
  unreadOnly?: boolean;
  limit?: number;
}

function getOrConditions(userId?: string, role?: string) {
  const OR_conditions: any[] = [{ recipientRole: "ALL" }];

  if (userId) {
    OR_conditions.push({ recipientId: userId });
  }
  if (role) {
    const uppercaseRole = role.toUpperCase();
    OR_conditions.push({ recipientRole: uppercaseRole });
    if (["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(uppercaseRole)) {
      OR_conditions.push({ recipientRole: "REVIEWER" });
      OR_conditions.push({ recipientRole: "STAFF" });
    }
  }

  return OR_conditions;
}

export async function createNotification(input: CreateNotificationInput) {
  const { recipientId, recipientRole = "ALL", title, message, type = "INFO", link, metadata } = input;
  const metadataStr = metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null;

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

  return notif;
}

export async function getUserNotifications(input: GetNotificationsInput) {
  const { userId, role, unreadOnly = false, limit = 50 } = input;

  const whereClause: any = {
    OR: getOrConditions(userId, role),
  };

  if (userId) {
    whereClause.NOT = {
      deletedUserIds: { has: userId },
    };
  }

  const rawNotifications = await (prisma as any).notification.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit * 2,
  });

  const processed = rawNotifications
    .map((n: any) => {
      const isReadForUser =
        n.isRead ||
        (userId ? Array.isArray(n.readUserIds) && n.readUserIds.includes(userId) : false);

      return {
        ...n,
        isRead: isReadForUser,
      };
    })
    .filter((n: any) => !unreadOnly || !n.isRead);

  return processed.slice(0, limit);
}

export async function markNotificationAsRead(id: string, userId?: string, role?: string) {
  if (!id) return { success: false };

  try {
    const existing = await (prisma as any).notification.findUnique({ where: { id } });
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
  const { userId, role } = input;

  if (!userId) return { success: true };

  try {
    const notificationsToMark = await (prisma as any).notification.findMany({
      where: {
        OR: getOrConditions(userId, role),
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

export async function deleteNotification(id: string, userId?: string, role?: string) {
  if (!id) return { success: false };

  try {
    const existing = await (prisma as any).notification.findUnique({ where: { id } });
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
  const { userId, role } = input;

  if (!userId) return { success: true };

  try {
    const notificationsToClear = await (prisma as any).notification.findMany({
      where: {
        OR: getOrConditions(userId, role),
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
