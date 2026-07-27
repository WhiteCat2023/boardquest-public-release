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

  async getAllCategories(options?: {
    isPublished?: boolean | string;
    status?: string;
    authorId?: string;
  }) {
    const { isPublished, status, authorId } = options || {};

    const questionWhere: any = {};

    if (isPublished !== undefined && isPublished !== "") {
      const isPublishedBool = typeof isPublished === "boolean"
        ? isPublished
        : isPublished === "true";
      questionWhere.isPublished = isPublishedBool;
    }

    if (status && status !== "ALL") {
      questionWhere.status = status;
    }

    if (authorId) {
      let targetAuthorId = authorId;
      if (targetAuthorId === "superadmin-env-id") {
        targetAuthorId = "507f1f77bcf86cd799439011";
      }
      questionWhere.authorId = targetAuthorId;
    }

    const categories = await this.db.category.findMany({
      select: {
        id: true,
        name: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            questions: {
              where: questionWhere,
            },
          },
        },
      },
    });

    return categories.map((cat: any) => ({
      ...cat,
      questionCount: cat._count?.questions ?? 0,
    }));
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
