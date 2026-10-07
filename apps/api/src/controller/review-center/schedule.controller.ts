import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as scheduleService from "../../services/review-center/schedule.service";
import rcNotificationService from "../../services/review-center/rcNotification.service.js";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getMyReviewSchedules = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const { schoolYear } = req.query as Record<string, string>;

    const schedules = await scheduleService.getReviewCenterSchedules(
      companyName,
      reviewCenterId,
      schoolYear,
    );
    return new ApiResponse(
      200,
      { schedules },
      "Review schedules retrieved successfully",
    ).send(res);
  },
);

export const createMyReviewSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { title, startDate, endDate, category, description, schoolYear } = req.body;

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
      schoolYear,
    });

    if (reviewCenterId) {
      rcNotificationService
        .createRCNotification({
          reviewCenterId,
          title: "New Evaluation Schedule Set",
          message: `Schedule "${title}" has been set for ${new Date(startDate).toLocaleDateString()}.`,
          type: "SCHEDULE",
          link: "/schedules",
        })
        .catch((err) => console.warn("Failed to create RC notification for schedule:", err));
    }

    return new ApiResponse(
      201,
      { schedule },
      "Review schedule created and synced with Academic Calendar successfully",
    ).send(res);
  },
);

export const updateMyReviewSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const schedule = await scheduleService.updateReviewCenterSchedule(
      id as string,
      req.body,
      companyName,
      reviewCenterId,
    );
    return new ApiResponse(
      200,
      { schedule },
      "Review schedule updated successfully",
    ).send(res);
  },
);

export const deleteMyReviewSchedule = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    await scheduleService.deleteReviewCenterSchedule(
      id as string,
      companyName,
      reviewCenterId,
    );
    return new ApiResponse(
      200,
      {},
      "Review schedule deleted successfully",
    ).send(res);
  },
);
