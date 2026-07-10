import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryServices from "../../services/admin/category.services";
import { ApiResponse } from "../../utils/apiResponse";
import { Request, Response } from "express";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryServices.createNewCategory(req.body);
  return new ApiResponse(201, { category }, "Category created successfully").send(res);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryServices.getAllCategories();
  return new ApiResponse(200, { categories }, "Categories retrieved successfully").send(res);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const category = await categoryServices.getCategoryById(categoryId as string);
  return new ApiResponse(200, { category }, "Category retrieved successfully").send(res);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const updatedCategory = await categoryServices.updateCategory(req.body);
  return new ApiResponse(200, { category: updatedCategory }, "Category updated successfully").send(res);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const deletedCategory = await categoryServices.deleteCategory(categoryId as string);
  return new ApiResponse(200, { category: deletedCategory }, "Category deleted successfully").send(res);
});
