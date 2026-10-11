import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { encodingTrackerService } from "../../services/admin/encoding-tracker.service";
import { ApiError } from "../../utils/apiError";

/**
 * GET /api/v1/questions/encoding-tracker
 * SuperAdmin, Dean, TeamLead: Fetch KPI metrics and faculty progress
 */
export const getEncodingTrackerOverview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { schoolYear, subjectId, status, search } = req.query;

    const data = await encodingTrackerService.getEncodingTrackerOverview({
      schoolYear: typeof schoolYear === "string" ? schoolYear : undefined,
      subjectId: typeof subjectId === "string" ? subjectId : undefined,
      status: typeof status === "string" ? status : undefined,
      search: typeof search === "string" ? search : undefined,
    });

    return new ApiResponse(
      200,
      data,
      "Faculty encoding tracker data retrieved successfully",
    ).send(res);
  },
);

/**
 * POST /api/v1/questions/encoding-tracker/quota
 * SuperAdmin, Dean, TeamLead: Upsert target quota and deadline for a teacher on a subject
 */
export const upsertQuotaAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { teacherId, subjectId, targetCount, deadline, notes, schoolYear } =
      req.body;

    if (!teacherId || !subjectId) {
      throw new ApiError(400, "teacherId and subjectId are required");
    }

    const assignment = await encodingTrackerService.upsertQuotaAssignment({
      teacherId,
      subjectId,
      schoolYear,
      targetCount: Number(targetCount) || 50,
      deadline: deadline ? new Date(deadline) : null,
      notes,
      assignedById: user.id,
    });

    return new ApiResponse(
      200,
      { assignment },
      "Quota assignment updated successfully",
    ).send(res);
  },
);

/**
 * POST /api/v1/questions/encoding-tracker/nudge
 * SuperAdmin, Dean, TeamLead: Send in-app nudge reminder to a single teacher
 */
export const sendTeacherNudge = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { teacherId, subjectId, customMessage } = req.body;
    if (!teacherId) {
      throw new ApiError(400, "teacherId is required");
    }

    const result = await encodingTrackerService.sendTeacherNudge({
      teacherId,
      subjectId,
      customMessage,
      senderId: user.id,
      senderName: user.name,
    });

    return new ApiResponse(
      200,
      result,
      "Reminder sent to teacher successfully",
    ).send(res);
  },
);

/**
 * POST /api/v1/questions/encoding-tracker/nudge-bulk
 * SuperAdmin, Dean, TeamLead: Send bulk nudge reminders to all lagging teachers
 */
export const sendBulkTeacherNudges = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { subjectId, schoolYear } = req.body;

    const result = await encodingTrackerService.sendBulkTeacherNudges({
      subjectId,
      schoolYear,
      senderId: user.id,
      senderName: user.name,
    });

    return new ApiResponse(
      200,
      result,
      `Reminders sent to ${result.totalNudged} faculty members`,
    ).send(res);
  },
);

/**
 * GET /api/v1/questions/encoding-tracker/my-progress
 * Teachers: View their personal goals, quotas, and current completion metrics
 */
export const getMyEncodingProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { schoolYear } = req.query;

    const data = await encodingTrackerService.getTeacherPersonalProgress(
      user.id,
      typeof schoolYear === "string" ? schoolYear : undefined,
    );

    return new ApiResponse(
      200,
      data,
      "Personal encoding progress retrieved successfully",
    ).send(res);
  },
);
