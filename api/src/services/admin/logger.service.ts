import prisma from "../prisma";

export type LogLevelType = "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogFilterQuery {
  level?: string;
  search?: string;
  limit?: number;
}

// const DEMO_LOGS = [
//   {
//     id: "log_fatal_01",
//     level: "FATAL",
//     action: "DATABASE_CONNECTION_FAIL",
//     message: "Primary MongoDB cluster connection lost. Failed retry sequence after 5 attempts.",
//     source: "DatabaseDriver",
//     userEmail: "system@boardquest.edu",
//     ipAddress: "10.0.4.12",
//     metadata: JSON.stringify({
//       error: "MongoNetworkTimeoutError: connection timed out after 30000ms",
//       stack: "Error: connection timed out at MongoClient.connect (/app/node_modules/mongodb/lib/mongo_client.js:240)"
//     }),
//     createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
//   },
//   {
//     id: "log_error_01",
//     level: "ERROR",
//     action: "QUESTION_IMPORT_FAILED",
//     message: "CSV import failed on row 42 due to missing required field 'correctAnswer'.",
//     source: "QuestionService",
//     userEmail: "faculty.lead@boardquest.edu",
//     ipAddress: "192.168.1.45",
//     metadata: JSON.stringify({
//       row: 42,
//       fileName: "MTLE_Mock_Questions_2026.csv",
//       validationErrors: ["correctAnswer cannot be null or empty"]
//     }),
//     createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
//   },
//   {
//     id: "log_error_02",
//     level: "ERROR",
//     action: "UNAUTHORIZED_API_ACCESS",
//     message: "Forbidden access attempt to /api/review-center/schedules without ADMIN permission.",
//     source: "AuthMiddleware",
//     userEmail: "student.user@boardquest.edu",
//     ipAddress: "192.168.1.102",
//     metadata: JSON.stringify({
//       requestedRoute: "/api/review-center/schedules/create",
//       role: "STUDENT"
//     }),
//     createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
//   },
//   {
//     id: "log_warn_01",
//     level: "WARN",
//     action: "AUTH_LOGIN_FAILED",
//     message: "Invalid password attempt for account admin@boardquest.edu (Attempt 2 of 5).",
//     source: "AuthService",
//     userEmail: "admin@boardquest.edu",
//     ipAddress: "112.198.40.18",
//     metadata: JSON.stringify({ attemptsRemaining: 3 }),
//     createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
//   },
//   {
//     id: "log_warn_02",
//     level: "WARN",
//     action: "DEPRECATED_API_CALL",
//     message: "Legacy endpoint /api/questions/old-get invoked by mobile client v1.2.0.",
//     source: "ApiGateway",
//     userEmail: "teacher.smith@boardquest.edu",
//     ipAddress: "192.168.1.88",
//     metadata: JSON.stringify({ userAgent: "BoardQuest-MobileApp/1.2.0" }),
//     createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
//   },
//   {
//     id: "log_info_01",
//     level: "INFO",
//     action: "CREATE_REVIEW_SCHEDULE",
//     message: "Created new review period 'Final Coaching & Mock Examination Week' (Jul 22 - Jul 28).",
//     source: "ReviewCenterService",
//     userEmail: "admin@boardquest.edu",
//     ipAddress: "192.168.1.10",
//     metadata: JSON.stringify({ scheduleId: "sched_2026_03", durationDays: 7 }),
//     createdAt: new Date(Date.now() - 210 * 60000).toISOString(),
//   },
//   {
//     id: "log_info_02",
//     level: "INFO",
//     action: "CREATE_SCHOOL_YEAR",
//     message: "Added new academic school year 'S.Y. 2026-2027' to evaluation question bank.",
//     source: "QuestionBankService",
//     userEmail: "superadmin@boardquest.edu",
//     ipAddress: "192.168.1.5",
//     metadata: JSON.stringify({ schoolYear: "S.Y. 2026-2027" }),
//     createdAt: new Date(Date.now() - 260 * 60000).toISOString(),
//   },
//   {
//     id: "log_info_03",
//     level: "INFO",
//     action: "USER_LOGIN_SUCCESS",
//     message: "SuperAdmin user logged in successfully.",
//     source: "AuthService",
//     userEmail: "superadmin@boardquest.edu",
//     ipAddress: "192.168.1.5",
//     metadata: JSON.stringify({ sessionDurationHours: 8 }),
//     createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
//   },
// ];

