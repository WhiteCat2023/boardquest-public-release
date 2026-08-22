import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryServices from "../../services/admin/category.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const createCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const reqAny = req as any;
  const authorId =
    reqAny.user?.id ||
    req.body?.authorId ||
    reqAny.data?.user?.id ||
    reqAny.data?.id;

  const category = await categoryServices.createNewCategory({
    ...req.body,
    authorId,
  });
  return new ApiResponse(201, { category }, "Category created successfully").send(res);
});

export const getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { isPublished, status, authorId, search } = req.query;
  const user = req.user;
  const categories = await categoryServices.getAllCategories({
    isPublished: isPublished as any,
    status: status as string,
    authorId: authorId as string,
    search: search ? String(search) : undefined,
    handledCategoryIds: user?.handledCategoryIds,
    userRole: user?.role,
    userId: user?.id,
  });
  return new ApiResponse(200, { categories }, "Categories retrieved successfully").send(res);
});

export const getCategoriesTotalCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const totalCount = await categoryServices.getCategoriesTotalCount();
  return new ApiResponse(200, { totalCount }, "Categories total count retrieved successfully").send(res);
});

export const getCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { categoryId } = (req as any).params;
  const category = await categoryServices.getCategoryById(categoryId as string);
  return new ApiResponse(200, { category }, "Category retrieved successfully").send(res);
});

export const updateCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const categoryId = (req as any).params?.categoryId || (req as any).body?.categoryId;
  const updatedCategory = await categoryServices.updateCategory({
    ...(req as any).body,
    categoryId,
  });
  return new ApiResponse(200, { category: updatedCategory }, "Category updated successfully").send(res);
});

export const deleteCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { categoryId } = (req as any).params;
  const deletedCategory = await categoryServices.deleteCategory(categoryId as string);
  return new ApiResponse(200, { category: deletedCategory }, "Category deleted successfully").send(res);
});

export const getModulesByCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { categoryId } = (req as any).params;
  const modules = await categoryServices.getModulesByCategory(categoryId as string);
  return new ApiResponse(200, { modules }, "Learning modules retrieved successfully").send(res);
});

export const createModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { categoryId } = (req as any).params;
  const userId = (req as any)?.user?.id || (req as any)?.data?.id;
  const moduleData = { ...req.body, authorId: userId };
  const module = await categoryServices.createLearningModule(categoryId as string, moduleData);
  return new ApiResponse(201, { module }, "Learning module created successfully").send(res);
});

export const updateModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { moduleId } = (req as any).params;
  const updatedModule = await categoryServices.updateLearningModule(moduleId as string, req.body);
  return new ApiResponse(200, { module: updatedModule }, "Learning module updated successfully").send(res);
});

export const deleteModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { moduleId } = (req as any).params;
  const deletedModule = await categoryServices.deleteLearningModule(moduleId as string);
  return new ApiResponse(200, { module: deletedModule }, "Learning module deleted successfully").send(res);
});

export const assignCategoryHandlers = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const categoryId = (req as any).params?.categoryId || (req as any).body?.categoryId;
  const { handlerIds } = (req as any).body;

  if (!Array.isArray(handlerIds)) {
    throw new ApiError(400, "handlerIds must be an array of faculty member IDs");
  }

  const category = await categoryServices.assignCategoryHandlers(categoryId as string, handlerIds);
  return new ApiResponse(200, { category }, "Faculty handlers assigned successfully").send(res);
});
