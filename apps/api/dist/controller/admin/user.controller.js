import * as userService from "../../services/admin/user.service";
import { extractUserIdFromToken } from "../../utils/jwt.utils";
import prisma from "../../services/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { ensureSuperAdminExists } from "../../services/admin/bootstrap.service";
import { isSuperAdmin, getSuperAdminProfile } from "../../config/credentials";
export const me = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken || req.cookies?.token;
    if (!token) {
        return new ApiResponse(401, null, "No token provided").send(res);
    }
    const id = extractUserIdFromToken(token);
    if (isSuperAdmin(id)) {
        const dbSuperAdmin = await ensureSuperAdminExists();
        const superUser = dbSuperAdmin || getSuperAdminProfile();
        return new ApiResponse(200, { user: superUser }, "User retrieved successfully").send(res);
    }
    const user = await prisma.adminUser.findUnique({
        where: { id },
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            role: true,
            handledCategoryIds: true,
            handledCategories: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!user) {
        return new ApiResponse(404, null, "User not found").send(res);
    }
    return new ApiResponse(200, { user }, "User retrieved successfully").send(res);
});
export const getFaculties = asyncHandler(async (req, res) => {
    const { search, role, status, cursor, limit } = req.query;
    const requesterRole = req.user?.role;
    if (requesterRole === "TEACHER") {
        return new ApiResponse(200, {
            faculties: [],
            nextCursor: null,
            hasNextPage: false,
            total: 0,
        }, "Faculty list not accessible for teacher role").send(res);
    }
    const result = await userService.getAllFaculty({
        search: search,
        role: role,
        status: status,
        cursor: cursor,
        limit: limit ? parseInt(limit, 10) : undefined,
        requesterRole,
    });
    if (result && typeof result === "object" && "faculties" in result) {
        const sanitized = result.faculties.map((f) => {
            const { password, ...rest } = f;
            return rest;
        });
        return new ApiResponse(200, {
            faculties: sanitized,
            nextCursor: result.nextCursor,
            hasNextPage: result.hasNextPage,
        }, "Faculty members retrieved successfully").send(res);
    }
    const sanitized = result.map((f) => {
        const { password, ...rest } = f;
        return rest;
    });
    return new ApiResponse(200, { faculties: sanitized }, "Faculty members retrieved successfully").send(res);
});
export const createFaculty = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const created = await userService.createFaculty(req.body, creatorRole);
    // Strip password before returning
    const { password, ...faculty } = created;
    return new ApiResponse(201, { faculty }, "Faculty member created successfully").send(res);
});
export const bulkCreateFaculty = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const created = await userService.bulkCreateFaculty(req.body.members, creatorRole);
    // Strip password before returning
    const { password, ...faculty } = created;
    return new ApiResponse(201, { faculty }, "Faculty members created successfully").send(res);
});
export const toggleFacultyStatus = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const { id } = req.params;
    const { accountStatus, account_status, isActive } = req.body;
    const nextStatus = accountStatus !== undefined
        ? accountStatus
        : account_status !== undefined
            ? account_status
            : Boolean(isActive);
    const faculty = await userService.toggleFacultyStatus(id, nextStatus, creatorRole);
    return new ApiResponse(200, { faculty }, "Faculty status updated successfully").send(res);
});
export const updateFacultyCategories = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const { id } = req.params;
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds)) {
        throw new ApiError(400, "categoryIds must be an array of category IDs.");
    }
    const faculty = await userService.updateFacultyCategories(id, categoryIds, creatorRole);
    return new ApiResponse(200, { faculty }, "Handled categories updated successfully").send(res);
});
// Aliases for clean user naming
export const getUsers = getFaculties;
export const createUser = createFaculty;
export const bulkCreateUsers = bulkCreateFaculty;
export const toggleUserStatus = toggleFacultyStatus;
export const updateUserCategories = updateFacultyCategories;
