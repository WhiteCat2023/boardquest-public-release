import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { QuestionDifficulty, QuestionType, QuestionStatus, } from "../../types/prisma.types";
import { questionSynthesizerService, } from "./questionSynthesizer.service";
import { questionParaphraserService, } from "./questionParaphraser.service";
import { createNotification } from "./notification.service";
import { sendQuestionStatusNotificationEmail } from "../mail.service";
import { sseService } from "./sse.service";
import pusherService from "./pusher.service";
import { superAdminCredentials, isSuperAdmin } from "../../config/credentials";
// ============ Validation Schemas ============
export const CreateQuestionSchema = z.object({
    question: z.string().min(1, "Question title is required"),
    imageUrl: z.string().optional().nullable(),
    choices: z.array(z.string()).optional().default([]),
    choiceImages: z.array(z.string()).optional().default([]),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().optional(),
    topic: z.string().min(1, "Topic is required"),
    difficulty: z.preprocess((val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val), z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM)),
    type: z.preprocess((val) => (val === "" || !val ? QuestionType.MCQ : val), z.nativeEnum(QuestionType).default(QuestionType.MCQ)),
    status: z.preprocess((val) => (val === "" || !val ? QuestionStatus.PENDING_REVIEW : val), z.nativeEnum(QuestionStatus).default(QuestionStatus.PENDING_REVIEW)),
});
export const UpdateQuestionSchema = z.object({
    id: z.string().min(1, "Question ID is required"),
    question: z.string().min(1, "Question title is required"),
    imageUrl: z.string().optional().nullable(),
    choices: z.array(z.string()).optional().default([]),
    choiceImages: z.array(z.string()).optional().default([]),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().optional(),
    topic: z.string().min(1, "Topic is required"),
    difficulty: z.preprocess((val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val), z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM)),
    type: z.preprocess((val) => (val === "" || !val ? QuestionType.MCQ : val), z.nativeEnum(QuestionType).default(QuestionType.MCQ)),
    status: z.nativeEnum(QuestionStatus).optional(),
});
// ============ Question Services ============
export class QuestionService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async createNewQuestion(data) {
        const parsed = CreateQuestionSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { question, imageUrl, choices, choiceImages, correctAnswer, categoryId, authorId, topic, difficulty, type, status, } = parsed.data;
        let finalAuthorId = authorId || "";
        const isValidObjectId = (id) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
        if (!isValidObjectId(finalAuthorId)) {
            const existingAdmin = await this.db.adminUser.findFirst();
            finalAuthorId = existingAdmin?.id || superAdminCredentials.id;
        }
        // Automatically assign review status based on author role
        let computedStatus = QuestionStatus.PENDING_REVIEW;
        let authorUser = null;
        if (finalAuthorId) {
            authorUser = await this.db.adminUser.findUnique({
                where: { id: finalAuthorId },
            });
            const teacherHandled = authorUser?.handledSubjectIds || authorUser?.handledCategoryIds || [];
            if (authorUser?.role === "TEACHER" && teacherHandled.length > 0) {
                if (!teacherHandled.includes(categoryId)) {
                    throw new ApiError(403, "Teachers can only create questions for subjects assigned to them.");
                }
            }
            if (authorUser?.role === "TEACHER") {
                computedStatus = QuestionStatus.PENDING_REVIEW;
            }
            else if (authorUser?.role === "SUPERADMIN" ||
                authorUser?.role === "DEAN" ||
                authorUser?.role === "TEAMLEAD") {
                computedStatus = status || QuestionStatus.APPROVED;
            }
            else {
                computedStatus = status || QuestionStatus.PENDING_REVIEW;
            }
        }
        // Prevent duplicate questions within the same subject
        const normalize = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, " ");
        const normalizedInput = normalize(question);
        const existingInSubject = await this.db.question.findMany({
            where: {
                subjectId: categoryId.trim(),
            },
            select: {
                id: true,
                question: true,
                status: true,
            },
        });
        const existingDuplicate = existingInSubject.find((q) => normalize(q.question) === normalizedInput);
        if (existingDuplicate) {
            const statusLabel = existingDuplicate.status === QuestionStatus.APPROVED
                ? "already approved"
                : "currently pending review";
            throw new ApiError(409, `This question already exists in this subject (${statusLabel}). Duplicate questions cannot be uploaded.`);
        }
        const newQuestion = await this.db.question.create({
            data: {
                question: question.trim(),
                imageUrl: imageUrl || null,
                choices,
                choiceImages: choiceImages || [],
                correctAnswer: correctAnswer.toLowerCase().trim(),
                subjectId: categoryId.trim(),
                authorId: finalAuthorId,
                topic: topic.trim(),
                difficulty,
                type,
                status: computedStatus,
            },
        });
        const authorName = authorUser?.name || "User";
        if (computedStatus === QuestionStatus.PENDING_REVIEW) {
            createNotification({
                recipientRole: "REVIEWER",
                title: "Question Submitted for Review",
                message: `${authorName} submitted a new question for topic "${topic}" awaiting review.`,
                type: "INFO",
                link: "/question-bank/review-questions",
            }).catch((err) => console.warn("Notification error:", err?.message));
        }
        else {
            createNotification({
                recipientRole: "ALL",
                title: "New Question Added",
                message: `A new question for topic "${topic}" was added to the question bank.`,
                type: "INFO",
                link: "/question-bank",
            }).catch((err) => console.warn("Notification error:", err?.message));
        }
        try {
            const eventPayload = {
                type: "QUESTION_CREATED",
                questionId: newQuestion.id,
                subjectId: newQuestion.subjectId || newQuestion.categoryId,
                categoryId: newQuestion.subjectId || newQuestion.categoryId,
                status: newQuestion.status,
                authorId: newQuestion.authorId,
            };
            sseService.broadcastEvent("questions-updated", eventPayload);
            pusherService.broadcastEvent("admin-events", "questions-updated", eventPayload);
        }
        catch (err) {
            console.warn("Broadcast error:", err);
        }
        return newQuestion;
    }
    async synthesizeQuestion(input) {
        return await questionSynthesizerService.synthesizeQuestion(input);
    }
    async createSynthesizedQuestion(data) {
        const synthesizedList = await questionSynthesizerService.synthesizeQuestion({
            question: data.question,
            choices: data.choices,
            correctAnswer: data.correctAnswer,
            topic: data.topic,
            targetDifficulty: data.difficulty,
            type: data.type,
            count: 5,
        });
        const synthesized = synthesizedList[0];
        return await this.createNewQuestion({
            ...data,
            question: synthesized.question,
            choices: synthesized.choices,
            correctAnswer: synthesized.correctAnswer,
            difficulty: synthesized.difficulty,
        });
    }
    async updateQuestion(questionId, data) {
        const parsed = UpdateQuestionSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { question, imageUrl, choices, choiceImages, correctAnswer, categoryId, authorId, topic, difficulty, type, status, } = parsed.data;
        if (status === QuestionStatus.APPROVED) {
            const existingQuestion = await this.db.question.findUnique({
                where: { id: questionId },
            });
            if (existingQuestion &&
                (existingQuestion.status === QuestionStatus.PENDING_REVISION ||
                    existingQuestion.status === "NEEDS_REVISION")) {
                throw new ApiError(400, "Questions in Pending Revision status cannot be approved until all comments are resolved and the author resubmits them for review.");
            }
        }
        const normalize = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, " ");
        const normalizedInput = normalize(question);
        const existingInSubject = await this.db.question.findMany({
            where: {
                subjectId: categoryId.trim(),
            },
            select: {
                id: true,
                question: true,
                status: true,
            },
        });
        const existingDuplicate = existingInSubject.find((q) => q.id !== questionId && normalize(q.question) === normalizedInput);
        if (existingDuplicate) {
            throw new ApiError(409, `Another question with the exact same wording already exists in this subject (${existingDuplicate.status}). Duplicate questions are not allowed.`);
        }
        const updatedQuestion = await this.db.question.update({
            where: {
                id: questionId,
            },
            data: {
                question: question.trim(),
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
                choices,
                ...(choiceImages !== undefined && { choiceImages }),
                correctAnswer: correctAnswer.toLowerCase().trim(),
                subjectId: categoryId.trim(),
                authorId,
                topic: topic.trim(),
                difficulty,
                type,
                ...(status && { status }),
            },
        });
        await this.syncQuestionRevisionStatus(questionId);
        return updatedQuestion;
    }
    async getAllQuestions(cursor, limit, authorId) {
        const whereClause = authorId ? { authorId } : undefined;
        const limitNum = limit || 20;
        try {
            const [total, rawQuestions] = await Promise.all([
                this.db.question.count({ where: whereClause }),
                this.db.question.findMany({
                    where: whereClause,
                    take: limit ? limitNum + 1 : undefined,
                    skip: cursor ? 1 : undefined,
                    cursor: cursor ? { id: cursor } : undefined,
                    include: {
                        subject: true,
                        author: { select: { name: true } },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            const questions = rawQuestions.map((q) => ({
                ...q,
                category: q.subject,
                categoryId: q.subjectId,
            }));
            if (!limit)
                return { questions, total };
            const hasNextPage = questions.length > limitNum;
            if (hasNextPage)
                questions.pop();
            const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
            return { questions, nextCursor, hasNextPage, total };
        }
        catch (err) {
            console.warn("getAllQuestions relation include failed, falling back to safe query:", err?.message);
            const [total, rawQuestions] = await Promise.all([
                this.db.question.count({ where: whereClause }),
                this.db.question.findMany({
                    where: whereClause,
                    take: limit ? limitNum + 1 : undefined,
                    skip: cursor ? 1 : undefined,
                    cursor: cursor ? { id: cursor } : undefined,
                    include: { subject: true },
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            const questions = rawQuestions.map((q) => ({
                ...q,
                category: q.subject,
                categoryId: q.subjectId,
                author: { name: "System Administrator" },
            }));
            if (!limit)
                return { questions, total };
            const hasNextPage = questions.length > limitNum;
            if (hasNextPage)
                questions.pop();
            const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
            return { questions, nextCursor, hasNextPage, total };
        }
    }
    async getFilteredQuestions(search, difficulty, category, type, status, cursor, limit, authorId, isPublished, schoolYear, handledCategoryIds, userRole) {
        let statusFilter = undefined;
        if (status) {
            if (typeof status === "string" && status.includes(",")) {
                statusFilter = {
                    in: status.split(","),
                };
            }
            else if (Array.isArray(status)) {
                statusFilter = { in: status };
            }
            else {
                statusFilter = status;
            }
        }
        let categoryFilter = category;
        if (userRole === "TEACHER" &&
            !category &&
            handledCategoryIds?.length &&
            String(status) !== "APPROVED") {
            categoryFilter = { in: handledCategoryIds };
        }
        const whereClause = {
            question: search ? { contains: search } : undefined,
            difficulty,
            subjectId: categoryFilter,
            type,
            status: statusFilter,
            authorId: authorId === "unassigned" ? null : authorId,
            isPublished,
            ...(schoolYear && schoolYear !== "ALL" && { schoolYear }),
        };
        const limitNum = limit || 20;
        try {
            const [total, rawQuestions] = await Promise.all([
                this.db.question.count({ where: whereClause }),
                this.db.question.findMany({
                    where: whereClause,
                    take: limit ? limitNum + 1 : undefined,
                    skip: cursor ? 1 : undefined,
                    cursor: cursor ? { id: cursor } : undefined,
                    include: {
                        subject: true,
                        author: { select: { name: true } },
                        _count: { select: { comments: true } },
                    },
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            // Auto-heal and sync questions that are in PENDING_REVISION status with 0 comments
            const stalePendingRevisionIds = rawQuestions
                .filter((q) => (q.status === "PENDING_REVISION" ||
                q.status === "NEEDS_REVISION") &&
                (q._count?.comments ?? 0) === 0)
                .map((q) => q.id);
            if (stalePendingRevisionIds.length > 0) {
                this.db.question
                    .updateMany({
                    where: { id: { in: stalePendingRevisionIds } },
                    data: { status: QuestionStatus.PENDING_REVIEW },
                })
                    .catch((err) => console.warn("Auto-sync stale revision status failed:", err));
            }
            const questions = rawQuestions.map((q) => {
                const hasNoComments = (q._count?.comments ?? 0) === 0;
                const normalizedStatus = (q.status === "PENDING_REVISION" ||
                    q.status === "NEEDS_REVISION") &&
                    hasNoComments
                    ? QuestionStatus.PENDING_REVIEW
                    : q.status;
                return {
                    ...q,
                    status: normalizedStatus,
                    category: q.subject,
                    categoryId: q.subjectId,
                    _count: {
                        ...q._count,
                        comments: q._count?.comments ?? 0,
                    },
                };
            });
            if (!limit)
                return { questions, total };
            const hasNextPage = questions.length > limitNum;
            if (hasNextPage)
                questions.pop();
            const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
            return { questions, nextCursor, hasNextPage, total };
        }
        catch (err) {
            console.warn("getFilteredQuestions relation include failed, falling back to safe query:", err?.message);
            const [total, rawQuestions] = await Promise.all([
                this.db.question.count({ where: whereClause }),
                this.db.question.findMany({
                    where: whereClause,
                    take: limit ? limitNum + 1 : undefined,
                    skip: cursor ? 1 : undefined,
                    cursor: cursor ? { id: cursor } : undefined,
                    include: { subject: true },
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            const questions = rawQuestions.map((q) => ({
                ...q,
                category: q.subject,
                categoryId: q.subjectId,
                author: { name: "System Administrator" },
            }));
            if (!limit)
                return { questions, total };
            const hasNextPage = questions.length > limitNum;
            if (hasNextPage)
                questions.pop();
            const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
            return { questions, nextCursor, hasNextPage, total };
        }
    }
    async getQuestionStats(authorId) {
        const isValidObjectId = (id) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
        let targetAuthorId = authorId;
        if (targetAuthorId && isSuperAdmin(targetAuthorId)) {
            targetAuthorId = superAdminCredentials.id;
        }
        targetAuthorId = isValidObjectId(targetAuthorId) ? targetAuthorId : undefined;
        const [totalQuestions, publishedQuestions, pendingReviewQuestions, teacherAuthoredCount, teacherPublishedCount, teacherDraftCount,] = await Promise.all([
            this.db.question.count(),
            this.db.question.count({
                where: {
                    OR: [{ status: QuestionStatus.APPROVED }],
                },
            }),
            this.db.question.count({
                where: {
                    status: QuestionStatus.PENDING_REVIEW,
                },
            }),
            targetAuthorId
                ? this.db.question.count({ where: { authorId: targetAuthorId } })
                : Promise.resolve(0),
            targetAuthorId
                ? this.db.question.count({
                    where: {
                        authorId: targetAuthorId,
                        OR: [{ status: QuestionStatus.APPROVED }],
                    },
                })
                : Promise.resolve(0),
            targetAuthorId
                ? this.db.question.count({
                    where: {
                        authorId: targetAuthorId,
                        status: { not: QuestionStatus.APPROVED },
                    },
                })
                : Promise.resolve(0),
        ]);
        return {
            totalQuestions,
            publishedQuestions,
            pendingReviewQuestions,
            teacherAuthoredCount,
            teacherPublishedCount,
            teacherDraftCount,
        };
    }
    async getQuestionById(questionId) {
        await this.syncQuestionRevisionStatus(questionId);
        const rawQuestion = await this.db.question.findUnique({
            where: {
                id: questionId,
            },
            include: {
                subject: true,
                author: { select: { id: true, name: true, role: true } },
            },
        });
        if (!rawQuestion) {
            throw new ApiError(404, "Question not found");
        }
        return {
            ...rawQuestion,
            category: rawQuestion.subject,
            categoryId: rawQuestion.subjectId,
        };
    }
    async deleteQuestion(questionId) {
        const question = await this.db.question.delete({
            where: {
                id: questionId,
            },
        });
        return question;
    }
    async getQuestionsByCategory(categoryId) {
        const questions = await this.db.question.findMany({
            where: {
                OR: [{ subjectId: categoryId }, { categoryId }],
            },
            orderBy: { createdAt: "desc" },
        });
        return questions;
    }
    async getQuestionByDifficulty(difficulty) {
        const questions = await this.db.question.findMany({
            where: {
                difficulty,
            },
            orderBy: { createdAt: "desc" },
        });
        return questions;
    }
    async getQuestionByType(type) {
        const questions = await this.db.question.findMany({
            where: {
                type,
            },
            orderBy: { createdAt: "desc" },
        });
        return questions;
    }
    async getQuestionByStatus(status) {
        const questions = await this.db.question.findMany({
            where: {
                status,
            },
            orderBy: { createdAt: "desc" },
        });
        return questions;
    }
    async getQuestionBySearch(search) {
        const questions = await this.db.question.findMany({
            where: {
                question: {
                    contains: search,
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return questions;
    }
    async importQuestions(questions, categoryId, authorId, defaultStatus = QuestionStatus.PENDING_REVIEW, silentNotification = false) {
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new ApiError(400, "No questions provided for import");
        }
        const authorUser = await this.db.adminUser.findUnique({
            where: { id: authorId },
        });
        let resolvedStatus = defaultStatus;
        if (authorUser?.role === "TEACHER") {
            resolvedStatus = QuestionStatus.PENDING_REVIEW;
        }
        else if (authorUser?.role === "SUPERADMIN" ||
            authorUser?.role === "DEAN") {
            resolvedStatus = defaultStatus || QuestionStatus.APPROVED;
        }
        // Query all existing questions in this subject to check against duplicates
        const existingInSubject = await this.db.question.findMany({
            where: {
                subjectId: categoryId.trim(),
            },
            select: {
                question: true,
            },
        });
        const normalize = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, " ");
        const existingSet = new Set(existingInSubject.map((q) => normalize(q.question)));
        const seenInBatch = new Set();
        const validQuestions = [];
        const skippedDuplicates = [];
        for (const q of questions) {
            const norm = normalize(q.question);
            if (!norm)
                continue;
            if (existingSet.has(norm)) {
                skippedDuplicates.push({
                    question: q.question,
                    reason: "Already exists in this subject",
                });
                continue;
            }
            if (seenInBatch.has(norm)) {
                skippedDuplicates.push({
                    question: q.question,
                    reason: "Duplicate question within the upload batch",
                });
                continue;
            }
            seenInBatch.add(norm);
            validQuestions.push(q);
        }
        if (validQuestions.length === 0) {
            const result = [];
            result.createdQuestions = [];
            result.count = 0;
            result.skippedDuplicates = skippedDuplicates.length;
            result.skippedDetails = skippedDuplicates;
            return result;
        }
        const queries = validQuestions.map((q) => {
            let choices = q.choices || [];
            if (q.type === QuestionType.TRUE_FALSE && choices.length === 0) {
                choices = ["True", "False"];
            }
            const qStatus = authorUser?.role === "TEACHER"
                ? QuestionStatus.PENDING_REVIEW
                : authorUser?.role === "SUPERADMIN" ||
                    authorUser?.role === "DEAN" ||
                    authorUser?.role === "TEAMLEAD"
                    ? q.status || QuestionStatus.APPROVED
                    : q.status || resolvedStatus;
            return this.db.question.create({
                data: {
                    question: q.question.trim(),
                    choices: choices.map((c) => c.trim()),
                    correctAnswer: q.correctAnswer.toLowerCase().trim(),
                    subjectId: categoryId.trim(),
                    authorId,
                    topic: q.topic.trim(),
                    difficulty: q.difficulty,
                    type: q.type,
                    status: qStatus,
                },
            });
        });
        const createdQuestions = await this.db.$transaction(queries);
        if (!silentNotification) {
            const authorName = authorUser?.name || "User";
            const count = createdQuestions.length;
            if (authorUser?.role === "TEACHER" ||
                resolvedStatus === QuestionStatus.PENDING_REVIEW) {
                createNotification({
                    recipientRole: "REVIEWER",
                    title: "Bulk Questions Pending Review",
                    message: `${authorName} uploaded ${count} question(s) awaiting review.`,
                    type: "INFO",
                    link: "/question-bank/review-questions",
                }).catch((err) => console.warn("Notification error:", err?.message));
            }
            else {
                createNotification({
                    recipientRole: "ALL",
                    title: "Bulk Questions Uploaded",
                    message: `${authorName} uploaded ${count} new question(s) to the question bank.`,
                    type: "INFO",
                    link: categoryId ? `/subject-management/${categoryId}` : "/question-bank",
                }).catch((err) => console.warn("Notification error:", err?.message));
            }
        }
        try {
            const eventPayload = {
                type: "QUESTIONS_IMPORTED",
                categoryId,
                count: createdQuestions.length,
                authorId,
                status: resolvedStatus,
            };
            sseService.broadcastEvent("questions-updated", eventPayload);
            pusherService.broadcastEvent("admin-events", "questions-updated", eventPayload);
        }
        catch (err) {
            console.warn("Broadcast error:", err);
        }
        const result = createdQuestions;
        result.createdQuestions = createdQuestions;
        result.count = createdQuestions.length;
        result.skippedDuplicates = skippedDuplicates.length;
        result.skippedDetails = skippedDuplicates;
        return result;
    }
    async bulkDeleteQuestions(ids, user) {
        const questions = await this.db.question.findMany({
            where: { id: { in: ids } },
        });
        for (const question of questions) {
            const isAuthor = question.authorId === user.id;
            const canDelete = user.role === "SUPERADMIN" ||
                user.role === "DEAN" ||
                user.role === "TEAMLEAD" ||
                (user.role === "TEACHER" && isAuthor);
            if (!canDelete) {
                throw new ApiError(403, `You do not have permission to delete question Q-${question.id.slice(-4).toUpperCase()}`);
            }
        }
        await this.db.question.deleteMany({
            where: { id: { in: ids } },
        });
    }
    async bulkApproveQuestions(ids, user) {
        const canManage = user.role === "SUPERADMIN" ||
            user.role === "DEAN" ||
            user.role === "TEAMLEAD";
        if (!canManage) {
            throw new ApiError(403, "You do not have permission to approve questions.");
        }
        const targetQuestions = await this.db.question.findMany({
            where: { id: { in: ids } },
            include: {
                comments: {
                    where: { isResolved: false },
                },
            },
        });
        const pendingWithUnresolvedComments = targetQuestions.filter((q) => (q.status === QuestionStatus.PENDING_REVISION ||
            q.status === "NEEDS_REVISION") &&
            q.comments &&
            q.comments.length > 0);
        if (pendingWithUnresolvedComments.length > 0) {
            throw new ApiError(400, `Cannot approve question(s). ${pendingWithUnresolvedComments.length} question(s) have unresolved reviewer comments. Please resolve the comments before approving.`);
        }
        await this.db.question.updateMany({
            where: { id: { in: ids } },
            data: { status: QuestionStatus.APPROVED },
        });
        // Notify author(s) individually
        const uniqueAuthorIds = Array.from(new Set(targetQuestions
            .map((q) => q.authorId)
            .filter((id) => Boolean(id))));
        for (const authorId of uniqueAuthorIds) {
            const count = targetQuestions.filter((q) => q.authorId === authorId).length;
            const notifMsg = `Your ${count === 1 ? "question has" : `${count} questions have`} been reviewed, approved, and added to the official Question Bank.`;
            createNotification({
                recipientId: authorId,
                title: "Question Approved",
                message: notifMsg,
                type: "SUCCESS",
                link: "/question-bank/my-questions",
            }).catch(() => { });
            // Dispatch Email Notification if author has emailNotifications enabled
            (async () => {
                try {
                    const author = await this.db.adminUser.findUnique({
                        where: { id: authorId },
                        select: { email: true, name: true, notificationPreferences: true },
                    });
                    if (author?.email) {
                        const prefs = author.notificationPreferences;
                        const emailAllowed = prefs?.emailNotifications !== false;
                        if (emailAllowed) {
                            await sendQuestionStatusNotificationEmail({
                                toEmail: author.email,
                                userName: author.name,
                                status: "APPROVED",
                                message: notifMsg,
                                linkUrl: `${process.env.ADMIN_URL || "http://localhost:5173"}/question-bank`,
                            });
                        }
                    }
                }
                catch (err) {
                    console.warn("Failed to dispatch approval email notification:", err?.message);
                }
            })();
        }
        createNotification({
            recipientRole: "ALL",
            title: "Question Set Approved",
            message: `${ids.length} question(s) were approved and published to the question bank.`,
            type: "INFO",
            link: "/question-bank",
        }).catch((err) => console.warn("Notification error:", err?.message));
    }
    async bulkUpdateStatusQuestions(ids, status, user) {
        const canManage = user.role === "SUPERADMIN" ||
            user.role === "DEAN" ||
            user.role === "TEAMLEAD" ||
            user.role === "TEACHER";
        if (!canManage) {
            throw new ApiError(403, "You do not have permission to update question status.");
        }
        if (status === QuestionStatus.APPROVED) {
            const targetQuestions = await this.db.question.findMany({
                where: { id: { in: ids } },
            });
            const pendingRevisionQuestions = targetQuestions.filter((q) => q.status === QuestionStatus.PENDING_REVISION ||
                q.status === "NEEDS_REVISION");
            if (pendingRevisionQuestions.length > 0) {
                throw new ApiError(400, `Cannot approve question(s). ${pendingRevisionQuestions.length} of the selected question(s) are in Pending Revision status and must be resubmitted for review first.`);
            }
        }
        if (status === QuestionStatus.PENDING_REVIEW) {
            for (const id of ids) {
                await this.checkUnresolvedComments(id);
            }
        }
        await this.db.question.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });
        if (status === QuestionStatus.APPROVED) {
            createNotification({
                recipientRole: "ALL",
                title: "Question Set Approved",
                message: `${ids.length} question(s) were approved and published to the question bank.`,
                type: "INFO",
                link: "/question-bank",
            }).catch((err) => console.warn("Notification error:", err?.message));
        }
    }
    async bulkFeedbackQuestions(ids, feedback, user) {
        const canFeedback = user.role === "SUPERADMIN" ||
            user.role === "DEAN" ||
            user.role === "TEAMLEAD";
        if (!canFeedback) {
            throw new ApiError(403, "Only administrators and team leads can provide revision feedback.");
        }
        const targetQuestions = await this.db.question.findMany({
            where: { id: { in: ids } },
            select: { id: true, authorId: true, topic: true },
        });
        await this.db.question.updateMany({
            where: { id: { in: ids } },
            data: {
                status: QuestionStatus.PENDING_REVISION,
            },
        });
        const reviewerName = user?.name || "Reviewer";
        createNotification({
            recipientRole: "ALL",
            title: "Revision Requested",
            message: `Revision feedback was provided for ${ids.length} question(s) by ${reviewerName}.`,
            type: "WARNING",
            link: "/question-bank?view=my-questions",
        }).catch((err) => console.warn("Notification error:", err?.message));
        // Notify authors individually via in-app & email
        const uniqueAuthorIds = Array.from(new Set(targetQuestions.map((q) => q.authorId).filter(Boolean)));
        for (const authorId of uniqueAuthorIds) {
            const authorQuestions = targetQuestions.filter((q) => q.authorId === authorId);
            const notifMsg = `Revision feedback was provided for ${authorQuestions.length} of your question(s) by ${reviewerName}.`;
            createNotification({
                recipientId: authorId,
                title: "Revision Requested",
                message: notifMsg,
                type: "WARNING",
                link: "/question-bank?view=my-questions",
            }).catch(() => { });
            (async () => {
                try {
                    const author = await this.db.adminUser.findUnique({
                        where: { id: authorId },
                        select: { email: true, name: true, notificationPreferences: true },
                    });
                    if (author?.email) {
                        const prefs = author.notificationPreferences;
                        const emailAllowed = prefs?.emailNotifications !== false;
                        if (emailAllowed) {
                            await sendQuestionStatusNotificationEmail({
                                toEmail: author.email,
                                userName: author.name,
                                status: "PENDING_REVISION",
                                message: notifMsg,
                                feedback: feedback,
                                linkUrl: `${process.env.ADMIN_URL || "http://localhost:5173"}/question-bank?view=my-questions`,
                            });
                        }
                    }
                }
                catch (err) {
                    console.warn("Failed to dispatch revision email notification:", err?.message);
                }
            })();
        }
    }
    async getPendingReviewAuthors(options) {
        const pendingQuestions = await this.db.question.findMany({
            where: {
                status: {
                    in: [QuestionStatus.PENDING_REVIEW, QuestionStatus.PENDING_REVISION],
                },
            },
            select: {
                id: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const authorIds = Array.from(new Set(pendingQuestions.map((q) => q.authorId).filter(Boolean)));
        const authorWhere = { id: { in: authorIds } };
        if (options?.search && options.search.trim()) {
            const q = options.search.trim();
            authorWhere.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
            ];
        }
        const authors = await this.db.adminUser.findMany({
            where: authorWhere,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        const result = authors.map((author) => {
            const authorQuestions = pendingQuestions.filter((q) => q.authorId === author.id);
            const latestSubmissionAt = authorQuestions.reduce((latest, q) => {
                const date = q.updatedAt || q.createdAt;
                return !latest || new Date(date) > new Date(latest)
                    ? date
                    : latest;
            }, null);
            return {
                ...author,
                pendingCount: authorQuestions.length,
                latestSubmissionAt,
            };
        });
        const matchedAuthorIds = new Set(authors.map((a) => a.id));
        const unassignedQuestions = pendingQuestions.filter((q) => !q.authorId || !matchedAuthorIds.has(q.authorId));
        if (unassignedQuestions.length > 0) {
            const latestSubmissionAt = unassignedQuestions.reduce((latest, q) => {
                const date = q.updatedAt || q.createdAt;
                return !latest || new Date(date) > new Date(latest)
                    ? date
                    : latest;
            }, null);
            result.push({
                id: "unassigned",
                name: "Unassigned Submissions",
                email: "system@boardquest.internal",
                role: "SYSTEM",
                pendingCount: unassignedQuestions.length,
                latestSubmissionAt,
            });
        }
        return result.sort((a, b) => b.pendingCount - a.pendingCount);
    }
    async getQuestionComments(questionId) {
        const question = await this.db.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new ApiError(404, "Question not found");
        }
        const comments = await this.db.questionComment.findMany({
            where: { questionId },
            orderBy: { createdAt: "asc" },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        return comments;
    }
    async createQuestionComment(questionId, authorId, content) {
        if (!content || !content.trim()) {
            throw new ApiError(400, "Comment content cannot be empty");
        }
        const question = await this.db.question.findUnique({
            where: { id: questionId },
        });
        if (!question) {
            throw new ApiError(404, "Question not found");
        }
        const comment = await this.db.questionComment.create({
            data: {
                questionId,
                authorId,
                content: content.trim(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        const commenter = comment.author;
        const commenterRole = commenter?.role;
        const isReviewer = commenterRole === "SUPERADMIN" ||
            commenterRole === "DEAN" ||
            commenterRole === "TEAMLEAD";
        const isApprovedReopened = question.status === QuestionStatus.APPROVED && isReviewer;
        // If an approved question receives a comment from an admin reviewer,
        // transition it back to PENDING_REVISION so it appears on the review questions page
        if (isApprovedReopened) {
            await this.db.question.update({
                where: { id: questionId },
                data: { status: QuestionStatus.PENDING_REVISION },
            });
        }
        // Notify author if comment is from another reviewer/user
        if (question.authorId && question.authorId !== authorId) {
            try {
                const roleLabel = commenterRole === "SUPERADMIN"
                    ? "Super Administrator"
                    : commenterRole === "DEAN"
                        ? "Dean"
                        : commenterRole === "TEAMLEAD"
                            ? "Team Lead"
                            : commenterRole || "Reviewer";
                const commenterName = commenter?.name || "A reviewer";
                const contentSnippet = content.trim().length > 60
                    ? content.trim().slice(0, 60) + "..."
                    : content.trim();
                await createNotification({
                    recipientId: question.authorId,
                    title: isApprovedReopened
                        ? "Revision Requested on Approved Question"
                        : "New Comment on Question",
                    message: isApprovedReopened
                        ? `${commenterName} (${roleLabel}) requested revisions on your approved question: "${contentSnippet}". It has been returned to the review queue.`
                        : `${commenterName} (${roleLabel}) commented on your question: "${contentSnippet}"`,
                    type: isApprovedReopened ? "WARNING" : "INFO",
                    link: `/question-bank/view/${questionId}`,
                });
                // Dispatch email notification to question author
                (async () => {
                    try {
                        const author = await this.db.adminUser.findUnique({
                            where: { id: question.authorId },
                            select: { email: true, name: true, notificationPreferences: true },
                        });
                        if (author?.email) {
                            const prefs = author.notificationPreferences;
                            const emailAllowed = prefs?.emailNotifications !== false;
                            if (emailAllowed) {
                                await sendQuestionStatusNotificationEmail({
                                    toEmail: author.email,
                                    userName: author.name,
                                    status: isApprovedReopened ? "PENDING_REVISION" : "COMMENT",
                                    questionTitle: question.topic || "Question",
                                    message: isApprovedReopened
                                        ? `${commenterName} (${roleLabel}) requested revisions on your approved question.`
                                        : `${commenterName} (${roleLabel}) commented on your question.`,
                                    feedback: content.trim(),
                                    linkUrl: `${process.env.ADMIN_URL || "http://localhost:5173"}/question-bank/view/${questionId}`,
                                });
                            }
                        }
                    }
                    catch (emailErr) {
                        console.warn("Failed to dispatch comment email notification:", emailErr?.message);
                    }
                })();
            }
            catch (err) {
                // notification failure shouldn't block comment creation
            }
        }
        await this.syncQuestionRevisionStatus(questionId);
        return comment;
    }
    async deleteQuestionComment(questionId, commentId, userId, userRole) {
        const comment = await this.db.questionComment.findUnique({
            where: { id: commentId },
        });
        if (!comment || comment.questionId !== questionId) {
            throw new ApiError(404, "Comment not found");
        }
        const isAuthor = comment.authorId === userId;
        const isAdminOrLead = ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(userRole);
        if (!isAuthor && !isAdminOrLead) {
            throw new ApiError(403, "You do not have permission to delete this comment");
        }
        await this.db.questionComment.delete({
            where: { id: commentId },
        });
        await this.syncQuestionRevisionStatus(questionId);
        return { message: "Comment deleted successfully" };
    }
    async checkUnresolvedComments(questionId) {
        const unresolvedCount = await this.db.questionComment.count({
            where: {
                questionId,
                isResolved: false,
            },
        });
        if (unresolvedCount > 0) {
            throw new ApiError(400, `Cannot resubmit question while there ${unresolvedCount === 1 ? "is 1 unresolved comment" : `are ${unresolvedCount} unresolved comments`}. Please resolve all comments first.`);
        }
    }
    async toggleResolveComment(questionId, commentId, isResolved) {
        const comment = await this.db.questionComment.findUnique({
            where: { id: commentId },
        });
        if (!comment || comment.questionId !== questionId) {
            throw new ApiError(404, "Comment not found");
        }
        const nextState = isResolved !== undefined ? isResolved : !comment.isResolved;
        const updatedComment = await this.db.questionComment.update({
            where: { id: commentId },
            data: { isResolved: nextState },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        await this.syncQuestionRevisionStatus(questionId);
        return updatedComment;
    }
    async syncQuestionRevisionStatus(questionId) {
        const question = await this.db.question.findUnique({
            where: { id: questionId },
        });
        if (!question)
            return;
        const unresolvedCount = await this.db.questionComment.count({
            where: {
                questionId,
                isResolved: false,
            },
        });
        if (unresolvedCount > 0) {
            if (question.status === QuestionStatus.PENDING_REVIEW) {
                await this.db.question.update({
                    where: { id: questionId },
                    data: { status: QuestionStatus.PENDING_REVISION },
                });
            }
        }
        else {
            if (question.status === QuestionStatus.PENDING_REVISION) {
                await this.db.question.update({
                    where: { id: questionId },
                    data: { status: QuestionStatus.PENDING_REVIEW },
                });
            }
        }
    }
    async bulkParaphraseQuestions(items) {
        if (items.length > 5) {
            throw new ApiError(400, "Bulk paraphrasing is limited to a maximum of 5 questions per batch.");
        }
        return await questionParaphraserService.paraphraseBatch(items);
    }
    async bulkApplyParaphrase(updates, user) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new ApiError(400, "Updates array must not be empty");
        }
        if (updates.length > 5) {
            throw new ApiError(400, "Bulk paraphrasing is limited to a maximum of 5 questions per batch.");
        }
        const ids = updates.map((u) => u.id);
        const existingQuestions = await this.db.question.findMany({
            where: { id: { in: ids } },
        });
        const isPrivileged = user.role === "SUPERADMIN" ||
            user.role === "DEAN" ||
            user.role === "TEAMLEAD";
        const updateMap = new Map();
        updates.forEach((u) => {
            if (u.id && u.question && u.question.trim().length > 0) {
                updateMap.set(u.id, u.question.trim());
            }
        });
        const updatedList = [];
        for (const q of existingQuestions) {
            const isAuthor = q.authorId && q.authorId === user.id;
            if (!isPrivileged && !isAuthor) {
                throw new ApiError(403, `You do not have permission to modify question ID ${q.id}`);
            }
            if (user.role === "TEACHER" && q.status === QuestionStatus.APPROVED) {
                throw new ApiError(403, "Approved questions cannot be modified by teachers.");
            }
            const newStem = updateMap.get(q.id);
            if (newStem && newStem !== q.question) {
                const updated = await this.db.question.update({
                    where: { id: q.id },
                    data: {
                        question: newStem,
                        ...(user.role === "TEACHER" &&
                            q.status !== QuestionStatus.PENDING_REVIEW
                            ? { status: QuestionStatus.PENDING_REVIEW }
                            : {}),
                    },
                });
                updatedList.push(updated);
            }
        }
        if (updatedList.length > 0) {
            try {
                const eventPayload = {
                    type: "QUESTIONS_UPDATED",
                    count: updatedList.length,
                    updatedIds: updatedList.map((u) => u.id),
                };
                sseService.broadcastEvent("questions-updated", eventPayload);
                pusherService.broadcastEvent("admin-events", "questions-updated", eventPayload);
            }
            catch (err) {
                console.warn("Broadcast error:", err);
            }
        }
        return updatedList;
    }
}
export const questionService = new QuestionService();
export const createNewQuestion = questionService.createNewQuestion.bind(questionService);
export const updateQuestion = questionService.updateQuestion.bind(questionService);
export const getAllQuestions = questionService.getAllQuestions.bind(questionService);
export const getFilteredQuestions = questionService.getFilteredQuestions.bind(questionService);
export const getQuestionById = questionService.getQuestionById.bind(questionService);
export const deleteQuestion = questionService.deleteQuestion.bind(questionService);
export const getQuestionsByCategory = questionService.getQuestionsByCategory.bind(questionService);
export const getQuestionByDifficulty = questionService.getQuestionByDifficulty.bind(questionService);
export const getQuestionByType = questionService.getQuestionByType.bind(questionService);
export const getQuestionByStatus = questionService.getQuestionByStatus.bind(questionService);
export const getQuestionBySearch = questionService.getQuestionBySearch.bind(questionService);
export const importQuestions = questionService.importQuestions.bind(questionService);
export const bulkDeleteQuestions = questionService.bulkDeleteQuestions.bind(questionService);
export const bulkApproveQuestions = questionService.bulkApproveQuestions.bind(questionService);
export const bulkUpdateStatusQuestions = questionService.bulkUpdateStatusQuestions.bind(questionService);
export const bulkFeedbackQuestions = questionService.bulkFeedbackQuestions.bind(questionService);
export const synthesizeQuestion = questionService.synthesizeQuestion.bind(questionService);
export const createSynthesizedQuestion = questionService.createSynthesizedQuestion.bind(questionService);
export const bulkParaphraseQuestions = questionService.bulkParaphraseQuestions.bind(questionService);
export const bulkApplyParaphrase = questionService.bulkApplyParaphrase.bind(questionService);
export const getPendingReviewAuthors = questionService.getPendingReviewAuthors.bind(questionService);
export const getQuestionStats = questionService.getQuestionStats.bind(questionService);
export const getQuestionComments = questionService.getQuestionComments.bind(questionService);
export const createQuestionComment = questionService.createQuestionComment.bind(questionService);
export const deleteQuestionComment = questionService.deleteQuestionComment.bind(questionService);
export const toggleResolveComment = questionService.toggleResolveComment.bind(questionService);
