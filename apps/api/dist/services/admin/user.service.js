import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { Role } from "../../types/prisma.types";
import { sendFacultyCredentialsEmail, sendReviewCenterCredentialsEmail, } from "../mail.service";
// ============ Validation Schemas ============
export const normalizeRole = (r) => {
    const s = String(r || "")
        .toUpperCase()
        .trim();
    if (s === "SUPERADMIN")
        return Role.SUPERADMIN;
    if (s === "DEAN")
        return Role.DEAN;
    if (s === "TEAMLEAD")
        return Role.TEAMLEAD;
    if (s === "TEACHER")
        return Role.TEACHER;
    if (s === "REVIEWCENTER" || s === "EXTERNAL")
        return Role.REVIEWCENTER;
    return Role.TEACHER;
};
export const createUserSchema = z
    .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    role: z
        .union([z.nativeEnum(Role), z.string()])
        .transform((val) => normalizeRole(val)),
    phoneNumber: z.string().min(7, "Phone number is required"),
    companyName: z.string().optional(),
    location: z.string().optional(),
    password: z.string().optional().default(""),
    handledCategoryIds: z.array(z.string()).optional().default([]),
    handledSubjectIds: z.array(z.string()).optional().default([]),
})
    .refine((data) => Boolean((data.name && data.name.trim().length > 0) ||
    (data.firstName && data.firstName.trim().length > 0) ||
    (data.lastName && data.lastName.trim().length > 0) ||
    ((data.role === Role.EXTERNAL ||
        data.role === Role.REVIEWCENTER) &&
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
    role: z
        .union([z.nativeEnum(Role), z.string()])
        .transform((val) => normalizeRole(val))
        .optional(),
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
    handledSubjectIds: true,
    questionPermissions: true,
    accountStatus: true,
    isActive: true,
    lastActiveAt: true,
    createdAt: true,
    updatedAt: true,
    handledSubjects: {
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
        const cRole = normalizeRole(creatorRole);
        const tRole = normalizeRole(targetRole);
        if (cRole === Role.SUPERADMIN)
            return true;
        if (cRole === Role.DEAN) {
            return (tRole === Role.TEAMLEAD ||
                tRole === Role.TEACHER ||
                tRole === Role.EXTERNAL ||
                tRole === Role.REVIEWCENTER);
        }
        if (cRole === Role.TEAMLEAD) {
            return tRole === Role.TEACHER;
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
    async getAllUsers(filters) {
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
        const normReq = requesterRole
            ? String(requesterRole).toUpperCase().trim()
            : "";
        const normRole = role && role !== "ALL" ? normalizeRole(role) : undefined;
        if (normReq === "SUPERADMIN") {
            if (normRole &&
                normRole !== Role.REVIEWCENTER &&
                normRole !== Role.EXTERNAL) {
                where.role = normRole;
            }
            else {
                where.role = { in: [Role.DEAN, Role.TEAMLEAD, Role.TEACHER] };
            }
        }
        else if (normReq === "DEAN") {
            if (normRole && [Role.TEAMLEAD, Role.TEACHER].includes(normRole)) {
                where.role = normRole;
            }
            else {
                where.role = { in: [Role.TEAMLEAD, Role.TEACHER] };
            }
        }
        else if (normReq === "TEAMLEAD") {
            where.role = Role.TEACHER;
        }
        else if (normRole &&
            normRole !== Role.REVIEWCENTER &&
            normRole !== Role.EXTERNAL) {
            where.role = normRole;
        }
        if (status && status !== "ALL") {
            if (status === "ACTIVE") {
                where.accountStatus = "ACTIVE";
            }
            else if (status === "DEACTIVATED") {
                where.accountStatus = "DEACTIVATED";
            }
        }
        const allUsers = await this.db.adminUser.findMany({
            where,
            select: userSelect,
            orderBy: {
                createdAt: "desc",
            },
        });
        let combinedList = allUsers.map((u) => ({
            ...u,
            handledCategoryIds: u.handledSubjectIds,
            handledCategories: u.handledSubjects,
            accountStatus: u.accountStatus || "ACTIVE",
            isActive: u.isActive !== false,
            lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : undefined,
            createdAt: u.createdAt
                ? u.createdAt.toISOString()
                : new Date().toISOString(),
        }));
        // If role is "ALL" or REVIEWCENTER/EXTERNAL and requester is SUPERADMIN or DEAN, also fetch from ReviewCenterRepresentativeUser
        if ((role === "ALL" ||
            !role ||
            normRole === Role.REVIEWCENTER ||
            normRole === Role.EXTERNAL ||
            role === "EXTERNAL" ||
            role === "REVIEWCENTER") &&
            (normReq === "SUPERADMIN" || normReq === "DEAN")) {
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
                role: Role.REVIEWCENTER,
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
    async getAllFaculty(filters) {
        return this.getAllUsers(filters);
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
            users: sliced,
            faculties: sliced,
            nextCursor,
            hasNextPage,
        };
    }
    resolveNameParts(rawName, rawFirst, rawLast, rawMiddle) {
        let firstName = rawFirst?.trim() || "";
        const middleName = rawMiddle?.trim() || "";
        let lastName = rawLast?.trim() || "";
        let name = rawName?.trim() || "";
        if (!name && (firstName || lastName)) {
            name = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
        }
        else if (name && !firstName && !lastName) {
            const parts = name.split(/\s+/);
            if (parts.length === 1) {
                firstName = parts[0] || "";
            }
            else if (parts.length === 2) {
                firstName = parts[0] || "";
                lastName = parts[1] || "";
            }
            else {
                firstName = parts[0] || "";
                lastName = parts.slice(1).join(" ") || "";
            }
        }
        else if (firstName && lastName && !name) {
            name = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
        }
        return { name, firstName, lastName };
    }
    async createUser(data, creatorRole) {
        const parsed = createUserSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { employeeId, name: rawName, firstName: rawFirst, lastName: rawLast, email, role, phoneNumber, companyName, location, password, handledCategoryIds, handledSubjectIds, } = parsed.data;
        const { name, firstName, lastName } = this.resolveNameParts(rawName, rawFirst, rawLast);
        // Role hierarchy validation
        if (!this.isAllowedToManageRole(creatorRole, role)) {
            throw new ApiError(403, `You are not authorized to create a user with the role of ${role}`);
        }
        // If role is EXTERNAL / REVIEWCENTER, save into ReviewCenterRepresentativeUser collection
        if (role === Role.EXTERNAL || role === Role.REVIEWCENTER) {
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
            // Find or create ReviewCenter organization entity safely
            const cleanCompany = companyName.trim();
            let reviewCenter = await this.db.reviewCenter.findFirst({
                where: { name: cleanCompany },
            });
            if (!reviewCenter) {
                const randSuffix = Math.floor(1000 + Math.random() * 9000);
                const centerCode = `RC-${cleanCompany
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(0, 6)
                    .toUpperCase() || "CTR"}-${randSuffix}`;
                try {
                    reviewCenter = await this.db.reviewCenter.create({
                        data: {
                            name: cleanCompany,
                            code: centerCode,
                            location: location?.trim() || "Philippines",
                            contactEmail: email,
                            contactPhone: phoneNumber,
                            isActive: true,
                        },
                    });
                }
                catch {
                    reviewCenter = await this.db.reviewCenter.findFirst({
                        where: { name: cleanCompany },
                    });
                }
            }
            const tempPassword = password && password.trim().length >= 6
                ? password.trim()
                : `BQ-RC-${Math.random().toString(36).slice(-6).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
            const hash = await hashedPassword(tempPassword);
            const newRep = await this.db.reviewCenterRepresentativeUser.create({
                data: {
                    employeeId,
                    name: name || `${cleanCompany} Representative`,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    email,
                    companyName: cleanCompany,
                    phonenumber: phoneNumber,
                    password: hash,
                    location: location?.trim() || "Philippines",
                    accountStatus: "ACTIVE",
                    isActive: true,
                    reviewCenterId: reviewCenter?.id || undefined,
                },
            });
            // Send welcome credentials email tailored to Review Center partners
            sendReviewCenterCredentialsEmail({
                toEmail: email,
                name: newRep.name,
                password: tempPassword,
                companyName: cleanCompany,
                employeeId,
            }).catch((err) => console.error("[createUser EXTERNAL] Email send error:", err));
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
                accountStatus: newRep.accountStatus ||
                    newRep.account_status ||
                    "ACTIVE",
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
        const newUser = await this.db.adminUser.create({
            data: {
                employeeId,
                name: name || "User",
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email,
                role: role,
                phoneNumber,
                password: hash,
                accountStatus: "ACTIVE",
                isActive: true,
                handledSubjectIds: String(role).toUpperCase() === "REVIEWCENTER" ||
                    String(role).toUpperCase() === "EXTERNAL"
                    ? []
                    : handledSubjectIds || handledCategoryIds || [],
            },
            select: userSelect,
        });
        // Send welcome credentials email containing the temporary password
        sendFacultyCredentialsEmail({
            toEmail: email,
            name,
            password: tempPassword,
            role: String(role),
            employeeId,
        }).catch((err) => console.error("[createUser] Email send error:", err));
        return newUser;
    }
    async createFaculty(data, creatorRole) {
        return this.createUser(data, creatorRole);
    }
    async toggleUserStatus(id, nextStatusInput, creatorRole) {
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
                accountStatus: updatedRep.accountStatus ||
                    updatedRep.account_status ||
                    nextAccountStatus,
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
    async toggleFacultyStatus(id, nextStatusInput, creatorRole) {
        return this.toggleUserStatus(id, nextStatusInput, creatorRole);
    }
    async updateUserCategories(id, categoryIds, creatorRole) {
        // Strictly restrict updating handled categories to DEAN and SUPERADMIN
        if (creatorRole !== "DEAN" && creatorRole !== "SUPERADMIN") {
            throw new ApiError(403, "Only Deans and Super Administrators can manage handled categories.");
        }
        const userToUpdate = await this.db.adminUser.findUnique({
            where: { id },
        });
        if (!userToUpdate) {
            const rep = await this.db.reviewCenterRepresentativeUser.findUnique({
                where: { id },
            });
            if (rep) {
                throw new ApiError(400, "External accounts (Review Center) cannot be assigned to handle subjects.");
            }
            throw new ApiError(404, "User not found");
        }
        if (userToUpdate.role === "REVIEWCENTER" ||
            userToUpdate.role === "EXTERNAL") {
            throw new ApiError(400, "External accounts (Review Center) cannot be assigned to handle subjects.");
        }
        const subjectModel = this.db.subject || this.db.category;
        const previousCategoryIds = userToUpdate.handledSubjectIds ||
            userToUpdate.handledCategoryIds ||
            [];
        const removedCategoryIds = previousCategoryIds.filter((cid) => !categoryIds.includes(cid));
        const addedCategoryIds = categoryIds.filter((cid) => !previousCategoryIds.includes(cid));
        for (const cid of removedCategoryIds) {
            const cat = await subjectModel.findUnique({
                where: { id: cid },
                select: { handlerIds: true },
            });
            if (cat) {
                const nextHandlers = (cat.handlerIds || []).filter((uid) => uid !== id);
                await subjectModel.update({
                    where: { id: cid },
                    data: { handlerIds: nextHandlers },
                });
            }
        }
        for (const cid of addedCategoryIds) {
            const cat = await subjectModel.findUnique({
                where: { id: cid },
                select: { handlerIds: true },
            });
            if (cat) {
                const currentHandlers = cat.handlerIds || [];
                if (!currentHandlers.includes(id)) {
                    await subjectModel.update({
                        where: { id: cid },
                        data: { handlerIds: [...currentHandlers, id] },
                    });
                }
            }
        }
        return await this.db.adminUser.update({
            where: { id },
            data: {
                handledSubjectIds: categoryIds,
            },
            select: userSelect,
        });
    }
    async updateUserSubjects(id, subjectIds, creatorRole) {
        return this.updateUserCategories(id, subjectIds, creatorRole);
    }
    async updateFacultyCategories(id, categoryIds, creatorRole) {
        return this.updateUserCategories(id, categoryIds, creatorRole);
    }
    async updateFacultySubjects(id, subjectIds, creatorRole) {
        return this.updateUserCategories(id, subjectIds, creatorRole);
    }
    async bulkCreateUsers(members, creatorRole) {
        if (!Array.isArray(members) || members.length === 0) {
            throw new ApiError(400, "No user entries provided for import.");
        }
        const createdMembers = [];
        const errors = [];
        for (let i = 0; i < members.length; i++) {
            const item = members[i];
            const { name, firstName, lastName } = this.resolveNameParts(item.name, item.firstName, item.lastName, item.middleName);
            const email = item.email?.trim().toLowerCase();
            const rawRole = item.role?.trim().toUpperCase();
            const isExternal = rawRole === "REVIEWCENTER" ||
                rawRole === "EXTERNAL" ||
                Boolean(item.companyName && item.companyName.trim().length > 0);
            const targetRole = isExternal
                ? Role.REVIEWCENTER
                : (rawRole || Role.TEACHER);
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
            if (isExternal) {
                const compName = item.companyName?.trim() || `${name}'s Review Center`;
                const partnerId = item.employeeId?.trim() ||
                    `RC-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
                const existingRep = await this.db.reviewCenterRepresentativeUser.findFirst({
                    where: {
                        OR: [{ email }, { employeeId: partnerId }],
                    },
                });
                if (existingRep) {
                    errors.push({
                        email,
                        name,
                        error: "Review center account already exists (email or partner ID collision).",
                    });
                    continue;
                }
                try {
                    let reviewCenter = await this.db.reviewCenter.findFirst({
                        where: { name: compName },
                    });
                    if (!reviewCenter) {
                        const randSuffix = Math.floor(1000 + Math.random() * 9000);
                        const centerCode = `RC-${compName
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .slice(0, 6)
                            .toUpperCase() || "CTR"}-${randSuffix}`;
                        try {
                            reviewCenter = await this.db.reviewCenter.create({
                                data: {
                                    name: compName,
                                    code: centerCode,
                                    location: item.location?.trim() || "Philippines",
                                    contactEmail: email,
                                    contactPhone: item.phoneNumber?.trim() || "N/A",
                                    isActive: true,
                                },
                            });
                        }
                        catch {
                            reviewCenter = await this.db.reviewCenter.findFirst({
                                where: { name: compName },
                            });
                        }
                    }
                    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase() +
                        Math.random().toString(36).substring(2, 6).toUpperCase();
                    const tempPassword = `BQ-RC-${randomChars}`;
                    const hash = await hashedPassword(tempPassword);
                    const newRep = await this.db.reviewCenterRepresentativeUser.create({
                        data: {
                            employeeId: partnerId,
                            name: name || `${compName} Representative`,
                            firstName: firstName || undefined,
                            lastName: lastName || undefined,
                            email,
                            companyName: compName,
                            phonenumber: item.phoneNumber?.trim() || "N/A",
                            password: hash,
                            location: item.location?.trim() || "Philippines",
                            accountStatus: "ACTIVE",
                            isActive: true,
                            reviewCenterId: reviewCenter?.id || undefined,
                        },
                    });
                    sendReviewCenterCredentialsEmail({
                        toEmail: email,
                        name: newRep.name,
                        password: tempPassword,
                        companyName: compName,
                        employeeId: partnerId,
                    }).catch((err) => console.error("[BulkImport EXTERNAL] Email send error:", err));
                    const { password, ...sanitized } = newRep;
                    createdMembers.push({
                        ...sanitized,
                        role: Role.REVIEWCENTER,
                    });
                }
                catch (err) {
                    errors.push({
                        email,
                        name,
                        error: err.message || "Failed to create review center account",
                    });
                }
            }
            else {
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
                            handledSubjectIds: [],
                            accountStatus: "ACTIVE",
                            isActive: true,
                        },
                    });
                    sendFacultyCredentialsEmail({
                        toEmail: email,
                        name,
                        password: tempPassword,
                        role: String(targetRole),
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
        }
        return {
            totalProcessed: members.length,
            createdCount: createdMembers.length,
            skippedCount: errors.length,
            createdMembers,
            createdUsers: createdMembers,
            errors,
        };
    }
    async bulkCreateFaculty(members, creatorRole) {
        return this.bulkCreateUsers(members, creatorRole);
    }
}
export const userService = new UserService();
export const facultyService = userService;
export const FacultyService = UserService;
export const isAllowedToManageRole = userService.isAllowedToManageRole.bind(userService);
export const getAllUsers = userService.getAllUsers.bind(userService);
export const getAllFaculty = getAllUsers;
export const createUser = userService.createUser.bind(userService);
export const createFaculty = createUser;
export const bulkCreateUsers = userService.bulkCreateUsers.bind(userService);
export const bulkCreateFaculty = bulkCreateUsers;
export const toggleUserStatus = userService.toggleUserStatus.bind(userService);
export const toggleFacultyStatus = toggleUserStatus;
export const updateUserCategories = userService.updateUserCategories.bind(userService);
export const updateUserSubjects = userService.updateUserSubjects.bind(userService);
export const updateFacultyCategories = updateUserCategories;
export const updateFacultySubjects = updateUserSubjects;
