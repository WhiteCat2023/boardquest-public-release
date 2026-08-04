import prisma from "../prisma";

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

// Memory fallback notifications if database is empty or fallback mode
let memoryNotifications: any[] = [
  {
    id: "notif_seed_1",
    recipientId: null,
    recipientRole: "ALL",
    title: "System Audit & Security Sync",
    message: "System logs & student evaluation module successfully synchronized.",
    type: "SYSTEM_UPDATE",
    link: "/logs-management",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_seed_2",
    recipientId: null,
    recipientRole: "ALL",
    title: "Question Bank Approval",
    message: "10 new Clinical Chemistry items were approved into the licensure bank.",
    type: "QUESTION_APPROVED",
    link: "/question-bank",
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_seed_3",
    recipientId: null,
    recipientRole: "ALL",
    title: "New Student Guidance Assigned",
    message: "Academic guidance task assigned for high-risk performance review.",
    type: "STUDENT_ASSIGNED",
    link: "/student-management",
    isRead: false,
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
];

export async function createNotification(input: CreateNotificationInput) {
  const { recipientId, recipientRole = "ALL", title, message, type = "INFO", link, metadata } = input;
  const metadataStr = metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null;

  try {
    if ((prisma as any)?.notification) {
      const notif = await (prisma as any).notification.create({
        data: {
          recipientId: recipientId || null,
          recipientRole,
          title,
          message,
          type,
          link: link || null,
          metadata: metadataStr,
        },
      });
      return notif;
    }
  } catch (error: any) {
    console.warn("Fallback createNotification error:", error?.message);
  }

  const memNotif = {
    id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    recipientId: recipientId || null,
    recipientRole,
    title,
    message,
    type,
    link: link || null,
    isRead: false,
    metadata: metadataStr,
    createdAt: new Date().toISOString(),
  };

  memoryNotifications.unshift(memNotif);
  return memNotif;
}

export async function getUserNotifications(input: GetNotificationsInput) {
  const { userId, role, unreadOnly = false, limit = 50 } = input;

  try {
    if ((prisma as any)?.notification) {
      const OR_conditions: any[] = [{ recipientRole: "ALL" }];

      if (userId) {
        OR_conditions.push({ recipientId: userId });
      }
      if (role) {
        OR_conditions.push({ recipientRole: role.toUpperCase() });
      }

      const whereClause: any = {
        OR: OR_conditions,
      };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const dbNotifications = await (prisma as any).notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      if (dbNotifications && dbNotifications.length > 0) {
        return dbNotifications;
      }
    }
  } catch (error: any) {
    console.warn("getUserNotifications DB query warning:", error?.message);
  }

  // Memory fallback handling
  let list = [...memoryNotifications];

  if (role) {
    list = list.filter(
      (n) => n.recipientRole === "ALL" || n.recipientRole === role.toUpperCase() || (userId && n.recipientId === userId)
    );
  }

  if (unreadOnly) {
    list = list.filter((n) => !n.isRead);
  }

  return list.slice(0, limit);
}

export async function markNotificationAsRead(id: string, userId?: string) {
  // Update memory state
  memoryNotifications = memoryNotifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    try {
      if ((prisma as any)?.notification) {
        const updated = await (prisma as any).notification.update({
          where: { id },
          data: { isRead: true },
        });
        return updated;
      }
    } catch (error: any) {
      console.warn("markNotificationAsRead DB error:", error?.message);
    }
  }

  return { id, isRead: true };
}

export async function markAllNotificationsAsRead(input: GetNotificationsInput) {
  // Update memory state
  memoryNotifications = memoryNotifications.map((n) => ({ ...n, isRead: true }));

  try {
    if ((prisma as any)?.notification) {
      await (prisma as any).notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    }
  } catch (error: any) {
    console.warn("markAllNotificationsAsRead DB error:", error?.message);
  }

  return { success: true };
}

export async function deleteNotification(id: string, userId?: string) {
  // Update memory state
  memoryNotifications = memoryNotifications.filter((n) => n.id !== id);

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    try {
      if ((prisma as any)?.notification) {
        await (prisma as any).notification.delete({
          where: { id },
        });
      }
    } catch (error: any) {
      console.warn("deleteNotification DB error:", error?.message);
    }
  }

  return { success: true };
}

export async function clearAllNotifications(input: GetNotificationsInput) {
  memoryNotifications = [];

  try {
    if ((prisma as any)?.notification) {
      await (prisma as any).notification.deleteMany({});
    }
  } catch (error: any) {
    console.warn("clearAllNotifications DB error:", error?.message);
  }

  return { success: true };
}
