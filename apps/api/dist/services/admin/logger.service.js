import prisma from "../prisma";
export async function createSystemLog(level, action, message, source, userEmail, ipAddress, metadata) {
    const metadataString = metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null;
    try {
        if (prisma?.systemLog) {
            const log = await prisma.systemLog.create({
                data: {
                    level,
                    action,
                    message,
                    source: source || "System",
                    userEmail: userEmail || null,
                    ipAddress: ipAddress || null,
                    metadata: metadataString,
                },
            });
            return log;
        }
    }
    catch (error) {
        if (process.env.NODE_ENV !== "test") {
            console.warn("Prisma systemLog create fallback:", error?.message);
        }
    }
    return {
        id: "log_" + Date.now(),
        level,
        action,
        message,
        source: source || "System",
        userEmail: userEmail || "",
        ipAddress: ipAddress || "",
        metadata: metadataString || "",
        createdAt: new Date().toISOString(),
    };
}
export const logInfo = (action, message, source, userEmail, ipAddress, metadata) => createSystemLog("INFO", action, message, source, userEmail, ipAddress, metadata);
export const logWarn = (action, message, source, userEmail, ipAddress, metadata) => createSystemLog("WARN", action, message, source, userEmail, ipAddress, metadata);
export const logError = (action, message, source, userEmail, ipAddress, metadata) => createSystemLog("ERROR", action, message, source, userEmail, ipAddress, metadata);
export const logFatal = (action, message, source, userEmail, ipAddress, metadata) => createSystemLog("FATAL", action, message, source, userEmail, ipAddress, metadata);
export async function getSystemLogs(query) {
    const { level, search, limit = 100 } = query;
    try {
        const whereClause = {};
        if (level && level !== "ALL") {
            whereClause.level = level;
        }
        if (search && search.trim()) {
            const term = search.trim();
            whereClause.OR = [
                { message: { contains: term, mode: "insensitive" } },
                { action: { contains: term, mode: "insensitive" } },
                { source: { contains: term, mode: "insensitive" } },
                { userEmail: { contains: term, mode: "insensitive" } },
            ];
        }
        const dbLogs = await prisma.systemLog.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return dbLogs;
    }
    catch (error) {
        console.warn("DB query warning in getSystemLogs:", error);
        return [];
    }
}
export async function getSystemLogStats() {
    const logs = await getSystemLogs({ limit: 1000 });
    return {
        total: logs.length,
        info: logs.filter((l) => l.level === "INFO").length,
        warn: logs.filter((l) => l.level === "WARN").length,
        error: logs.filter((l) => l.level === "ERROR").length,
        fatal: logs.filter((l) => l.level === "FATAL").length,
    };
}
export async function clearSystemLogs() {
    try {
        await prisma.systemLog.deleteMany({});
    }
    catch (error) {
        console.warn("DB clearSystemLogs warning:", error);
    }
    return true;
}