// let IN_MEMORY_LOGS = [...DEMO_LOGS];

// async function seedInitialSystemLogs() {
//   try {
//     const initialLogs = DEMO_LOGS.map((log) => ({
//       level: log.level as LogLevelType,
//       action: log.action,
//       message: log.message,
//       source: log.source || "System",
//       userEmail: log.userEmail || null,
//       ipAddress: log.ipAddress || null,
//       metadata: log.metadata || null,
//       createdAt: new Date(log.createdAt),
//     }));

//     await (prisma as any).systemLog.createMany({
//       data: initialLogs,
//     });
//     console.log("Successfully seeded initial system logs to MongoDB database.");
//   } catch (err: any) {
//     console.warn("Failed to seed initial system logs to database:", err?.message);
//   }
// }

export async function createSystemLog(
  level: LogLevelType,
  action: string,
  message: string,
  source?: string,
  userEmail?: string,
  ipAddress?: string,
  metadata?: any
) {
  const metadataString = metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : null;

  try {
    if ((prisma as any)?.systemLog) {
      const log = await (prisma as any).systemLog.create({
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
  } catch (error: any) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Prisma systemLog create fallback:", error?.message);
    }
  }

  const fallbackLog = {
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
  // IN_MEMORY_LOGS.unshift(fallbackLog);
  return fallbackLog;
}

export const logInfo = (action: string, message: string, source?: string, userEmail?: string, ipAddress?: string, metadata?: any) =>
  createSystemLog("INFO", action, message, source, userEmail, ipAddress, metadata);

export const logWarn = (action: string, message: string, source?: string, userEmail?: string, ipAddress?: string, metadata?: any) =>
  createSystemLog("WARN", action, message, source, userEmail, ipAddress, metadata);

export const logError = (action: string, message: string, source?: string, userEmail?: string, ipAddress?: string, metadata?: any) =>
  createSystemLog("ERROR", action, message, source, userEmail, ipAddress, metadata);

export const logFatal = (action: string, message: string, source?: string, userEmail?: string, ipAddress?: string, metadata?: any) =>
  createSystemLog("FATAL", action, message, source, userEmail, ipAddress, metadata);

export async function getSystemLogs(query: LogFilterQuery) {
  const { level, search, limit = 100 } = query;

  let dbLogs: any[] = [];
  try {
    // const count = await (prisma as any).systemLog.count();
    // if (count === 0) {
    //   await seedInitialSystemLogs();
    // }

    const whereClause: any = {};

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

    dbLogs = await (prisma as any).systemLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.warn("DB query warning in getSystemLogs:", error);
  }

  // Combine DB logs and IN_MEMORY_LOGS to ensure all recorded logs are visible
  const allLogsMap = new Map<string, any>();
  
  // Add in-memory logs first
  // IN_MEMORY_LOGS.forEach((l) => allLogsMap.set(l.id, l));
  
  // Add/overwrite with DB logs
  dbLogs.forEach((l) => allLogsMap.set(l.id, l));

  let combined = Array.from(allLogsMap.values());

  // Filter combined logs by level
  if (level && level !== "ALL") {
    combined = combined.filter((l) => l.level === level);
  }

  // Filter combined logs by search term
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    combined = combined.filter(
      (l) =>
        (l.message && l.message.toLowerCase().includes(term)) ||
        (l.action && l.action.toLowerCase().includes(term)) ||
        (l.source && l.source.toLowerCase().includes(term)) ||
        (l.userEmail && l.userEmail.toLowerCase().includes(term))
    );
  }

  // Sort by createdAt descending
  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return combined.slice(0, limit);
}

export async function getSystemLogStats() {
  const logs = await getSystemLogs({ limit: 1000 });
  
  const stats = {
    total: logs.length,
    info: logs.filter((l: any) => l.level === "INFO").length,
    warn: logs.filter((l: any) => l.level === "WARN").length,
    error: logs.filter((l: any) => l.level === "ERROR").length,
    fatal: logs.filter((l: any) => l.level === "FATAL").length,
  };

  return stats;
}

export async function clearSystemLogs() {
  try {
    await (prisma as any).systemLog.deleteMany({});
  } catch (error) {
    console.warn("DB clearSystemLogs warning:", error);
  }
  // IN_MEMORY_LOGS = [];
  return true;
}
