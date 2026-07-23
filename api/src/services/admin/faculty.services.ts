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
  departmentId: z.string().min(1, "Department is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  handledCategoryIds: z.array(z.string()).optional().default([]),
});

export const updateFacultySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.nativeEnum(Role).optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  departmentId: z.string().min(1, "Department is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

// ============ Type Definitions ============

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;

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

  async getAllFaculty() {
    return await this.db.adminUser.findMany({
      include: {
        department: true,
        handledCategories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createFaculty(data: CreateFacultyInput, creatorRole: string) {
    const parsed = createFacultySchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { employeeId, name, email, role, phoneNumber, departmentId, username, password, handledCategoryIds } = parsed.data;

    // Role hierarchy validation
    if (!this.isAllowedToManageRole(creatorRole, role)) {
      throw new ApiError(403, `You are not authorized to create a user with the role of ${role}`);
    }

    // Check unique constraints
    const existing = await this.db.adminUser.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { employeeId }
        ]
      }
    });

    if (existing) {
      if (existing.email === email) throw new ApiError(409, "Email is already in use");
      if (existing.username === username) throw new ApiError(409, "Username is already in use");
      if (existing.employeeId === employeeId) throw new ApiError(409, "Employee ID is already in use");
    }

    const hash = await hashedPassword(password);

    return await this.db.adminUser.create({
      data: {
        employeeId,
        name,
        email,
        role,
        phoneNumber,
        departmentId,
        username,
        password: hash,
        handledCategoryIds: handledCategoryIds || [],
      },
      include: {
        department: true,
        handledCategories: true,
      }
    });
  }

  async toggleFacultyStatus(id: string, isActive: boolean, creatorRole: string) {
    const userToUpdate = await this.db.adminUser.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new ApiError(404, "Faculty member not found");
    }

    if (!this.isAllowedToManageRole(creatorRole, userToUpdate.role)) {
      throw new ApiError(403, `You are not authorized to update status for a user with role ${userToUpdate.role}`);
    }

    return await this.db.adminUser.update({
      where: { id },
      data: { isActive },
      include: {
        department: true,
        handledCategories: true,
      },
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
      include: {
        department: true,
        handledCategories: true,
      },
    });
  }

  async bulkCreateFaculty(members: Array<{
    name: string;
    email: string;
    role?: string;
    employeeId?: string;
    username?: string;
    phoneNumber?: string;
    departmentName?: string;
    departmentId?: string;
  }>, creatorRole: string) {
    if (!Array.isArray(members) || members.length === 0) {
      throw new ApiError(400, "No faculty entries provided for import.");
    }

    const departments = await this.db.department.findMany();
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

      let deptId = item.departmentId;
      if (!deptId && item.departmentName) {
        const found = departments.find(d => d.name.toLowerCase() === item.departmentName?.trim().toLowerCase());
        if (found) {
          deptId = found.id;
        }
      }

      const empId = item.employeeId?.trim() || `EMP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
      const uname = item.username?.trim().toLowerCase() || email.split("@")[0].replace(/[^a-z0-9]/g, "");

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
            departmentId: deptId || null,
            username: uname,
            password: hash,
            handledCategoryIds: [],
          },
          include: {
            department: true,
          }
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
}

export const facultyService = new FacultyService();

export const isAllowedToManageRole = facultyService.isAllowedToManageRole.bind(facultyService);
export const getAllFaculty = facultyService.getAllFaculty.bind(facultyService);
export const createFaculty = facultyService.createFaculty.bind(facultyService);
export const bulkCreateFaculty = facultyService.bulkCreateFaculty.bind(facultyService);
export const toggleFacultyStatus = facultyService.toggleFacultyStatus.bind(facultyService);
export const updateFacultyCategories = facultyService.updateFacultyCategories.bind(facultyService);
