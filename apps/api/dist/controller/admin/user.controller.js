import * as userService from "../../services/admin/user.service";
import { extractUserIdFromToken } from "../../utils/jwt.utils";
import prisma from "../../services/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { ensureSuperAdminExists } from "../../services/admin/bootstrap.service";
import { isSuperAdmin, getSuperAdminProfile } from "../../config/credentials";
export const me = asyncHandler(async (req, res) => {
    let token = req.cookies?.accessToken || req.cookies?.token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim();
        }
    }
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
            phoneNumber: true,
            avatarUrl: true,
            location: true,
            handledSubjectIds: true,
            handledSubjects: {
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
    const formattedUser = {
        ...user,
        handledCategoryIds: user.handledSubjectIds || [],
        handledCategories: user.handledSubjects || [],
        handledSubjectIds: user.handledSubjectIds || [],
        handledSubjects: user.handledSubjects || [],
    };
    return new ApiResponse(200, { user: formattedUser }, "User retrieved successfully").send(res);
});
export const getUsers = asyncHandler(async (req, res) => {
    const { search, role, status, cursor, limit, excludeExternal } = req.query;
    const requesterRole = req.user?.role;
    if (requesterRole === "TEACHER") {
        return new ApiResponse(200, {
            users: [],
            faculties: [],
            nextCursor: null,
            hasNextPage: false,
            total: 0,
        }, "User list not accessible for teacher role").send(res);
    }
    const result = await userService.getAllUsers({
        search: search,
        role: role,
        status: status,
        cursor: cursor,
        limit: limit ? parseInt(limit, 10) : undefined,
        requesterRole,
        excludeExternal: excludeExternal === "true" || excludeExternal === "1",
    });
    if (result && typeof result === "object" && ("users" in result || "faculties" in result)) {
        const userList = result.users ?? result.faculties ?? [];
        const sanitized = userList.map((u) => {
            const { password, ...rest } = u;
            return rest;
        });
        return new ApiResponse(200, {
            users: sanitized,
            faculties: sanitized,
            nextCursor: result.nextCursor,
            hasNextPage: result.hasNextPage,
            total: result.total ?? sanitized.length,
        }, "Users retrieved successfully").send(res);
    }
    const sanitized = result.map((u) => {
        const { password, ...rest } = u;
        return rest;
    });
    return new ApiResponse(200, { users: sanitized, faculties: sanitized }, "Users retrieved successfully").send(res);
});
export const getFaculties = getUsers;
export const createUser = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const created = await userService.createUser(req.body, creatorRole);
    // Strip password before returning
    const { password, ...user } = created;
    return new ApiResponse(201, { user, faculty: user }, "User created successfully").send(res);
});
export const createFaculty = createUser;
export const bulkCreateUsers = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const created = await userService.bulkCreateUsers(req.body.members, creatorRole);
    // Strip password before returning
    const { password, ...users } = created;
    return new ApiResponse(201, { users, faculty: users, faculties: users }, "Users created successfully").send(res);
});
export const bulkCreateFaculty = bulkCreateUsers;
export const bulkCreateUser = bulkCreateUsers;
export const toggleUserStatus = asyncHandler(async (req, res) => {
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
    const user = await userService.toggleUserStatus(id, nextStatus, creatorRole);
    return new ApiResponse(200, { user, faculty: user }, "User status updated successfully").send(res);
});
export const toggleFacultyStatus = toggleUserStatus;
export const getActiveDean = asyncHandler(async (_req, res) => {
    const activeDean = await userService.getActiveDean();
    return new ApiResponse(200, { activeDean }, "Active dean retrieved successfully").send(res);
});
export const updateUserSubjects = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    if (!creatorRole) {
        throw new ApiError(401, "Unauthorized");
    }
    const { id } = req.params;
    const { categoryIds, subjectIds } = req.body;
    const ids = subjectIds || categoryIds;
    if (!Array.isArray(ids)) {
        throw new ApiError(400, "subjectIds or categoryIds must be an array of IDs.");
    }
    const user = await userService.updateUserCategories(id, ids, creatorRole);
    return new ApiResponse(200, { user, faculty: user }, "Handled subjects updated successfully").send(res);
});
export const updateUserCategories = updateUserSubjects;
export const updateFacultyCategories = updateUserSubjects;
export const updateFacultySubjects = updateUserSubjects;
