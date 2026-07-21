import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { Role } from "../../../generated/prisma/enums";

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

    const { employeeId, name, email, role, phoneNumber, departmentId, username, password } = parsed.data;

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
      },
      include: {
        department: true,
      }
    });
  }

  async deleteFaculty(id: string, creatorRole: string) {
    const userToDelete = await this.db.adminUser.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      throw new ApiError(404, "Faculty member not found");
    }

    if (!this.isAllowedToManageRole(creatorRole, userToDelete.role)) {
      throw new ApiError(403, `You are not authorized to delete a user with the role of ${userToDelete.role}`);
    }

    return await this.db.adminUser.delete({
      where: { id },
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
      },
    });
  }
}

export const facultyService = new FacultyService();

export const isAllowedToManageRole = facultyService.isAllowedToManageRole.bind(facultyService);
export const getAllFaculty = facultyService.getAllFaculty.bind(facultyService);
export const createFaculty = facultyService.createFaculty.bind(facultyService);
export const deleteFaculty = facultyService.deleteFaculty.bind(facultyService);
export const toggleFacultyStatus = facultyService.toggleFacultyStatus.bind(facultyService);
