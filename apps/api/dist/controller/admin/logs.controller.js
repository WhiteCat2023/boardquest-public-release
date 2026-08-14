import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { getSystemLogs, getSystemLogStats, clearSystemLogs, logInfo, } from "../../services/admin/logger.service";
export const getLogsController = asyncHandler(async (req, res) => {
    const { level, search, limit } = req.query;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const logs = await getSystemLogs({
        level: level,
        search: search,
        limit: limitNum,
    });
    return new ApiResponse(200, { logs }, "System logs fetched successfully").send(res);
});
export const getLogStatsController = asyncHandler(async (_req, res) => {
    const stats = await getSystemLogStats();
    return new ApiResponse(200, { stats }, "Log stats fetched successfully").send(res);
});
export const clearLogsController = asyncHandler(async (req, res) => {
    const userEmail = req.user?.email || "admin@boardquest.edu";
    await clearSystemLogs();
    // Log the clear action
    await logInfo("CLEAR_SYSTEM_LOGS", `System logs cleared by administrator (${userEmail}).`, "LogsManagement", userEmail, req.ip);
    return new ApiResponse(200, null, "All system logs cleared successfully").send(res);
});
