import prisma from "../prisma";
import sseService from "./sse.service";
import pusherService from "./pusher.service";
function getOrConditions(userId, role) {
    const OR_conditions = [{ recipientRole: "ALL" }];
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
export async function getUnreadNotificationsCount(userId, role) {
    if (!userId)
        return 0;
    try {
        const unreadWhere = {
            AND: [
                { OR: getOrConditions(userId, role) },
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
        return await prisma.notification.count({ where: unreadWhere });
    }
    catch (err) {
        console.warn("getUnreadNotificationsCount error:", err?.message);
        return 0;
    }
}
export async function createNotification(input) {
    const { recipientId, recipientRole = "ALL", title, message, type = "INFO", link, metadata, } = input;
    const metadataStr = metadata
        ? typeof metadata === "string"
            ? metadata
            : JSON.stringify(metadata)
        : null;
    const notif = await prisma.notification.create({
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
    }
    catch (err) {
        console.warn("SSE broadcast error:", err);
    }
    try {
        pusherService.broadcastNotification(notif);
    }
    catch (err) {
        console.warn("Pusher broadcast error:", err);
    }
    return notif;
}
export async function getUserNotifications(input) {
    const { userId, role, unreadOnly = false, limit = 15, skip = 0, search, type } = input;
    const andConditions = [];
    if (userId) {
        andConditions.push({
            NOT: {
                deletedUserIds: { has: userId },
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
    const whereClause = {
        AND: [{ OR: getOrConditions(userId, role) }, ...andConditions],
    };
    const [rawNotifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip: Math.max(0, skip),
            take: limit + 1,
        }),
        getUnreadNotificationsCount(userId, role),
    ]);
    const hasMore = rawNotifications.length > limit;
    const items = hasMore ? rawNotifications.slice(0, limit) : rawNotifications;
    const processed = items.map((n) => {
        const isReadForUser = n.recipientId === userId
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
export async function markNotificationAsRead(id, userId, role) {
    if (!id)
        return { success: false };
    try {
        const existing = await prisma.notification.findUnique({
            where: { id },
        });
        if (!existing)
            return { success: false };
        if (userId && existing.recipientId === userId) {
            return await prisma.notification.update({
                where: { id },
                data: { isRead: true },
            });
        }
        if (userId && !existing.readUserIds?.includes(userId)) {
            return await prisma.notification.update({
                where: { id },
                data: {
                    readUserIds: { push: userId },
                },
            });
        }
        return { id, isRead: true };
    }
    catch (error) {
        console.warn("markNotificationAsRead DB error:", error?.message);
        return { id, isRead: true };
    }
}
export async function markAllNotificationsAsRead(input) {
    const { userId, role } = input;
    if (!userId)
        return { success: true };
    try {
        const notificationsToMark = await prisma.notification.findMany({
            where: {
                OR: getOrConditions(userId, role),
                NOT: { deletedUserIds: { has: userId } },
            },
            select: { id: true, recipientId: true, isRead: true, readUserIds: true },
        });
        for (const notif of notificationsToMark) {
            if (notif.recipientId === userId) {
                if (!notif.isRead) {
                    await prisma.notification.update({
                        where: { id: notif.id },
                        data: { isRead: true },
                    });
                }
            }
            else if (!notif.readUserIds?.includes(userId)) {
                await prisma.notification.update({
                    where: { id: notif.id },
                    data: { readUserIds: { push: userId } },
                });
            }
        }
    }
    catch (error) {
        console.warn("markAllNotificationsAsRead DB error:", error?.message);
    }
    return { success: true };
}
export async function deleteNotification(id, userId, role) {
    if (!id)
        return { success: false };
    try {
        const existing = await prisma.notification.findUnique({
            where: { id },
        });
        if (!existing)
            return { success: false };
        if (userId && existing.recipientId === userId) {
            await prisma.notification.delete({ where: { id } });
        }
        else if (userId && !existing.deletedUserIds?.includes(userId)) {
            await prisma.notification.update({
                where: { id },
                data: {
                    deletedUserIds: { push: userId },
                },
            });
        }
    }
    catch (error) {
        console.warn("deleteNotification DB error:", error?.message);
    }
    return { success: true };
}
export async function clearAllNotifications(input) {
    const { userId, role } = input;
    if (!userId)
        return { success: true };
    try {
        const notificationsToClear = await prisma.notification.findMany({
            where: {
                OR: getOrConditions(userId, role),
                NOT: { deletedUserIds: { has: userId } },
            },
            select: { id: true, recipientId: true, deletedUserIds: true },
        });
        for (const notif of notificationsToClear) {
            if (notif.recipientId === userId) {
                await prisma.notification.delete({ where: { id: notif.id } });
            }
            else if (!notif.deletedUserIds?.includes(userId)) {
                await prisma.notification.update({
                    where: { id: notif.id },
                    data: { deletedUserIds: { push: userId } },
                });
            }
        }
    }
    catch (error) {
        console.warn("clearAllNotifications DB error:", error?.message);
    }
    return { success: true };
}
