import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as calendarService from "../../services/admin/calendar.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getReviewSchedules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const schedules = await calendarService.getAllReviewSchedules();
  return new ApiResponse(200, { schedules }, "Review schedules retrieved successfully").send(res);
});

const assertCanManageSchedule = (req: AuthenticatedRequest) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (role !== "SUPERADMIN" && role !== "DEAN" && role !== "TEAMLEAD") {
    throw new ApiError(
      403,
      "Access Denied: Only the Team Lead, Dean, and Superadmin can create or manage schedules in the academic calendar."
    );
  }
};

export const createReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  assertCanManageSchedule(req);
  const { title, companyName, startDate, endDate, category, description } = req.body;

  if (!title || !startDate || !endDate) {
    throw new ApiError(400, "Title, start date, and end date are required.");
  }

  const schedule = await calendarService.createReviewSchedule({
    title,
    companyName: companyName || "Review Center Partner",
    startDate,
    endDate,
    category: category || "Board Review",
    description,
  });

  return new ApiResponse(201, { schedule }, "Review schedule created successfully").send(res);
});

export const updateReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  assertCanManageSchedule(req);
  const { id } = req.params;
  const schedule = await calendarService.updateReviewSchedule(id as string, req.body);

  return new ApiResponse(200, { schedule }, "Review schedule updated successfully").send(res);
});

export const deleteReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  assertCanManageSchedule(req);
  const { id } = req.params;
  await calendarService.deleteReviewSchedule(id as string);

  return new ApiResponse(200, {}, "Review schedule deleted successfully").send(res);
});
