import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

// ============ Validation Schemas ============

export const createNewCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
    categoryId: z.string().min(1, "Category ID is required"),
});

// ============ Type Definitions ============

export type CreateNewCategoryInput = z.infer<typeof createNewCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ============ Category Services ============

export class CategoryService {
  constructor(private readonly db: typeof prisma = prisma) {}

  async createNewCategory(data: CreateNewCategoryInput) {
    const parsed = createNewCategorySchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, authorId } = parsed.data;

    // Check if category with the same name (case-insensitive) already exists
    const existingCategory = await this.db.category.findFirst({
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

    const newCategory = await this.db.category.create({
        data: {
            name: name.trim(),
            authorId,
        },
    });

    return newCategory;
  }

  async getAllCategories() {
    const categories = await this.db.category.findMany({
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
  }

  async getCategoryById(categoryId: string) {
    const category = await this.db.category.findUnique({
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
  }

  async updateCategory(data: UpdateCategoryInput) {
    const parsed = updateCategorySchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, categoryId } = parsed.data;

    const existingCategory = await this.db.category.findUnique({
        where: { id: categoryId },
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    // Check if another category with the same name already exists
    const duplicateCategory = await this.db.category.findFirst({
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

    const updatedCategory = await this.db.category.update({
        where: { id: categoryId },
        data: {
            name: name.trim(),
        },
    });

    return updatedCategory;
  }

  async deleteCategory(categoryId: string) {
    const existingCategory = await this.db.category.findUnique({
        where: { id: categoryId },
    });

    if (!existingCategory) {
        throw new ApiError(404, "Category not found");
    }

    const deletedCategory = await this.db.category.delete({
        where: { id: categoryId },
    });

    return deletedCategory;
  }
}

export const categoryService = new CategoryService();

export const createNewCategory = categoryService.createNewCategory.bind(categoryService);
export const getAllCategories = categoryService.getAllCategories.bind(categoryService);
export const getCategoryById = categoryService.getCategoryById.bind(categoryService);
export const updateCategory = categoryService.updateCategory.bind(categoryService);
export const deleteCategory = categoryService.deleteCategory.bind(categoryService);
