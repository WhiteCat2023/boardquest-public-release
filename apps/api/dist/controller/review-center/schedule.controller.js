import * as scheduleService from "../../services/review-center/schedule.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const getMyReviewSchedules = asyncHandler(async (req, res) => {
    const user = req.user;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const schedules = await scheduleService.getReviewCenterSchedules(companyName, reviewCenterId);
    return new ApiResponse(200, { schedules }, "Review schedules retrieved successfully").send(res);
});
export const createMyReviewSchedule = asyncHandler(async (req, res) => {
    const user = req.user;
    const { title, startDate, endDate, category, description } = req.body;
    if (!title || !startDate || !endDate) {
        throw new ApiError(400, "Title, start date, and end date are required.");
    }
    const companyName = user?.companyName || "Review Center Partner";
    const reviewCenterId = user?.reviewCenterId;
    const schedule = await scheduleService.createReviewCenterSchedule({
        title,
        startDate,
        endDate,
        category: category || "Board Review",
        description,
        companyName,
        reviewCenterId,
    });
    return new ApiResponse(201, { schedule }, "Review schedule created and synced with Academic Calendar successfully").send(res);
});
export const updateMyReviewSchedule = asyncHandler(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const schedule = await scheduleService.updateReviewCenterSchedule(id, req.body, companyName, reviewCenterId);
    return new ApiResponse(200, { schedule }, "Review schedule updated successfully").send(res);
});
export const deleteMyReviewSchedule = asyncHandler(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    await scheduleService.deleteReviewCenterSchedule(id, companyName, reviewCenterId);
    return new ApiResponse(200, {}, "Review schedule deleted successfully").send(res);
});
