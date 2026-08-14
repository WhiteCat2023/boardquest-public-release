import { asyncHandler } from "../../utils/asyncHandler";
import * as categoryServices from "../../services/admin/category.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const createCategory = asyncHandler(async (req, res) => {
    const reqAny = req;
    const authorId = reqAny.user?.id ||
        req.body?.authorId ||
        reqAny.data?.user?.id ||
        reqAny.data?.id;
    const category = await categoryServices.createNewCategory({
        ...req.body,
        authorId,
    });
    return new ApiResponse(201, { category }, "Category created successfully").send(res);
});
export const getCategories = asyncHandler(async (req, res) => {
    const { isPublished, status, authorId } = req.query;
    const user = req.user;
    const categories = await categoryServices.getAllCategories({
        isPublished: isPublished,
        status: status,
        authorId: authorId,
        handledCategoryIds: user?.handledCategoryIds,
        userRole: user?.role,
        userId: user?.id,
    });
    return new ApiResponse(200, { categories }, "Categories retrieved successfully").send(res);
});
export const getCategoriesTotalCount = asyncHandler(async (req, res) => {
    const totalCount = await categoryServices.getCategoriesTotalCount();
    return new ApiResponse(200, { totalCount }, "Categories total count retrieved successfully").send(res);
});
export const getCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await categoryServices.getCategoryById(categoryId);
    return new ApiResponse(200, { category }, "Category retrieved successfully").send(res);
});
export const updateCategory = asyncHandler(async (req, res) => {
    const categoryId = req.params?.categoryId || req.body?.categoryId;
    const updatedCategory = await categoryServices.updateCategory({
        ...req.body,
        categoryId,
    });
    return new ApiResponse(200, { category: updatedCategory }, "Category updated successfully").send(res);
});
export const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const deletedCategory = await categoryServices.deleteCategory(categoryId);
    return new ApiResponse(200, { category: deletedCategory }, "Category deleted successfully").send(res);
});
export const getModulesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const modules = await categoryServices.getModulesByCategory(categoryId);
    return new ApiResponse(200, { modules }, "Learning modules retrieved successfully").send(res);
});
export const createModule = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const userId = req?.user?.id || req?.data?.id;
    const moduleData = { ...req.body, authorId: userId };
    const module = await categoryServices.createLearningModule(categoryId, moduleData);
    return new ApiResponse(201, { module }, "Learning module created successfully").send(res);
});
export const updateModule = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const updatedModule = await categoryServices.updateLearningModule(moduleId, req.body);
    return new ApiResponse(200, { module: updatedModule }, "Learning module updated successfully").send(res);
});
export const deleteModule = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const deletedModule = await categoryServices.deleteLearningModule(moduleId);
    return new ApiResponse(200, { module: deletedModule }, "Learning module deleted successfully").send(res);
});
export const assignCategoryHandlers = asyncHandler(async (req, res) => {
    const categoryId = req.params?.categoryId || req.body?.categoryId;
    const { handlerIds } = req.body;
    if (!Array.isArray(handlerIds)) {
        throw new ApiError(400, "handlerIds must be an array of faculty member IDs");
    }
    const category = await categoryServices.assignCategoryHandlers(categoryId, handlerIds);
    return new ApiResponse(200, { category }, "Faculty handlers assigned successfully").send(res);
});
