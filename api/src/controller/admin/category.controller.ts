import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryServices from "../../services/admin/category.services";
import { ApiResponse } from "../../utils/apiResponse";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const createCategory = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const category = await categoryServices.createNewCategory((req as any).body);
  return new ApiResponse(201, { category }, "Category created successfully").send(res);
});

export const getCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { isPublished, status, authorId } = req.query;
  const categories = await categoryServices.getAllCategories({
    isPublished: isPublished as any,
    status: status as string,
    authorId: authorId as string,
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
  const updatedCategory = await categoryServices.updateCategory((req as any).body);
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
