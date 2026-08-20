import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { ensureSuperAdminExists } from "./bootstrap.service";
import { superAdminCredentials, isSuperAdmin } from "../../config/credentials";

// ============ Validation Schemas ============

export const createNewCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  authorId: z.string().optional().default(""),
  icon: z.string().optional().default("Folder"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  icon: z.string().optional(),
});

export const createModuleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
  authorId: z.string().optional(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1, "Module title is required").optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});

// ============ Type Definitions ============

export type CreateNewCategoryInput = z.infer<typeof createNewCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ============ Category Services ============

export class CategoryService {
  constructor(private readonly db: typeof prisma = prisma) {}

  async createNewCategory(data: CreateNewCategoryInput) {
    const parsed = createNewCategorySchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { name, authorId, icon } = parsed.data;

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

    let validAuthorId = authorId;
    let authorExists = false;

    if (validAuthorId && /^[0-9a-fA-F]{24}$/.test(validAuthorId)) {
      const existingAuthor = await this.db.adminUser.findUnique({
        where: { id: validAuthorId },
        select: { id: true },
      });
      if (existingAuthor) {
        authorExists = true;
      }
    }

    if (!authorExists) {
      const superAdmin = await ensureSuperAdminExists();
      if (superAdmin?.id) {
        validAuthorId = superAdmin.id;
      } else {
        throw new ApiError(400, "Valid author account required to create category.");
      }
    }

    const newCategory = await this.db.category.create({
      data: {
        name: name.trim(),
        authorId: validAuthorId,
        icon: icon,
      },
    });

    return newCategory;
  }

  async getAllCategories(options?: {
    isPublished?: boolean | string;
    status?: string;
    authorId?: string;
    handledCategoryIds?: string[];
    userRole?: string;
    userId?: string;
  }) {
    const { isPublished, status, authorId, handledCategoryIds, userRole, userId } = options || {};

    const questionWhere: any = {};

    if (isPublished !== undefined && isPublished !== "") {
      const isPublishedBool =
        typeof isPublished === "boolean"
          ? isPublished
          : isPublished === "true";
      questionWhere.isPublished = isPublishedBool;
    }

    if (status && status !== "ALL") {
      questionWhere.status = status;
    }

    if (authorId) {
      let targetAuthorId = authorId;
      if (isSuperAdmin(targetAuthorId)) {
        targetAuthorId = superAdminCredentials.id;
      }
      questionWhere.authorId = targetAuthorId;
    }

    const categoryWhere: any = {};
    if (userRole === "TEACHER") {
      categoryWhere.OR = [
        { id: { in: handledCategoryIds || [] } },
        ...(userId ? [{ handlerIds: { has: userId } }] : []),
      ];
    }

    const categories = await (this.db as any).category.findMany({
      where: categoryWhere,
      include: {
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

  async getCategoriesTotalCount() {
    const categories = await this.db.category.count();
    return categories;
  }

  async getCategoryById(categoryId: string) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        handlers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            questions: true,
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

    const { name, categoryId, icon } = parsed.data;

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
        ...(icon !== undefined ? { icon } : {}),
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

  // ============ Learning Module Methods ============

  async getModulesByCategory(categoryId: string) {
    const modules = await (this.db as any).learningModule.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return modules;
  }

  async createLearningModule(categoryId: string, data: CreateModuleInput) {
    const parsed = createModuleSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { title, description, fileUrl, order, isPublished, authorId } =
      parsed.data;

    const module = await (this.db as any).learningModule.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        order: order ?? 0,
        isPublished: isPublished ?? true,
        categoryId,
        ...(authorId ? { authorId } : {}),
      },
    });

    return module;
  }

  async updateLearningModule(moduleId: string, data: UpdateModuleInput) {
    const parsed = updateModuleSchema.safeParse(data);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const existing = await (this.db as any).learningModule.findUnique({
      where: { id: moduleId },
    });
    if (!existing) {
      throw new ApiError(404, "Learning module not found");
    }

    const updated = await (this.db as any).learningModule.update({
      where: { id: moduleId },
      data: {
        ...parsed.data,
        ...(parsed.data.title ? { title: parsed.data.title.trim() } : {}),
      },
    });

    return updated;
  }

  async deleteLearningModule(moduleId: string) {
    const existing = await (this.db as any).learningModule.findUnique({
      where: { id: moduleId },
    });
    if (!existing) {
      throw new ApiError(404, "Learning module not found");
    }

    const deleted = await (this.db as any).learningModule.delete({
      where: { id: moduleId },
    });

    return deleted;
  }

  async assignCategoryHandlers(categoryId: string, handlerIds: string[]) {
    const existing = await this.db.category.findUnique({
      where: { id: categoryId },
    });
    if (!existing) {
      throw new ApiError(404, "Category not found");
    }

    const previousHandlerIds = existing.handlerIds || [];
    const removedHandlerIds = previousHandlerIds.filter(
      (id: string) => !handlerIds.includes(id)
    );
    const addedHandlerIds = handlerIds.filter(
      (id: string) => !previousHandlerIds.includes(id)
    );

    for (const handlerId of removedHandlerIds) {
      const u = await this.db.adminUser.findUnique({
        where: { id: handlerId },
        select: { handledCategoryIds: true },
      });
      if (u) {
        const nextIds = (u.handledCategoryIds || []).filter(
          (cid: string) => cid !== categoryId
        );
        await this.db.adminUser.update({
          where: { id: handlerId },
          data: { handledCategoryIds: nextIds },
        });
      }
    }

    for (const handlerId of addedHandlerIds) {
      const u = await this.db.adminUser.findUnique({
        where: { id: handlerId },
        select: { handledCategoryIds: true },
      });
      if (u) {
        const currentIds = u.handledCategoryIds || [];
        if (!currentIds.includes(categoryId)) {
          await this.db.adminUser.update({
            where: { id: handlerId },
            data: { handledCategoryIds: [...currentIds, categoryId] },
          });
        }
      }
    }

    const updatedCategory = await this.db.category.update({
      where: { id: categoryId },
      data: {
        handlerIds: handlerIds,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        handlers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return updatedCategory;
  }
}

export const categoryService = new CategoryService();

export const createNewCategory = categoryService.createNewCategory.bind(categoryService);
export const getAllCategories = categoryService.getAllCategories.bind(categoryService);
export const getCategoryById = categoryService.getCategoryById.bind(categoryService);
export const updateCategory = categoryService.updateCategory.bind(categoryService);
export const deleteCategory = categoryService.deleteCategory.bind(categoryService);
export const getCategoriesCount = categoryService.getCategoriesTotalCount.bind(categoryService);
export const getCategoriesTotalCount = categoryService.getCategoriesTotalCount.bind(categoryService);
export const getModulesByCategory = categoryService.getModulesByCategory.bind(categoryService);
export const createLearningModule = categoryService.createLearningModule.bind(categoryService);
export const updateLearningModule = categoryService.updateLearningModule.bind(categoryService);
export const deleteLearningModule = categoryService.deleteLearningModule.bind(categoryService);
export const assignCategoryHandlers = categoryService.assignCategoryHandlers.bind(categoryService);
