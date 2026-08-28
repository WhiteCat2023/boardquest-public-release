import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import {
  getSystemLogs,
  getSystemLogStats,
  clearSystemLogs,
  logInfo,
} from "../../services/admin/logger.service";

export const getLogsController = asyncHandler(async (req: Request, res: Response) => {
  const { level, search, limit } = req.query;

  const limitNum = limit ? parseInt(limit as string, 10) : 100;
  const logs = await getSystemLogs({
    level: level as string,
    search: search as string,
    limit: limitNum,
  });

  return new ApiResponse(200, { logs }, "System logs fetched successfully").send(res);
});

export const getLogStatsController = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await getSystemLogStats();
  return new ApiResponse(200, { stats }, "Log stats fetched successfully").send(res);
});

export const clearLogsController = asyncHandler(async (req: any, res: Response) => {
  const userEmail = req.user?.email || "System";
  await clearSystemLogs();

  // Log the clear action
  await logInfo(
    "CLEAR_SYSTEM_LOGS",
    `System logs cleared by administrator (${userEmail}).`,
    "LogsManagement",
    userEmail,
    req.ip
  );

  return new ApiResponse(200, null, "All system logs cleared successfully").send(res);
});
