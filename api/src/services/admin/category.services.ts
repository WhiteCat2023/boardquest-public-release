import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

export const createNewCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    categoryId: z.string().min(1, "Category ID is required"),
});

type CreateNewCategoryInput = z.infer<typeof createNewCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const createNewCategory = async (data: CreateNewCategoryInput) => {
    const parsed = createNewCategorySchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, authorId } = parsed.data;

    // Check if category with the same name (case-insensitive) already exists
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: name.trim(),
                mode: "insensitive",
            },
        },
    });

    if (existingCategory) {
        throw new ApiError(400, "Category with this name already exists");
    }

    const newCategory = await prisma.category.create({
        data: {
            name: name.trim(),
            authorId,
        },
    });

    return newCategory;
};

export const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        include: {
            questions: true,
            author: {
                select: {
                    name: true,
                },
            },
        },
    });
    return categories;
};

export const getCategoryById = async (categoryId: string) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            questions: true,
            author: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return category;
};

export const updateCategory = async (data: UpdateCategoryInput) => {
    const parsed = updateCategorySchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, categoryId } = parsed.data;

    const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    // Check if another category with the same name already exists
    const duplicateCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: name.trim(),
                mode: "insensitive",
            },
            id: {
                not: categoryId,
            },
        },
    });

    if (duplicateCategory) {
        throw new ApiError(400, "Category with this name already exists");
    }

    const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
            name: name.trim(),
        },
    });

    return updatedCategory;
};

export const deleteCategory = async (categoryId: string) => {
    const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    const deletedCategory = await prisma.category.delete({
        where: { id: categoryId },
    });

    return deletedCategory;
};
