import { asyncHandler } from "../../utils/asyncHandler";
import * as subjectServices from "../../services/admin/subject.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const createSubject = asyncHandler(async (req, res) => {
    const reqAny = req;
    const authorId = reqAny.user?.id ||
        req.body?.authorId ||
        reqAny.data?.user?.id ||
        reqAny.data?.id;
    const subject = await subjectServices.createNewSubject({
        ...req.body,
        authorId,
    });
    return new ApiResponse(201, { subject, category: subject }, "Subject created successfully").send(res);
});
export const createCategory = createSubject;
export const getSubjects = asyncHandler(async (req, res) => {
    const { isPublished, status, authorId, search, all } = req.query;
    const user = req.user;
    const subjects = await subjectServices.getAllSubjects({
        isPublished: isPublished,
        status: status,
        authorId: authorId,
        search: search ? String(search) : undefined,
        all: String(all) === "true",
        handledCategoryIds: user?.handledCategoryIds,
        handledSubjectIds: user?.handledSubjectIds || user?.handledCategoryIds,
        userRole: user?.role,
        userId: user?.id,
    });
    return new ApiResponse(200, { subjects, categories: subjects }, "Subjects retrieved successfully").send(res);
});
export const getCategories = getSubjects;
export const getSubjectsTotalCount = asyncHandler(async (req, res) => {
    const totalCount = await subjectServices.getSubjectsTotalCount();
    return new ApiResponse(200, { totalCount }, "Subjects total count retrieved successfully").send(res);
});
export const getCategoriesTotalCount = getSubjectsTotalCount;
export const getSubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId;
    const subject = await subjectServices.getSubjectById(subjectId);
    return new ApiResponse(200, { subject, category: subject }, "Subject retrieved successfully").send(res);
});
export const getCategory = getSubject;
export const updateSubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId || req.body?.subjectId || req.body?.categoryId;
    const updatedSubject = await subjectServices.updateSubject({
        ...req.body,
        subjectId,
        categoryId: subjectId,
    });
    return new ApiResponse(200, { subject: updatedSubject, category: updatedSubject }, "Subject updated successfully").send(res);
});
export const updateCategory = updateSubject;
export const deleteSubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId;
    const deletedSubject = await subjectServices.deleteSubject(subjectId);
    return new ApiResponse(200, { subject: deletedSubject, category: deletedSubject }, "Subject deleted successfully").send(res);
});
export const deleteCategory = deleteSubject;
export const getModulesBySubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId;
    const modules = await subjectServices.getModulesBySubject(subjectId);
    return new ApiResponse(200, { modules }, "Learning modules retrieved successfully").send(res);
});
export const getModulesByCategory = getModulesBySubject;
export const createModule = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId;
    const userId = req?.user?.id || req?.data?.id;
    const moduleData = { ...req.body, authorId: userId };
    const module = await subjectServices.createLearningModule(subjectId, moduleData);
    return new ApiResponse(201, { module }, "Learning module created successfully").send(res);
});
export const updateModule = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const updatedModule = await subjectServices.updateLearningModule(moduleId, req.body);
    return new ApiResponse(200, { module: updatedModule }, "Learning module updated successfully").send(res);
});
export const deleteModule = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const deletedModule = await subjectServices.deleteLearningModule(moduleId);
    return new ApiResponse(200, { module: deletedModule }, "Learning module deleted successfully").send(res);
});
export const assignSubjectHandlers = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId || req.params?.categoryId || req.body?.subjectId || req.body?.categoryId;
    const { handlerIds } = req.body;
    if (!Array.isArray(handlerIds)) {
        throw new ApiError(400, "handlerIds must be an array of user IDs");
    }
    const subject = await subjectServices.assignSubjectHandlers(subjectId, handlerIds);
    return new ApiResponse(200, { subject, category: subject }, "User handlers assigned successfully").send(res);
});
export const assignCategoryHandlers = assignSubjectHandlers;
