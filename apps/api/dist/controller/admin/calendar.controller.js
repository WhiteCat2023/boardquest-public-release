import * as calendarService from "../../services/admin/calendar.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const getReviewSchedules = asyncHandler(async (req, res) => {
    const schedules = await calendarService.getAllReviewSchedules();
    return new ApiResponse(200, { schedules }, "Review schedules retrieved successfully").send(res);
});
export const createReviewSchedule = asyncHandler(async (req, res) => {
    const { title, companyName, startDate, endDate, category, status, description } = req.body;
    if (!title || !startDate || !endDate) {
        throw new ApiError(400, "Title, start date, and end date are required.");
    }
    const schedule = await calendarService.createReviewSchedule({
        title,
        companyName: companyName || "Review Center Partner",
        startDate,
        endDate,
        category: category || "Board Review",
        status: status || "UPCOMING",
        description,
    });
    return new ApiResponse(201, { schedule }, "Review schedule created successfully").send(res);
});
export const updateReviewSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const schedule = await calendarService.updateReviewSchedule(id, req.body);
    return new ApiResponse(200, { schedule }, "Review schedule updated successfully").send(res);
});
export const deleteReviewSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await calendarService.deleteReviewSchedule(id);
    return new ApiResponse(200, {}, "Review schedule deleted successfully").send(res);
});
