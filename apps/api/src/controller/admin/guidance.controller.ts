import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as guidanceService from "../../services/admin/guidance.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

import { Role } from "../../types/prisma.types";

export const createGuidanceAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    const creatorId = req.user?.id;
    if (!creatorRole || !creatorId) {
      throw new ApiError(401, "Unauthorized");
    }

    const assignment = await guidanceService.createGuidanceAssignment(
      creatorId,
      req.body,
      creatorRole as Role,
    );

    return new ApiResponse(
      201,
      { assignment },
      "Student successfully assigned to guidance advisor",
    ).send(res);
  },
);

export const getGuidanceAssignments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { status, advisorId, studentId, search } = req.query;

    const assignments = await guidanceService.getGuidanceAssignments({
      status: status as string,
      advisorId: advisorId as string,
      studentId: studentId as string,
      search: search as string,
    });

    return new ApiResponse(
      200,
      { assignments },
      "Guidance assignments retrieved successfully",
    ).send(res);
  },
);

export const updateGuidanceAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const updated = await guidanceService.updateGuidanceAssignment(
      id as string,
      userId,
      userRole as Role,
      req.body,
    );

    return new ApiResponse(
      200,
      { assignment: updated },
      "Guidance assignment updated successfully",
    ).send(res);
  },
);

export const getFailingStudents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const students = await guidanceService.getFailingStudents();

    return new ApiResponse(
      200,
      { students },
      "Failing student metrics retrieved successfully",
    ).send(res);
  },
);
