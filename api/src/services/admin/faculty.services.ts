import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { Role } from "../../../generated/prisma/enums";
import { sendFacultyCredentialsEmail } from "../mail.service";

// ============ Validation Schemas ============

export const createFacultySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  username: z.string().min(3, "Username must be at least 3 characters").optional().default(""),
  password: z.string().optional().default(""),
  handledCategoryIds: z.array(z.string()).optional().default([]),
});

export const updateFacultySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.nativeEnum(Role).optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

// ============ Type Definitions ============

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

const facultySelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  username: true,
  role: true,
  phoneNumber: true,
  handledCategoryIds: true,
  questionPermissions: true,
  isActive: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  handledCategories: {
    select: {
      id: true,
      name: true,
    },
  },
};

// ============ Faculty Services ============

export class FacultyService {
  constructor(private readonly db: typeof prisma = prisma) {}

  isAllowedToManageRole(creatorRole: string, targetRole: string): boolean {
    if (creatorRole === "SUPERADMIN") return true;
    if (creatorRole === "ADMIN") {
      // ADMIN can add new CO-ADMIN(TEAMLEAD) and TEACHER
      return targetRole === "TEAMLEAD" || targetRole === "TEACHER";
    }
    if (creatorRole === "TEAMLEAD") {
      // CO-ADMIN(TEAMLEAD) can add TEACHERS
      return targetRole === "TEACHER";
    }
    return false;
  }

  async getAllFaculty(filters?: {
    search?: string;
    role?: string;
    departmentId?: string;
    status?: string;
    cursor?: string;
    limit?: number;
  }) {
    const { search, role, departmentId, status, cursor, limit } = filters || {};

    const envSuperAdmin = {
      id: "superadmin-env-id",
      employeeId: process.env.SUPERADMIN_EMPLOYEE_ID || "SA-0001",
      email: process.env.SUPERADMIN_EMAIL || "superadmin@boardquest.edu.ph",
      username: process.env.SUPERADMIN_USERNAME || "superadmin",
      name: process.env.SUPERADMIN_NAME || "System Super Administrator",
      role: "SUPERADMIN",
      phoneNumber: "+63-2-9999-0000",
      location: "Main HQ",
      isActive: true,
      lastActiveAt: new Date(),
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date(),
      handledCategories: [],
    };

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { employeeId: { contains: q, mode: "insensitive" } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        where.isActive = true;
      } else if (status === "DEACTIVATED") {
        where.isActive = false;
      }
    }

