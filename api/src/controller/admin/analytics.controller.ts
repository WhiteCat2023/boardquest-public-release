import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as analyticsService from "../../services/admin/analytics.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getStudentAnalyticsReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { studentId } = req.params;
  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const report = await analyticsService.getStudentAnalytics(studentId as string);
  return new ApiResponse(200, report, "Student analytics generated successfully").send(res);
});
