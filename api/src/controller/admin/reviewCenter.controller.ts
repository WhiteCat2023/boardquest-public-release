import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as reviewCenterService from "../../services/admin/reviewCenter.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getReviewCenters = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const list = await reviewCenterService.getAllReviewCenters();

  const sanitized = list.map((item: any) => {
    const { password, ...rest } = item;
    return rest;
  });

  return new ApiResponse(200, { reviewCenters: sanitized }, "Review centers retrieved successfully").send(res);
});

export const getReviewCenterById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const item = await reviewCenterService.getReviewCenterById(id as string);

  if (!item) {
    throw new ApiError(404, "Review center representative not found");
  }

  const { password, ...sanitized } = item as any;
  return new ApiResponse(200, { reviewCenter: sanitized }, "Review center retrieved successfully").send(res);
});

export const createReviewCenter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, companyName, phonenumber, employeeId, location, password } = req.body;

  if (!name || !email || !companyName) {
    throw new ApiError(400, "Name, email, and company name are required.");
  }

  const newRecord = await reviewCenterService.createReviewCenter({
    name,
    email,
    companyName,
    phonenumber: phonenumber || "",
    employeeId: employeeId || `RC-${Date.now().toString().slice(-4)}`,
    location: location || "Philippines",
    password,
  });

  const { password: _, ...sanitized } = newRecord as any;

  return new ApiResponse(201, { reviewCenter: sanitized }, "Review center created successfully").send(res);
});

export const updateReviewCenter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updatedRecord = await reviewCenterService.updateReviewCenter(id as string, req.body);

  const { password: _, ...sanitized } = updatedRecord as any;

  return new ApiResponse(200, { reviewCenter: sanitized }, "Review center updated successfully").send(res);
});

export const deleteReviewCenter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await reviewCenterService.deleteReviewCenter(id as string);

  return new ApiResponse(200, {}, "Review center deleted successfully").send(res);
});

// --- SCHEDULE / CALENDAR CONTROLLERS ---

export const getReviewSchedules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const schedules = await reviewCenterService.getAllReviewSchedules();
  return new ApiResponse(200, { schedules }, "Review schedules retrieved successfully").send(res);
});

export const createReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, companyName, startDate, endDate, category, status, description } = req.body;

  if (!title || !startDate || !endDate) {
    throw new ApiError(400, "Title, start date, and end date are required.");
  }

  const schedule = await reviewCenterService.createReviewSchedule({
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

export const updateReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const schedule = await reviewCenterService.updateReviewSchedule(id as string, req.body);

  return new ApiResponse(200, { schedule }, "Review schedule updated successfully").send(res);
});

export const deleteReviewSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await reviewCenterService.deleteReviewSchedule(id as string);

  return new ApiResponse(200, {}, "Review schedule deleted successfully").send(res);
});
