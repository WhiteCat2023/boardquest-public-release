import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as facultyService from "../../services/admin/faculty.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { Role } from "../../../generated/prisma";

export const getFaculties = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, role, status, cursor, limit } = req.query;
    const requesterRole = req.user?.role;

    const result = await facultyService.getAllFaculty({
      search: search as string,
      role: role as string,
      status: status as string,
      cursor: cursor as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      requesterRole,
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

export const bulkCreateFaculty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
      throw new ApiError(401, "Unauthorized");
    }

    const created = await facultyService.bulkCreateFaculty(req.body.members, creatorRole);

    // Strip password before returning
    const { password, ...faculty } = created as any;

    return new ApiResponse(
      201,
      { faculty },
      "Faculty members created successfully",
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