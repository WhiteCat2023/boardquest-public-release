import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as facultyService from "../../services/admin/faculty.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getFaculties = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const faculties = await facultyService.getAllFaculty();
  
  // Sanitize password before returning
  const sanitized = faculties.map(f => {
    const { password, ...rest } = f;
    return rest;
  });

  return new ApiResponse(200, { faculties: sanitized }, "Faculty members retrieved successfully").send(res);
});

export const createFaculty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const creatorRole = req.user?.role;
  if (!creatorRole) {
    throw new ApiError(401, "Unauthorized");
  }

  const faculty = await facultyService.createFaculty(req.body, creatorRole);
  
  // Sanitize password before returning
  const { password, ...sanitized } = faculty;

  return new ApiResponse(201, { faculty: sanitized }, "Faculty member created successfully").send(res);
});

export const deleteFaculty = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const creatorRole = req.user?.role;
  if (!creatorRole) {
    throw new ApiError(401, "Unauthorized");
  }

  const { id } = req.params;
  await facultyService.deleteFaculty(id as string, creatorRole);

  return new ApiResponse(200, null, "Faculty member deleted successfully").send(res);
});

export const toggleFacultyStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const creatorRole = req.user?.role;
  if (!creatorRole) {
    throw new ApiError(401, "Unauthorized");
  }

  const { id } = req.params;
  const { isActive } = req.body;

  const updated = await facultyService.toggleFacultyStatus(id as string, Boolean(isActive), creatorRole);
  const { password, ...sanitized } = updated;

  return new ApiResponse(200, { faculty: sanitized }, "Faculty status updated successfully").send(res);
});
