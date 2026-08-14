import * as guidanceService from "../../services/admin/guidance.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const createGuidanceAssignment = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    const creatorId = req.user?.id;
    if (!creatorRole || !creatorId) {
        throw new ApiError(401, "Unauthorized");
    }
    const assignment = await guidanceService.createGuidanceAssignment(creatorId, req.body, creatorRole);
    return new ApiResponse(201, { assignment }, "Student successfully assigned to guidance advisor").send(res);
});
export const getGuidanceAssignments = asyncHandler(async (req, res) => {
    const { status, advisorId, studentId, search } = req.query;
    const assignments = await guidanceService.getGuidanceAssignments({
        status: status,
        advisorId: advisorId,
        studentId: studentId,
        search: search,
    });
    return new ApiResponse(200, { assignments }, "Guidance assignments retrieved successfully").send(res);
});
export const updateGuidanceAssignment = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const { id } = req.params;
    const updated = await guidanceService.updateGuidanceAssignment(id, userId, userRole, req.body);
    return new ApiResponse(200, { assignment: updated }, "Guidance assignment updated successfully").send(res);
});
export const getFailingStudents = asyncHandler(async (req, res) => {
    const students = await guidanceService.getFailingStudents();
    return new ApiResponse(200, { students }, "Failing student metrics retrieved successfully").send(res);
});
