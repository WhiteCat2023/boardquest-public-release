import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as facultyService from "../../services/admin/faculty.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getFaculties = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, role, departmentId, status, cursor, limit } = req.query;

    const result = await facultyService.getAllFaculty({
      search: search as string,
      role: role as string,
      departmentId: departmentId as string,
      status: status as string,
      cursor: cursor as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    if (result && typeof result === "object" && "faculties" in result) {
      const sanitized = result.faculties.map((f: any) => {
        const { password, ...rest } = f;
        return rest;
      });

      return new ApiResponse(
        200,
        {
          faculties: sanitized,
          nextCursor: result.nextCursor,
          hasNextPage: result.hasNextPage,
        },
        "Faculty members retrieved successfully",
      ).send(res);
    }

    const sanitized = (result as any[]).map((f: any) => {
      const { password, ...rest } = f;
      return rest;
    });

    return new ApiResponse(
      200,
      { faculties: sanitized },
      "Faculty members retrieved successfully",
    ).send(res);
  },
);

export const createFaculty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const created = await facultyService.createFaculty(req.body, creatorRole);

    // Strip password before returning
    const { password, ...faculty } = created as any;

    return new ApiResponse(
      201,
      { faculty },
      "Faculty member created successfully",
    ).send(res);
  },
);

export const toggleFacultyStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const faculty = await facultyService.toggleFacultyStatus(
      id as string,
      Boolean(isActive),
      creatorRole,
    );

    return new ApiResponse(
      200,
      { faculty },
      "Faculty status updated successfully",
    ).send(res);
  },
);

export const updateFacultyCategories = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      throw new ApiError(400, "categoryIds must be an array of category IDs.");
    }

    const faculty = await facultyService.updateFacultyCategories(
      id as string,
      categoryIds,
      creatorRole,
    );

    return new ApiResponse(
      200,
      { faculty },
      "Handled categories updated successfully",
    ).send(res);
  },
);

export const updateFacultyPermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const faculty = await facultyService.updateUserPermissions(
      id as string,
      req.body,
      creatorRole,
    );

    return new ApiResponse(
      200,
      { faculty },
      "User permissions updated successfully",
    ).send(res);
  },
);

export const createPermissionRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const request = await facultyService.createPermissionRequest(userId, req.body);

    return new ApiResponse(
      201,
      { request },
      "Permission request submitted successfully",
    ).send(res);
  },
);

export const getPermissionRequests = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { status, targetUserId } = req.query;

    let requests;
    if (userRole === "TEACHER") {
      requests = await facultyService.getPermissionRequests({
        status: status as string,
        userId,
        targetUserId: targetUserId as string,
      });
    } else {
      requests = await facultyService.getPermissionRequests({
        status: status as string,
        targetUserId: targetUserId as string,
      });
    }

    return new ApiResponse(
      200,
      { requests },
      "Permission requests retrieved successfully",
    ).send(res);
  },
);

export const reviewPermissionRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const reviewerId = req.user?.id;
    const reviewerRole = req.user?.role;
    if (!reviewerId || !reviewerRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (status !== "APPROVED" && status !== "DECLINED") {
      throw new ApiError(400, "Status must be APPROVED or DECLINED.");
    }

    const request = await facultyService.reviewPermissionRequest(
      id as string,
      reviewerId,
      status,
      reviewNote,
      reviewerRole,
    );

    return new ApiResponse(
      200,
      { request },
      `Permission request ${status.toLowerCase()} successfully`,
    ).send(res);
  },
);
