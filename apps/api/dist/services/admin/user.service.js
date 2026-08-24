import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { Role } from "../../types/prisma.types";
import { sendFacultyCredentialsEmail } from "../mail.service";
// ============ Validation Schemas ============
export const createUserSchema = z
    .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(Role),
    phoneNumber: z.string().min(7, "Phone number is required"),
    companyName: z.string().optional(),
    location: z.string().optional(),
    password: z.string().optional().default(""),
    handledCategoryIds: z.array(z.string()).optional().default([]),
})
    .refine((data) => Boolean((data.name && data.name.trim().length > 0) ||
    (data.firstName && data.firstName.trim().length > 0) ||
    (data.lastName && data.lastName.trim().length > 0) ||
    (data.role === Role.EXTERNAL &&
        data.companyName &&
        data.companyName.trim().length > 0)), {
    message: "First name and last name, or full name, are required",
    path: ["firstName"],
});
export const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.nativeEnum(Role).optional(),
    companyName: z.string().optional(),
    location: z.string().optional(),
    phoneNumber: z.string().min(7, "Phone number is required").optional(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
});
// Alias for backward compatibility
export const createFacultySchema = createUserSchema;
export const updateFacultySchema = updateUserSchema;
const userSelect = {
    id: true,
    employeeId: true,
    name: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    phoneNumber: true,
    handledCategoryIds: true,
    questionPermissions: true,
    accountStatus: true,
    isActive: true,
    lastActiveAt: true,
    createdAt: true,
    updatedAt: true,
    handledCategories: {
        select: {
            id: true,
            name: true,
        },
    },
};
// ============ User Services ============
export class UserService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    isAllowedToManageRole(creatorRole, targetRole) {
        if (creatorRole === "SUPERADMIN")
            return true;
        if (creatorRole === "DEAN") {
            // DEAN can add new CO-ADMIN(TEAMLEAD), TEACHER, and EXTERNAL
            return (targetRole === "TEAMLEAD" ||
                targetRole === "TEACHER" ||
                targetRole === "EXTERNAL");
        }
        if (creatorRole === "TEAMLEAD") {
            // CO-ADMIN(TEAMLEAD) can add TEACHERS
            return targetRole === "TEACHER";
        }
        return false;
    }
    async getAllAdmin(filters) {
        const { search, status, cursor, limit } = filters || {};
        const where = {};
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { employeeId: { contains: q, mode: "insensitive" } },
            ];
        }
        if (status && status !== "ALL") {
            if (status === "ACTIVE") {
                where.accountStatus = "ACTIVE";
            }
            else if (status === "DEACTIVATED") {
                where.accountStatus = "DEACTIVATED";
            }
        }
        const allAdmins = await this.db.adminUser.findMany({
            where,
            select: userSelect,
            orderBy: {
                createdAt: "desc",
            },
        });
        if (!limit)
            return allAdmins;
        const limitNum = limit || 10;
        let startIndex = 0;
        if (cursor) {
            const cursorIndex = allAdmins.findIndex((item) => item.id === cursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }
        const sliced = allAdmins.slice(startIndex, startIndex + limitNum + 1);
        const hasNextPage = sliced.length > limitNum;
        if (hasNextPage)
            sliced.pop();
        const totalCount = await this.db.adminUser.count({ where });
        const nextCursor = hasNextPage && sliced.length > 0 ? sliced[sliced.length - 1].id : null;
        return {
            total: totalCount,
            admins: sliced,
            nextCursor,
            hasNextPage,
        };
    }
    async getAllFaculty(filters) {
        const { search, role, status, cursor, limit, requesterRole } = filters || {};
        const limitNum = limit || 10;
        // 1. If role is explicitly "EXTERNAL", query exclusively from ReviewCenterRepresentativeUser collection
        if (role === "EXTERNAL") {
            const repWhere = {};
            if (search && search.trim()) {
                const q = search.trim();
                repWhere.OR = [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { employeeId: { contains: q, mode: "insensitive" } },
                    { companyName: { contains: q, mode: "insensitive" } },
                ];
            }
            if (status && status !== "ALL") {
                if (status === "ACTIVE") {
                    repWhere.accountStatus = "ACTIVE";
                }
                else if (status === "DEACTIVATED") {
                    repWhere.accountStatus = "DEACTIVATED";
                }
            }
            const reps = await this.db.reviewCenterRepresentativeUser.findMany({
                where: repWhere,
                orderBy: { createdAt: "desc" },
            });
            const formattedReps = reps.map((r) => ({
                id: r.id,
                employeeId: r.employeeId,
                name: r.name,
                firstName: r.firstName,
                lastName: r.lastName,
                email: r.email,
                role: "EXTERNAL",
                phoneNumber: r.phonenumber,
                companyName: r.companyName,
                location: r.location || "Philippines",
                accountStatus: r.accountStatus || "ACTIVE",
                isActive: r.isActive !== false,
                lastActiveAt: r.lastActiveAt ? r.lastActiveAt.toISOString() : undefined,
                createdAt: r.createdAt.toISOString(),
                updatedAt: r.updatedAt.toISOString(),
            }));
            return this.paginateResults(formattedReps, limitNum, cursor);
        }
        // 2. Query internal AdminUser collection
        const where = {};
        if (search && search.trim()) {
            const q = search.trim().toLocaleLowerCase();
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { employeeId: { contains: q, mode: "insensitive" } },
            ];
        }
        // Role-based account visibility scoping rules:
        // 1. SUPERADMIN -> Returns DEAN, TEAMLEAD, and TEACHER accounts
        // 2. DEAN -> Returns both TEAMLEAD and TEACHER accounts
        // 3. TEAMLEAD -> Only returns TEACHER accounts
        if (requesterRole === "SUPERADMIN") {
            if (role && role !== "ALL") {
                where.role = role;
            }
            else {
                where.role = { in: ["DEAN", "TEAMLEAD", "TEACHER"] };
            }
        }
        else if (requesterRole === "DEAN") {
            if (role && role !== "ALL" && ["TEAMLEAD", "TEACHER"].includes(role)) {
                where.role = role;
            }
            else {
                where.role = { in: ["TEAMLEAD", "TEACHER"] };
            }
        }
        else if (requesterRole === "TEAMLEAD") {
            where.role = "TEACHER";
        }
        else if (role && role !== "ALL") {
            where.role = role;
        }
        if (status && status !== "ALL") {
            if (status === "ACTIVE") {
                where.accountStatus = "ACTIVE";
            }
            else if (status === "DEACTIVATED") {
                where.accountStatus = "DEACTIVATED";
            }
        }
        const allFaculties = await this.db.adminUser.findMany({
            where,
            select: userSelect,
            orderBy: {
                createdAt: "desc",
            },
        });
        let combinedList = allFaculties.map((f) => ({
            ...f,
            accountStatus: f.accountStatus || "ACTIVE",
            isActive: f.isActive !== false,
            lastActiveAt: f.lastActiveAt ? f.lastActiveAt.toISOString() : undefined,
            createdAt: f.createdAt
                ? f.createdAt.toISOString()
                : new Date().toISOString(),
        }));
        // If role is "ALL" and requester is SUPERADMIN or DEAN, also fetch from ReviewCenterRepresentativeUser
        if ((role === "ALL" || !role) &&
            (requesterRole === "SUPERADMIN" || requesterRole === "DEAN")) {
            const repWhere = {};
            if (search && search.trim()) {
                const q = search.trim();
                repWhere.OR = [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { employeeId: { contains: q, mode: "insensitive" } },
                    { companyName: { contains: q, mode: "insensitive" } },
                ];
            }
            if (status && status !== "ALL") {
                if (status === "ACTIVE") {
                    repWhere.accountStatus = "ACTIVE";
                }
                else if (status === "DEACTIVATED") {
                    repWhere.accountStatus = "DEACTIVATED";
                }
            }
            const reps = await this.db.reviewCenterRepresentativeUser.findMany({
                where: repWhere,
                orderBy: { createdAt: "desc" },
            });
            const formattedReps = reps.map((r) => ({
                id: r.id,
                employeeId: r.employeeId,
                name: r.name,
                firstName: r.firstName,
                lastName: r.lastName,
                email: r.email,
                role: "EXTERNAL",
                phoneNumber: r.phonenumber,
                companyName: r.companyName,
                location: r.location || "Philippines",
                accountStatus: r.accountStatus || "ACTIVE",
                isActive: r.isActive !== false,
                lastActiveAt: r.lastActiveAt ? r.lastActiveAt.toISOString() : undefined,
                createdAt: r.createdAt.toISOString(),
                updatedAt: r.updatedAt.toISOString(),
            }));
            combinedList = [...combinedList, ...formattedReps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return this.paginateResults(combinedList, limitNum, cursor);
    }
    paginateResults(items, limitNum, cursor) {
        let startIndex = 0;
        if (cursor) {
            const cursorIndex = items.findIndex((item) => item.id === cursor);
            if (cursorIndex !== -1) {
                startIndex = cursorIndex + 1;
            }
        }
        const sliced = items.slice(startIndex, startIndex + limitNum + 1);
        const hasNextPage = sliced.length > limitNum;
        if (hasNextPage)
            sliced.pop();
        const nextCursor = hasNextPage && sliced.length > 0 ? sliced[sliced.length - 1].id : null;
        return {
            total: items.length,
            faculties: sliced,
            nextCursor,
            hasNextPage,
        };
    }
    resolveNameParts(rawName, rawFirst, rawLast) {
        let firstName = rawFirst?.trim() || "";
        let lastName = rawLast?.trim() || "";
        let name = rawName?.trim() || "";
        if (!name && (firstName || lastName)) {
            name = [firstName, lastName].filter(Boolean).join(" ").trim();
        }
        else if (name && !firstName && !lastName) {
            const parts = name.split(" ");
            firstName = parts[0] || "";
            lastName = parts.slice(1).join(" ") || "";
        }
        else if (firstName && lastName && !name) {
            name = `${firstName} ${lastName}`.trim();
        }
        return { name, firstName, lastName };
    }
    async createFaculty(data, creatorRole) {
        const parsed = createUserSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { employeeId, name: rawName, firstName: rawFirst, lastName: rawLast, email, role, phoneNumber, companyName, location, password, handledCategoryIds, } = parsed.data;
        const { name, firstName, lastName } = this.resolveNameParts(rawName, rawFirst, rawLast);
        // Role hierarchy validation
        if (!this.isAllowedToManageRole(creatorRole, role)) {
            throw new ApiError(403, `You are not authorized to create a user with the role of ${role}`);
        }
        // If role is EXTERNAL, save into ReviewCenterRepresentativeUser collection
        if (role === Role.EXTERNAL) {
            if (!companyName || !companyName.trim()) {
                throw new ApiError(400, "Review Center / Company name is required for external accounts.");
            }
            // Check unique constraints in ReviewCenterRepresentativeUser collection
            const existingRep = await this.db.reviewCenterRepresentativeUser.findFirst({
                where: {
                    OR: [{ email }, { employeeId }],
                },
            });
            if (existingRep) {
                if (existingRep.email === email)
                    throw new ApiError(409, "Email is already registered for another review center account.");
                if (existingRep.employeeId === employeeId)
                    throw new ApiError(409, "Partner / Employee ID is already in use.");
            }
            // Find or create ReviewCenter organization entity
            let reviewCenter = await this.db.reviewCenter.findFirst({
                where: { name: { equals: companyName.trim(), mode: "insensitive" } },
            });
            if (!reviewCenter) {
                const centerCode = `RC-${companyName
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(0, 6)
                    .toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
                reviewCenter = await this.db.reviewCenter.create({
                    data: {
                        name: companyName.trim(),
                        code: centerCode,
                        location: location?.trim() || "Philippines",
                        contactEmail: email,
                        contactPhone: phoneNumber,
                        isActive: true,
                    },
                });
            }
            const tempPassword = password && password.trim().length >= 6
                ? password.trim()
                : `BQ-RC-${Math.random().toString(36).slice(-6).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
            const hash = await hashedPassword(tempPassword);
            const newRep = await this.db.reviewCenterRepresentativeUser.create({
                data: {
                    employeeId,
                    name: name || `${companyName} Representative`,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    email,
                    companyName: companyName.trim(),
                    phonenumber: phoneNumber,
                    password: hash,
                    location: location?.trim() || "Philippines",
                    accountStatus: "ACTIVE",
                    isActive: true,
                    reviewCenterId: reviewCenter.id,
                },
            });
            // Send welcome credentials email
            sendFacultyCredentialsEmail({
                toEmail: email,
                name: newRep.name,
                password: tempPassword,
                role: "EXTERNAL",
                employeeId,
            }).catch((err) => console.error("[createFaculty EXTERNAL] Email send error:", err));
            return {
                id: newRep.id,
                employeeId: newRep.employeeId,
                name: newRep.name,
                firstName: newRep.firstName,
                lastName: newRep.lastName,
                email: newRep.email,
                role: "EXTERNAL",
                phoneNumber: newRep.phonenumber,
                companyName: newRep.companyName,
                location: newRep.location,
                accountStatus: newRep.accountStatus || newRep.account_status || "ACTIVE",
                isActive: newRep.isActive !== false,
                createdAt: newRep.createdAt,
                updatedAt: newRep.updatedAt,
            };
        }
        // Otherwise, internal user saved into AdminUser collection
        const existing = await this.db.adminUser.findFirst({
            where: {
                OR: [{ email }, { employeeId }],
            },
        });
        if (existing) {
            if (existing.email === email)
                throw new ApiError(409, "Email is already in use");
            if (existing.employeeId === employeeId)
                throw new ApiError(409, "Employee ID is already in use");
        }
        // Auto-generate temporary password if not explicitly supplied
        const tempPassword = password && password.trim().length >= 6
            ? password.trim()
            : `BQ-${Math.random().toString(36).slice(-6).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
        const hash = await hashedPassword(tempPassword);
        const newFaculty = await this.db.adminUser.create({
            data: {
                employeeId,
                name: name || "Faculty Member",
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email,
                role,
                phoneNumber,
                password: hash,
                accountStatus: "ACTIVE",
                isActive: true,
                handledCategoryIds: handledCategoryIds || [],
            },
            select: userSelect,
        });
        // Send welcome credentials email containing the temporary password
        sendFacultyCredentialsEmail({
            toEmail: email,
            name,
            password: tempPassword,
            role,
            employeeId,
        }).catch((err) => console.error("[createFaculty] Email send error:", err));
        return newFaculty;
    }
    async toggleFacultyStatus(id, nextStatusInput, creatorRole) {
        const isActivating = typeof nextStatusInput === "boolean"
            ? nextStatusInput
            : nextStatusInput === "ACTIVE" || nextStatusInput !== "DEACTIVATED";
        const nextAccountStatus = isActivating ? "ACTIVE" : "DEACTIVATED";
        let userToUpdate = await this.db.adminUser.findUnique({
            where: { id },
        });
        let isExternal = false;
        if (!userToUpdate) {
            const repUser = await this.db.reviewCenterRepresentativeUser.findUnique({
                where: { id },
            });
            if (repUser) {
                isExternal = true;
                userToUpdate = {
                    ...repUser,
                    role: "EXTERNAL",
                };
            }
        }
        if (!userToUpdate) {
            throw new ApiError(404, "User account not found");
        }
        if ((userToUpdate.role === "SUPERADMIN" ||
            userToUpdate.employeeId === "SA-0001") &&
            !isActivating) {
            throw new ApiError(400, "The primary Super Admin account is system-protected and cannot be deactivated or deleted.");
        }
        if (!this.isAllowedToManageRole(creatorRole, userToUpdate.role)) {
            throw new ApiError(403, `You are not authorized to update status for a user with role ${userToUpdate.role}`);
        }
        if (isExternal) {
            const updatedRep = await this.db.reviewCenterRepresentativeUser.update({
                where: { id },
                data: {
                    accountStatus: nextAccountStatus,
                    account_status: nextAccountStatus,
                    isActive: isActivating,
                },
            });
            return {
                id: updatedRep.id,
                employeeId: updatedRep.employeeId,
                name: updatedRep.name,
                firstName: updatedRep.firstName,
                lastName: updatedRep.lastName,
                email: updatedRep.email,
                role: "EXTERNAL",
                phoneNumber: updatedRep.phonenumber,
                companyName: updatedRep.companyName,
                location: updatedRep.location,
                accountStatus: updatedRep.accountStatus || updatedRep.account_status || nextAccountStatus,
                isActive: updatedRep.isActive !== false,
                createdAt: updatedRep.createdAt,
                updatedAt: updatedRep.updatedAt,
            };
        }
        const updatedAdmin = await this.db.adminUser.update({
            where: { id },
            data: {
                accountStatus: nextAccountStatus,
                isActive: isActivating,
            },
            select: userSelect,
        });
        return {
            ...updatedAdmin,
            accountStatus: updatedAdmin.accountStatus || nextAccountStatus,
        };
    }
    async updateFacultyCategories(id, categoryIds, creatorRole) {
        // Strictly restrict updating handled categories to DEAN and SUPERADMIN
        if (creatorRole !== "DEAN" && creatorRole !== "SUPERADMIN") {
            throw new ApiError(403, "Only Deans and Super Administrators can manage handled categories.");
        }
        const userToUpdate = await this.db.adminUser.findUnique({
            where: { id },
        });
        if (!userToUpdate) {
            throw new ApiError(404, "Faculty member not found");
        }
        const previousCategoryIds = userToUpdate.handledCategoryIds || [];
        const removedCategoryIds = previousCategoryIds.filter((cid) => !categoryIds.includes(cid));
        const addedCategoryIds = categoryIds.filter((cid) => !previousCategoryIds.includes(cid));
        for (const cid of removedCategoryIds) {
            const cat = await this.db.category.findUnique({
                where: { id: cid },
                select: { handlerIds: true },
            });
            if (cat) {
                const nextHandlers = (cat.handlerIds || []).filter((uid) => uid !== id);
                await this.db.category.update({
                    where: { id: cid },
                    data: { handlerIds: nextHandlers },
                });
            }
        }
        for (const cid of addedCategoryIds) {
            const cat = await this.db.category.findUnique({
                where: { id: cid },
                select: { handlerIds: true },
            });
            if (cat) {
                const currentHandlers = cat.handlerIds || [];
                if (!currentHandlers.includes(id)) {
                    await this.db.category.update({
                        where: { id: cid },
                        data: { handlerIds: [...currentHandlers, id] },
                    });
                }
            }
        }
        return await this.db.adminUser.update({
            where: { id },
            data: {
                handledCategoryIds: categoryIds,
            },
            select: userSelect,
        });
    }
    async bulkCreateFaculty(members, creatorRole) {
        if (!Array.isArray(members) || members.length === 0) {
            throw new ApiError(400, "No faculty entries provided for import.");
        }
        const createdMembers = [];
        const errors = [];
        for (let i = 0; i < members.length; i++) {
            const item = members[i];
            const { name, firstName, lastName } = this.resolveNameParts(item.name, item.firstName, item.lastName);
            const email = item.email?.trim().toLowerCase();
            const targetRole = (item.role?.trim().toUpperCase() ||
                "TEACHER");
            if (!name || !email) {
                errors.push({
                    email: email || "unknown",
                    name: name || "unknown",
                    error: "Name and Email are required fields.",
                });
                continue;
            }
            if (!this.isAllowedToManageRole(creatorRole, targetRole)) {
                errors.push({
                    email,
                    name,
                    error: `Unauthorized to assign role: ${targetRole}`,
                });
                continue;
            }
            const empId = item.employeeId?.trim() ||
                `EMP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
            const existing = await this.db.adminUser.findFirst({
                where: {
                    OR: [{ email }, { employeeId: empId }],
                },
            });
            if (existing) {
                errors.push({
                    email,
                    name,
                    error: "Account already exists (email or employee ID collision).",
                });
                continue;
            }
            const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase() +
                Math.random().toString(36).substring(2, 6).toUpperCase();
            const tempPassword = `BQ-${randomChars}`;
            try {
                const hash = await hashedPassword(tempPassword);
                const newUser = await this.db.adminUser.create({
                    data: {
                        employeeId: empId,
                        name,
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        email,
                        role: targetRole,
                        phoneNumber: item.phoneNumber?.trim() || "N/A",
                        password: hash,
                        handledCategoryIds: [],
                    },
                });
                sendFacultyCredentialsEmail({
                    toEmail: email,
                    name,
                    password: tempPassword,
                    role: targetRole,
                    employeeId: empId,
                }).catch((err) => console.error("[BulkImport] Email send error:", err));
                const { password, ...sanitized } = newUser;
                createdMembers.push(sanitized);
            }
            catch (err) {
                errors.push({
                    email,
                    name,
                    error: err.message || "Failed to create account",
                });
            }
        }
        return {
            totalProcessed: members.length,
            createdCount: createdMembers.length,
            skippedCount: errors.length,
            createdMembers,
            errors,
        };
    }
}
export const userService = new UserService();
export const facultyService = userService;
export const FacultyService = UserService;
export const isAllowedToManageRole = userService.isAllowedToManageRole.bind(userService);
export const getAllFaculty = userService.getAllFaculty.bind(userService);
export const getAllUsers = getAllFaculty;
export const createFaculty = userService.createFaculty.bind(userService);
export const createUser = createFaculty;
export const bulkCreateFaculty = userService.bulkCreateFaculty.bind(userService);
export const bulkCreateUsers = bulkCreateFaculty;
export const toggleFacultyStatus = userService.toggleFacultyStatus.bind(userService);
export const toggleUserStatus = toggleFacultyStatus;
export const updateFacultyCategories = userService.updateFacultyCategories.bind(userService);
export const updateUserCategories = updateFacultyCategories;
