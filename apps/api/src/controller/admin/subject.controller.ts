import { asyncHandler } from "../../utils/asyncHandler";
import * as subjectServices from "../../services/admin/subject.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

export const createSubject = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const reqAny = req as any;
  const authorId =
    reqAny.user?.id ||
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

export const getSubjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { isPublished, status, authorId, search, all } = req.query;
  const user = req.user;
  const subjects = await subjectServices.getAllSubjects({
    isPublished: isPublished as any,
    status: status as string,
    authorId: authorId as string,
    search: search ? String(search) : undefined,
    all: String(all) === "true",
    handledCategoryIds: user?.handledCategoryIds,
    handledSubjectIds: (user as any)?.handledSubjectIds || user?.handledCategoryIds,
    userRole: user?.role,
    userId: user?.id,
  });
  return new ApiResponse(200, { subjects, categories: subjects }, "Subjects retrieved successfully").send(res);
});
export const getCategories = getSubjects;

export const getSubjectsTotalCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const totalCount = await subjectServices.getSubjectsTotalCount();
  return new ApiResponse(200, { totalCount }, "Subjects total count retrieved successfully").send(res);
});
export const getCategoriesTotalCount = getSubjectsTotalCount;

export const getSubject = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId;
  const subject = await subjectServices.getSubjectById(subjectId as string);
  return new ApiResponse(200, { subject, category: subject }, "Subject retrieved successfully").send(res);
});
export const getCategory = getSubject;

export const updateSubject = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId || (req as any).body?.subjectId || (req as any).body?.categoryId;
  const updatedSubject = await subjectServices.updateSubject({
    ...(req as any).body,
    subjectId,
    categoryId: subjectId,
  });
  return new ApiResponse(200, { subject: updatedSubject, category: updatedSubject }, "Subject updated successfully").send(res);
});
export const updateCategory = updateSubject;

export const deleteSubject = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId;
  const deletedSubject = await subjectServices.deleteSubject(subjectId as string);
  return new ApiResponse(200, { subject: deletedSubject, category: deletedSubject }, "Subject deleted successfully").send(res);
});
export const deleteCategory = deleteSubject;

export const getModulesBySubject = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId;
  const modules = await subjectServices.getModulesBySubject(subjectId as string);
  return new ApiResponse(200, { modules }, "Learning modules retrieved successfully").send(res);
});
export const getModulesByCategory = getModulesBySubject;

export const createModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId;
  const userId = (req as any)?.user?.id || (req as any)?.data?.id;
  const moduleData = { ...req.body, authorId: userId };
  const module = await subjectServices.createLearningModule(subjectId as string, moduleData);
  return new ApiResponse(201, { module }, "Learning module created successfully").send(res);
});

export const updateModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { moduleId } = (req as any).params;
  const updatedModule = await subjectServices.updateLearningModule(moduleId as string, req.body);
  return new ApiResponse(200, { module: updatedModule }, "Learning module updated successfully").send(res);
});

export const deleteModule = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const { moduleId } = (req as any).params;
  const deletedModule = await subjectServices.deleteLearningModule(moduleId as string);
  return new ApiResponse(200, { module: deletedModule }, "Learning module deleted successfully").send(res);
});

export const assignSubjectHandlers = asyncHandler(async (req: AuthenticatedRequest | Request, res: Response) => {
  const subjectId = (req as any).params?.subjectId || (req as any).params?.categoryId || (req as any).body?.subjectId || (req as any).body?.categoryId;
  const { handlerIds } = (req as any).body;

  if (!Array.isArray(handlerIds)) {
    throw new ApiError(400, "handlerIds must be an array of user IDs");
  }

  const subject = await subjectServices.assignSubjectHandlers(subjectId as string, handlerIds);
  return new ApiResponse(200, { subject, category: subject }, "User handlers assigned successfully").send(res);
});
export const assignCategoryHandlers = assignSubjectHandlers;
