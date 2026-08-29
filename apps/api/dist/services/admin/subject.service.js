import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { ensureSuperAdminExists } from "./bootstrap.service";
import { superAdminCredentials, isSuperAdmin } from "../../config/credentials";
import { createNotification } from "./notification.service";
import pusherService from "./pusher.service";
// ============ Validation Schemas ============
export const createNewSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    authorId: z.string().optional().default(""),
    icon: z.string().optional().default("Folder"),
});
export const createNewCategorySchema = createNewSubjectSchema;
export const updateSubjectSchema = z
    .object({
    name: z.string().min(1, "Subject name is required"),
    subjectId: z.string().optional(),
    categoryId: z.string().optional(),
    icon: z.string().optional(),
})
    .refine((data) => Boolean(data.subjectId || data.categoryId), {
    message: "Subject ID is required",
    path: ["subjectId"],
});
export const updateCategorySchema = updateSubjectSchema;
export const createModuleSchema = z.object({
    title: z.string().min(1, "Module title is required"),
    description: z.string().optional(),
    fileUrls: z.array(z.string()).optional().default([]),
    order: z.number().optional(),
    isPublished: z.boolean().optional(),
    authorId: z.string().optional(),
});
export const updateModuleSchema = z.object({
    title: z.string().min(1, "Module title is required").optional(),
    description: z.string().optional(),
    fileUrls: z.array(z.string()).optional(),
    order: z.number().optional(),
    isPublished: z.boolean().optional(),
});
// ============ Subject Service ============
export class SubjectService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    get subjectModel() {
        return this.db.subject || this.db.category;
    }
    async createNewSubject(data) {
        const parsed = createNewSubjectSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { name, authorId, icon } = parsed.data;
        // Check if subject with the same name (case-insensitive) already exists
        const existingSubject = await this.subjectModel.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
        });
        if (existingSubject) {
            throw new ApiError(400, "Subject with this name already exists");
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
            }
            else {
                throw new ApiError(400, "Valid author account required to create subject.");
            }
        }
        const newSubject = await this.subjectModel.create({
            data: {
                name: name.trim(),
                authorId: validAuthorId,
                icon: icon,
            },
        });
        const subjectName = name.trim();
        createNotification({
            recipientRole: "ALL",
            title: "New Subject Created",
            message: `A new subject "${subjectName}" has been added to BoardQuest.`,
            type: "INFO",
            link: `/subject-management/${newSubject.id}`,
        }).catch(() => { });
        pusherService.broadcastEvent("admin-events", "categories-updated", {
            type: "SUBJECT_CREATED",
            subjectId: newSubject.id,
            name: subjectName,
        });
        return newSubject;
    }
    async createNewCategory(data) {
        return this.createNewSubject(data);
    }
    async getAllSubjects(options) {
        const { isPublished, status, authorId, handledSubjectIds, handledCategoryIds, userRole, userId, search, all, } = options || {};
        const targetHandledIds = handledSubjectIds || handledCategoryIds || [];
        const questionWhere = {};
        if (isPublished !== undefined && isPublished !== "") {
            const isPublishedBool = typeof isPublished === "boolean" ? isPublished : isPublished === "true";
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
        const subjectWhere = {};
        if (search && search.trim()) {
            subjectWhere.name = { contains: search.trim(), mode: "insensitive" };
        }
        const isAll = all === true || all === "true";
        if (userRole === "TEACHER" && !isAll) {
            subjectWhere.OR = [
                { id: { in: targetHandledIds } },
                ...(userId ? [{ handlerIds: { has: userId } }] : []),
            ];
        }
        const subjects = await this.subjectModel.findMany({
            where: subjectWhere,
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
                        modules: true,
                    },
                },
            },
        });
        return subjects.map((sub) => ({
            ...sub,
            questionCount: sub._count?.questions ?? 0,
            modulesCount: sub._count?.modules ?? 0,
        }));
    }
    async getAllCategories(options) {
        return this.getAllSubjects(options);
    }
    async getSubjectsTotalCount() {
        const count = await this.subjectModel.count();
        return count;
    }
    async getCategoriesTotalCount() {
        return this.getSubjectsTotalCount();
    }
    async getSubjectById(subjectId) {
        const subject = await this.subjectModel.findUnique({
            where: { id: subjectId },
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
                        modules: true,
                    },
                },
            },
        });
        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }
        return subject;
    }
    async getCategoryById(subjectId) {
        return this.getSubjectById(subjectId);
    }
    async updateSubject(data) {
        const parsed = updateSubjectSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { name, subjectId, categoryId, icon } = parsed.data;
        const targetId = (subjectId || categoryId);
        const existingSubject = await this.subjectModel.findUnique({
            where: { id: targetId },
        });
        if (!existingSubject) {
            throw new ApiError(404, "Subject not found");
        }
        // Check if another subject with the same name already exists
        const duplicateSubject = await this.subjectModel.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
                id: {
                    not: targetId,
                },
            },
        });
        if (duplicateSubject) {
            throw new ApiError(400, "Subject with this name already exists");
        }
        const updatedSubject = await this.subjectModel.update({
            where: { id: targetId },
            data: {
                name: name.trim(),
                ...(icon !== undefined ? { icon } : {}),
            },
        });
        return updatedSubject;
    }
    async updateCategory(data) {
        return this.updateSubject(data);
    }
    async deleteSubject(subjectId) {
        const existingSubject = await this.subjectModel.findUnique({
            where: { id: subjectId },
        });
        if (!existingSubject) {
            throw new ApiError(404, "Subject not found");
        }
        const deletedSubject = await this.subjectModel.delete({
            where: { id: subjectId },
        });
        return deletedSubject;
    }
    async deleteCategory(subjectId) {
        return this.deleteSubject(subjectId);
    }
    // ============ Learning Module Methods ============
    async getModulesBySubject(subjectId) {
        const modules = await this.db.learningModule.findMany({
            where: {
                subjectId,
            },
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
    async getModulesByCategory(subjectId) {
        return this.getModulesBySubject(subjectId);
    }
    async createLearningModule(subjectId, data) {
        const parsed = createModuleSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { title, description, fileUrls = [], order, isPublished, authorId, } = parsed.data;
        const module = await this.db.learningModule.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                fileUrls: fileUrls || [],
                order: order ?? 0,
                isPublished: isPublished ?? true,
                subjectId,
                ...(authorId ? { authorId } : {}),
            },
        });
        return module;
    }
    async updateLearningModule(moduleId, data) {
        const parsed = updateModuleSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const existing = await this.db.learningModule.findUnique({
            where: { id: moduleId },
        });
        if (!existing) {
            throw new ApiError(404, "Learning module not found");
        }
        const updatePayload = {
            ...parsed.data,
            ...(parsed.data.title ? { title: parsed.data.title.trim() } : {}),
        };
        if (parsed.data.fileUrls !== undefined) {
            updatePayload.fileUrls = parsed.data.fileUrls;
        }
        const updated = await this.db.learningModule.update({
            where: { id: moduleId },
            data: updatePayload,
        });
        return updated;
    }
    async deleteLearningModule(moduleId) {
        const existing = await this.db.learningModule.findUnique({
            where: { id: moduleId },
        });
        if (!existing) {
            throw new ApiError(404, "Learning module not found");
        }
        const deleted = await this.db.learningModule.delete({
            where: { id: moduleId },
        });
        return deleted;
    }
    async assignSubjectHandlers(subjectId, handlerIds) {
        const existing = await this.subjectModel.findUnique({
            where: { id: subjectId },
        });
        if (!existing) {
            throw new ApiError(404, "Subject not found");
        }
        // External accounts (Review Center) cannot be assigned to handle subjects
        if (handlerIds.length > 0) {
            const externalReps = await this.db.reviewCenterRepresentativeUser.findMany({
                where: { id: { in: handlerIds } },
                select: { id: true },
            });
            if (externalReps.length > 0) {
                throw new ApiError(400, "External accounts (Review Center) cannot be assigned to handle subjects.");
            }
            const users = await this.db.adminUser.findMany({
                where: { id: { in: handlerIds } },
                select: { id: true, role: true },
            });
            const invalidExternalUser = users.find((u) => u.role === "REVIEWCENTER" ||
                u.role === "EXTERNAL");
            if (invalidExternalUser) {
                throw new ApiError(400, "External accounts (Review Center) cannot be assigned to handle subjects.");
            }
        }
        const previousHandlerIds = existing.handlerIds || [];
        const removedHandlerIds = previousHandlerIds.filter((id) => !handlerIds.includes(id));
        const addedHandlerIds = handlerIds.filter((id) => !previousHandlerIds.includes(id));
        for (const handlerId of removedHandlerIds) {
            const u = await this.db.adminUser.findUnique({
                where: { id: handlerId },
                select: { handledSubjectIds: true },
            });
            if (u) {
                const existingIds = u.handledSubjectIds || [];
                const nextIds = existingIds.filter((cid) => cid !== subjectId);
                await this.db.adminUser.update({
                    where: { id: handlerId },
                    data: { handledSubjectIds: nextIds },
                });
            }
        }
        for (const handlerId of addedHandlerIds) {
            const u = await this.db.adminUser.findUnique({
                where: { id: handlerId },
                select: { handledSubjectIds: true },
            });
            if (u) {
                const currentIds = u.handledSubjectIds || [];
                if (!currentIds.includes(subjectId)) {
                    await this.db.adminUser.update({
                        where: { id: handlerId },
                        data: { handledSubjectIds: [...currentIds, subjectId] },
                    });
                }
            }
        }
        const updatedSubject = await this.subjectModel.update({
            where: { id: subjectId },
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
                        modules: true,
                    },
                },
            },
        });
        return updatedSubject;
    }
    async assignCategoryHandlers(subjectId, handlerIds) {
        return this.assignSubjectHandlers(subjectId, handlerIds);
    }
}
export const subjectService = new SubjectService();
export const categoryService = subjectService;
export const CategoryService = SubjectService;
export const createNewSubject = subjectService.createNewSubject.bind(subjectService);
export const createNewCategory = createNewSubject;
export const getAllSubjects = subjectService.getAllSubjects.bind(subjectService);
export const getAllCategories = getAllSubjects;
export const getSubjectById = subjectService.getSubjectById.bind(subjectService);
export const getCategoryById = getSubjectById;
export const updateSubject = subjectService.updateSubject.bind(subjectService);
export const updateCategory = updateSubject;
export const deleteSubject = subjectService.deleteSubject.bind(subjectService);
export const deleteCategory = deleteSubject;
export const getSubjectsTotalCount = subjectService.getSubjectsTotalCount.bind(subjectService);
export const getCategoriesTotalCount = getSubjectsTotalCount;
export const getSubjectsCount = getSubjectsTotalCount;
export const getCategoriesCount = getSubjectsTotalCount;
export const getModulesBySubject = subjectService.getModulesBySubject.bind(subjectService);
export const getModulesByCategory = getModulesBySubject;
export const createLearningModule = subjectService.createLearningModule.bind(subjectService);
export const updateLearningModule = subjectService.updateLearningModule.bind(subjectService);
export const deleteLearningModule = subjectService.deleteLearningModule.bind(subjectService);
export const assignSubjectHandlers = subjectService.assignSubjectHandlers.bind(subjectService);
export const assignCategoryHandlers = assignSubjectHandlers;
