import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

export const createNewDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

export const updateDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    departmentId: z.string().min(1, "Department ID is required"),
});

type CreateNewDepartmentInput = z.infer<typeof createNewDepartmentSchema>;
type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const createNewDepartment = async (data: CreateNewDepartmentInput) => {
    const parsed = createNewDepartmentSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, authorId } = parsed.data;

    const existingDepartment = await prisma.department.findUnique({
        where: { name },
    });

    if (existingDepartment) {
        throw new ApiError(400, "Department with this name already exists");
    }

    const newDepartment = await prisma.department.create({
        data: {
            name: name.toLowerCase().trim(),
            authorId,
        },
    });

    return newDepartment;
};

export const getAllDepartments = async () => {
    const departments = await prisma.department.findMany({
        include: {
            members: true
        },
    }); 
    return departments;
}

export const getDepartmentById = async (departmentId: string) => {
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
            members: true
        },
    });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    return department;
};

export const updateDepartment = async (data: UpdateDepartmentInput) => {
    const parsed = updateDepartmentSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, departmentId } = parsed.data;

    const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
    });

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: {
            name: name.toLowerCase().trim(),
        },
    });

    return updatedDepartment;
};

export const deleteDepartment = async (departmentId: string) => {
    const existingDepartment = await prisma.department.findUnique({
        where: { id: departmentId },
    });

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    const deletedDepartment = await prisma.department.delete({
        where: { id: departmentId },
    });
};