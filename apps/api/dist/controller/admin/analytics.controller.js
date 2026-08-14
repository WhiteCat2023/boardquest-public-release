import * as analyticsService from "../../services/admin/analytics.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const getStudentAnalyticsReport = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
        throw new ApiError(400, "Student ID is required");
    }
    const report = await analyticsService.getStudentAnalytics(studentId);
    return new ApiResponse(200, report, "Student analytics generated successfully").send(res);
});
export const getDashboardAnalyticsSummary = asyncHandler(async (req, res) => {
    const summary = await analyticsService.getDashboardAnalyticsSummary();
    return new ApiResponse(200, summary, "Dashboard analytics summary retrieved successfully").send(res);
});
