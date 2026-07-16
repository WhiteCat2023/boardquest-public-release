import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

// ============ Validation Schemas ============

export const createNewDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

export const updateDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    departmentId: z.string().min(1, "Department ID is required"),
});

// ============ Type Definitions ============

export type CreateNewDepartmentInput = z.infer<typeof createNewDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

// ============ Department Services ============

export class DepartmentService {
  constructor(private readonly db: typeof prisma = prisma) {}

  async createNewDepartment(data: CreateNewDepartmentInput) {
    const parsed = createNewDepartmentSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, authorId } = parsed.data;

    const existingDepartment = await this.db.department.findUnique({
        where: { name },
    });

    if (existingDepartment) {
        throw new ApiError(400, "Department with this name already exists");
    }

    const newDepartment = await this.db.department.create({
        data: {
            name: name.toLowerCase().trim(),
            authorId,
        },
    });

    return newDepartment;
  }

  async getAllDepartments() {
    const departments = await this.db.department.findMany({
        include: {
            members: true
        },
    }); 
    return departments;
  }

  async getDepartmentById(departmentId: string) {
    const department = await this.db.department.findUnique({
        where: { id: departmentId },
        include: {
            members: true
        },
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    return department;
  }

  async updateDepartment(data: UpdateDepartmentInput) {
    const parsed = updateDepartmentSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, departmentId } = parsed.data;

    const existingDepartment = await this.db.department.findUnique({
        where: { id: departmentId },
    });

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    const updatedDepartment = await this.db.department.update({
        where: { id: departmentId },
        data: {
            name: name.toLowerCase().trim(),
        },
    });

    return updatedDepartment;
  }

  async deleteDepartment(departmentId: string) {
    const existingDepartment = await this.db.department.findUnique({
        where: { id: departmentId },
    });

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    const deletedDepartment = await this.db.department.delete({
        where: { id: departmentId },
    });

    return deletedDepartment;
  }
}

export const departmentService = new DepartmentService();

export const createNewDepartment = departmentService.createNewDepartment.bind(departmentService);
export const getAllDepartments = departmentService.getAllDepartments.bind(departmentService);
export const getDepartmentById = departmentService.getDepartmentById.bind(departmentService);
export const updateDepartment = departmentService.updateDepartment.bind(departmentService);
export const deleteDepartment = departmentService.deleteDepartment.bind(departmentService);