    // Check if envSuperAdmin matches the filter criteria
    let matchesEnvSuperAdmin = true;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchSearch =
        envSuperAdmin.name.toLowerCase().includes(q) ||
        envSuperAdmin.email.toLowerCase().includes(q) ||
        envSuperAdmin.username.toLowerCase().includes(q) ||
        envSuperAdmin.employeeId.toLowerCase().includes(q);
      if (!matchSearch) matchesEnvSuperAdmin = false;
    }

    if (role && role !== "ALL" && envSuperAdmin.role !== role) {
      matchesEnvSuperAdmin = false;
    }

    if (status && status !== "ALL" && status !== "ACTIVE") {
      matchesEnvSuperAdmin = false;
    }

    const allFaculties = await this.db.adminUser.findMany({
      where,
      select: facultySelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    const fullList = matchesEnvSuperAdmin ? [envSuperAdmin, ...allFaculties] : allFaculties;

    if (!limit) return fullList;

    const limitNum = limit || 10;
    let startIndex = 0;

    if (cursor) {
      const cursorIndex = fullList.findIndex((item) => item.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const sliced = fullList.slice(startIndex, startIndex + limitNum + 1);
    const hasNextPage = sliced.length > limitNum;
    if (hasNextPage) sliced.pop();

    const totalCount = (await this.db.adminUser.count({ where })) + (matchesEnvSuperAdmin ? 1 : 0);
    const nextCursor = hasNextPage && sliced.length > 0 ? sliced[sliced.length - 1].id : null;

    return {
      total: totalCount,
      faculties: sliced,
      nextCursor,
      hasNextPage,
    };
  }


  async createFaculty(data: CreateFacultyInput, creatorRole: string) {
    const parsed = createFacultySchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { employeeId, name, email, role, phoneNumber, username, password, handledCategoryIds } = parsed.data;

    // Auto-generate username if omitted
    const finalUsername = username && username.trim().length >= 3
      ? username.trim()
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}.${Math.floor(100 + Math.random() * 900)}`;

    // Role hierarchy validation
    if (!this.isAllowedToManageRole(creatorRole, role)) {
      throw new ApiError(403, `You are not authorized to create a user with the role of ${role}`);
    }

    // Check unique constraints
    const existing = await this.db.adminUser.findFirst({
      where: {
        OR: [
          { email },
          { username: finalUsername },
          { employeeId }
        ]
      }
    });

    if (existing) {
      if (existing.email === email) throw new ApiError(409, "Email is already in use");
      if (existing.username === finalUsername) throw new ApiError(409, "Username is already in use");
      if (existing.employeeId === employeeId) throw new ApiError(409, "Employee ID is already in use");
    }

    // Auto-generate temporary password if not explicitly supplied
    const tempPassword = password && password.trim().length >= 6
      ? password.trim()
      : `BQ-${Math.random().toString(36).slice(-6).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    const hash = await hashedPassword(tempPassword);

    const newFaculty = await this.db.adminUser.create({
      data: {
        employeeId,
        name,
        email,
        role,
        phoneNumber,
        username: finalUsername,
        password: hash,
        handledCategoryIds: handledCategoryIds || [],
      },
      select: facultySelect,
    });

    // Send welcome credentials email containing the temporary password
    sendFacultyCredentialsEmail({
      toEmail: email,
      name,
      password: tempPassword,
      role,
      employeeId,
      username,
    }).catch(err => console.error("[createFaculty] Email send error:", err));

    return newFaculty;
  }

  async toggleFacultyStatus(id: string, isActive: boolean, creatorRole: string) {
    if (id === "superadmin-env-id") {
      throw new ApiError(
        400,
        "The Super Admin account is environment-configured and cannot be modified or deleted in the database."
      );
    }

    const userToUpdate = await this.db.adminUser.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new ApiError(404, "Faculty member not found");
    }

    if (
      (userToUpdate.role === "SUPERADMIN" ||
        userToUpdate.username === "superadmin" ||
        userToUpdate.employeeId === "SA-0001") &&
      !isActive
    ) {
      throw new ApiError(
        400,
        "The primary Super Admin account is system-protected and cannot be deactivated or deleted."
      );
    }

    if (!this.isAllowedToManageRole(creatorRole, userToUpdate.role)) {
      throw new ApiError(403, `You are not authorized to update status for a user with role ${userToUpdate.role}`);
    }

    return await this.db.adminUser.update({
      where: { id },
      data: { isActive },
      select: facultySelect,
    });
  }

  async updateFacultyCategories(id: string, categoryIds: string[], creatorRole: string) {
    // Strictly restrict updating handled categories to ADMIN and SUPERADMIN
    if (creatorRole !== "ADMIN" && creatorRole !== "SUPERADMIN") {
      throw new ApiError(403, "Only Administrators and Super Administrators can manage handled categories.");
    }

    const userToUpdate = await this.db.adminUser.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new ApiError(404, "Faculty member not found");
    }

    return await this.db.adminUser.update({
      where: { id },
      data: {
        handledCategoryIds: categoryIds,
      },
      select: facultySelect,
    });
  }

  async bulkCreateFaculty(members: Array<{
    name: string;
    email: string;
    role?: string;
    employeeId?: string;
    phoneNumber?: string;
    username?: string;
  }>, creatorRole: string) {
    if (!Array.isArray(members) || members.length === 0) {
      throw new ApiError(400, "No faculty entries provided for import.");
    }

    const createdMembers: any[] = [];
    const errors: Array<{ email: string; name: string; error: string }> = [];

    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      const name = item.name?.trim();
      const email = item.email?.trim().toLowerCase();
      const targetRole = (item.role?.trim().toUpperCase() || "TEACHER") as string;

      if (!name || !email) {
        errors.push({ email: email || "unknown", name: name || "unknown", error: "Name and Email are required fields." });
        continue;
      }

      if (!this.isAllowedToManageRole(creatorRole, targetRole)) {
        errors.push({ email, name, error: `Unauthorized to assign role: ${targetRole}` });
        continue;
      }

      const empId = item.employeeId?.trim() || `EMP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
      const uname = item.username?.trim().toLowerCase() || `${email.split("@")[0].replace(/[^a-z0-9]/g, "")}.${Math.floor(100 + Math.random() * 900)}`;

      const existing = await this.db.adminUser.findFirst({
        where: {
          OR: [
            { email },
            { username: uname },
            { employeeId: empId }
          ]
        }
      });

      if (existing) {
        errors.push({ email, name, error: "Account already exists (email, username, or employee ID collision)." });
        continue;
      }

      const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      const tempPassword = `BQ-${randomChars}`;

      try {
        const hash = await hashedPassword(tempPassword);
        const newUser = await this.db.adminUser.create({
          data: {
            employeeId: empId,
            name,
            email,
            role: targetRole as any,
            phoneNumber: item.phoneNumber?.trim() || "N/A",
            username: uname,
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
          username: uname,
        }).catch(err => console.error("[BulkImport] Email send error:", err));

        const { password, ...sanitized } = newUser;
        createdMembers.push(sanitized);
      } catch (err: any) {
        errors.push({ email, name, error: err.message || "Failed to create account" });
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

  async updateUserPermissions(
    id: string,
    data: { role?: string; questionPermissions?: any; handledCategoryIds?: string[] },
    requesterRole: string
  ) {
    if (requesterRole !== "ADMIN" && requesterRole !== "SUPERADMIN") {
      throw new ApiError(403, "Only Administrators and Super Administrators can manage user permissions.");
    }

    const userToUpdate = await this.db.adminUser.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new ApiError(404, "User not found.");
    }

    if (data.role && data.role === "SUPERADMIN" && requesterRole !== "SUPERADMIN") {
      throw new ApiError(403, "Only Super Administrators can assign the SUPERADMIN role.");
    }

    return await this.db.adminUser.update({
      where: { id },
      data: {
        ...(data.role && { role: data.role as Role }),
        ...(data.handledCategoryIds && { handledCategoryIds: data.handledCategoryIds }),
        ...(data.questionPermissions !== undefined && { questionPermissions: data.questionPermissions }),
      },
      select: facultySelect,
    });
  }

  async createPermissionRequest(
    userId: string,
    data: {
      targetQuestionId?: string;
      targetUserId?: string;
      requestedRole?: string;
      requestedPermissions?: any;
      requestedCategoryIds?: string[];
      reason: string;
    }
  ) {
    if (!data.reason || !data.reason.trim()) {
      throw new ApiError(400, "Reason for permission request is required.");
    }

    const existing = await this.db.permissionRequest.findFirst({
      where: {
        userId,
        status: "PENDING",
        targetQuestionId: data.targetQuestionId || null,
      },
    });

    if (existing) {
      throw new ApiError(400, "You already have a pending permission request for this item.");
    }

    return await this.db.permissionRequest.create({
      data: {
        userId,
        targetQuestionId: data.targetQuestionId || null,
        targetUserId: data.targetUserId || null,
        requestedRole: (data.requestedRole as Role) || null,
        requestedPermissions: data.requestedPermissions || null,
        requestedCategoryIds: data.requestedCategoryIds || [],
        reason: data.reason.trim(),
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async getPermissionRequests(filters?: { status?: string; userId?: string; targetUserId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.targetUserId) where.targetUserId = filters.targetUserId;

    return await this.db.permissionRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, employeeId: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
  }

  async reviewPermissionRequest(
    requestId: string,
    reviewerId: string,
    status: "APPROVED" | "DECLINED",
    reviewNote?: string,
    reviewerRole?: string
  ) {
    const request = await this.db.permissionRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new ApiError(404, "Permission request not found.");
    }

    if (request.status !== "PENDING") {
      throw new ApiError(400, `Permission request is already ${request.status.toLowerCase()}.`);
    }

    if (request.targetQuestionId) {
      const question = await this.db.question.findUnique({
        where: { id: request.targetQuestionId },
      });

      const isQuestionAuthor = question && question.authorId === reviewerId;
      const isAdmin = reviewerRole === "ADMIN" || reviewerRole === "SUPERADMIN";

      if (!isQuestionAuthor && !isAdmin) {
        throw new ApiError(403, "You do not have permission to approve this request.");
      }

      if (status === "APPROVED" && question) {
        const existingCollaborators = question.collaboratorIds || [];
        if (!existingCollaborators.includes(request.userId)) {
          await this.db.question.update({
            where: { id: request.targetQuestionId },
            data: {
              collaboratorIds: [...existingCollaborators, request.userId],
            },
          });
        }
      }
    } else {
      if (reviewerRole !== "ADMIN" && reviewerRole !== "SUPERADMIN") {
        throw new ApiError(403, "Only Administrators and Super Administrators can review global access requests.");
      }

      if (status === "APPROVED") {
        const updateData: any = {};
        if (request.requestedRole) updateData.role = request.requestedRole;
        if (request.requestedCategoryIds && request.requestedCategoryIds.length > 0) {
          updateData.handledCategoryIds = Array.from(
            new Set([...(request.user.handledCategoryIds || []), ...request.requestedCategoryIds])
          );
        }
        if (request.requestedPermissions) {
          updateData.questionPermissions = request.requestedPermissions;
        }

        if (Object.keys(updateData).length > 0) {
          await this.db.adminUser.update({
            where: { id: request.userId },
            data: updateData,
          });
        }
      }
    }

    return await this.db.permissionRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedById: reviewerId,
        reviewNote: reviewNote?.trim() || "",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });
  }
}

export const facultyService = new FacultyService();

export const isAllowedToManageRole = facultyService.isAllowedToManageRole.bind(facultyService);
export const getAllFaculty = facultyService.getAllFaculty.bind(facultyService);
export const createFaculty = facultyService.createFaculty.bind(facultyService);
export const bulkCreateFaculty = facultyService.bulkCreateFaculty.bind(facultyService);
export const toggleFacultyStatus = facultyService.toggleFacultyStatus.bind(facultyService);
export const updateFacultyCategories = facultyService.updateFacultyCategories.bind(facultyService);
export const updateUserPermissions = facultyService.updateUserPermissions.bind(facultyService);
export const createPermissionRequest = facultyService.createPermissionRequest.bind(facultyService);
export const getPermissionRequests = facultyService.getPermissionRequests.bind(facultyService);
export const reviewPermissionRequest = facultyService.reviewPermissionRequest.bind(facultyService);
