import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import {
  QuestionDifficulty,
  QuestionType,
  QuestionStatus,
} from "../../../generated/prisma/enums";
import { questionSynthesizerService, SynthesizeQuestionInput } from "./questionSynthesizer.service";

// ============ Validation Schemas ============

export const CreateQuestionSchema = z.object({
  question: z.string().min(1, "Question title is required"),
  choices: z.array(z.string()).optional().default([]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  categoryId: z.string().min(1, "Question category is required"),
  authorId: z.string().optional(),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.preprocess(
    (val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val),
    z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM)
  ),
  type: z.preprocess(
    (val) => (val === "" || !val ? QuestionType.MCQ : val),
    z.nativeEnum(QuestionType).default(QuestionType.MCQ)
  ),
  status: z.preprocess(
    (val) => (val === "" || !val ? QuestionStatus.PENDING_REVIEW : val),
    z.nativeEnum(QuestionStatus).default(QuestionStatus.PENDING_REVIEW)
  ),
  isPublished: z.boolean().optional().default(false),
});

export const UpdateQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  question: z.string().min(1, "Question title is required"),
  choices: z.array(z.string()).optional().default([]),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  categoryId: z.string().min(1, "Question category is required"),
  authorId: z.string().optional(),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.preprocess(
    (val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val),
    z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM)
  ),
  type: z.preprocess(
    (val) => (val === "" || !val ? QuestionType.MCQ : val),
    z.nativeEnum(QuestionType).default(QuestionType.MCQ)
  ),
  status: z.preprocess(
    (val) => (val === "" || !val ? QuestionStatus.PENDING_REVIEW : val),
    z.nativeEnum(QuestionStatus).default(QuestionStatus.PENDING_REVIEW)
  ),
  isPublished: z.boolean().optional(),
});

// ============ Type Definitions ============

export type CreateNewQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export interface ImportedQuestion {
  question: string;
  choices: string[];
  correctAnswer: string;
  topic: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  feedback?: string;
}

// ============ Question Services ============

export class QuestionService {
  constructor(private readonly db: typeof prisma = prisma) {}

  async createNewQuestion(data: CreateNewQuestionInput) {
    const parsed = CreateQuestionSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const {
      question,
      choices,
      correctAnswer,
      categoryId,
      authorId,
      topic,
      difficulty,
      type,
      status,
      isPublished,
    } = parsed.data;

    let finalAuthorId: string = authorId || "";
    const isValidObjectId = (id?: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
    if (!isValidObjectId(finalAuthorId)) {
      const existingAdmin = await this.db.adminUser.findFirst();
      finalAuthorId = existingAdmin?.id || "507f1f77bcf86cd799439011";
    }

    // Automatically assign review status in the background based on author's role
    let computedStatus: QuestionStatus = QuestionStatus.PENDING_REVIEW;
    if (finalAuthorId) {
      const authorUser = await this.db.adminUser.findUnique({ where: { id: finalAuthorId } });
      if (authorUser?.role === "SUPERADMIN" || authorUser?.role === "ADMIN") {
        computedStatus = status === QuestionStatus.DRAFT ? QuestionStatus.DRAFT : QuestionStatus.APPROVED;
      } else {
        computedStatus = status === QuestionStatus.DRAFT ? QuestionStatus.DRAFT : QuestionStatus.PENDING_REVIEW;
      }
    }

    const newQuestion = await this.db.question.create({
      data: {
        question: question.toLowerCase().trim(),
        choices,
        correctAnswer: correctAnswer.toLowerCase().trim(),
        categoryId: categoryId.trim(),
        authorId: finalAuthorId,
        topic: topic.trim(),
        difficulty,
        type,
        status: computedStatus,
        isPublished,
      },
    });

    return newQuestion;
  }

  async synthesizeQuestion(input: SynthesizeQuestionInput) {
    return await questionSynthesizerService.synthesizeQuestion(input);
  }

  async createSynthesizedQuestion(data: CreateNewQuestionInput) {
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

  async updateQuestion(questionId: string, data: UpdateQuestionInput) {
    const parsed = UpdateQuestionSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const existing = await this.getQuestionById(questionId);
    if (existing.isPublished) {
      throw new ApiError(400, "Published questions cannot be modified.");
    }

    const {
      question,
      choices,
      correctAnswer,
      categoryId,
      authorId,
      topic,
      difficulty,
      type,
      status,
      isPublished,
    } = parsed.data;

    const updatedQuestion = await this.db.question.update({
      where: {
        id: questionId,
      },
      data: {
        question: question.toLowerCase().trim(),
        choices,
        correctAnswer: correctAnswer.toLowerCase().trim(),
        categoryId: categoryId.trim(),
        authorId,
        topic: topic.trim(),
        difficulty,
        type,
        status,
        isPublished,
      },
    });

    return updatedQuestion;
  }

  async getAllQuestions(cursor?: string, limit?: number, authorId?: string) {
    const whereClause = authorId ? { authorId } : undefined;
    const limitNum = limit || 20;

    try {
      const questions = await this.db.question.findMany({
        where: whereClause,
        take: limit ? limitNum + 1 : undefined,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          category: true,
          author: { select: { name: true } },
        },
        orderBy: { id: "asc" },
      });

      if (!limit) return questions;

      const hasNextPage = questions.length > limitNum;
      if (hasNextPage) questions.pop();

      const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
      return { questions, nextCursor, hasNextPage };
    } catch (err: any) {
      console.warn("getAllQuestions relation include failed, falling back to safe query:", err?.message);
      const questions = await this.db.question.findMany({
        where: whereClause,
        take: limit ? limitNum + 1 : undefined,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        include: { category: true },
        orderBy: { id: "asc" },
      });

      const formatted = questions.map((q: any) => ({
        ...q,
        author: { name: "System Administrator" },
      }));

      if (!limit) return formatted;

      const hasNextPage = formatted.length > limitNum;
      if (hasNextPage) formatted.pop();

      const nextCursor = formatted.length > 0 ? formatted[formatted.length - 1].id : null;
      return { questions: formatted, nextCursor, hasNextPage };
    }
  }

  async getFilteredQuestions(
    search?: string,
    difficulty?: QuestionDifficulty,
    category?: string,
    type?: QuestionType,
    status?: QuestionStatus,
    cursor?: string,
    limit?: number,
    authorId?: string,
    isPublished?: boolean,
    schoolYear?: string,
  ) {
    const whereClause: any = {
      question: search ? { contains: search } : undefined,
      difficulty,
      categoryId: category,
      type,
      status,
      authorId,
      isPublished,
      ...(schoolYear && schoolYear !== "ALL" && { schoolYear }),
    };

    const limitNum = limit || 20;

    try {
      const questions = await this.db.question.findMany({
        where: whereClause,
        take: limit ? limitNum + 1 : undefined,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          category: true,
          author: { select: { name: true } },
        },
        orderBy: { id: "asc" },
      });

      if (!limit) return questions;

      const hasNextPage = questions.length > limitNum;
      if (hasNextPage) questions.pop();

      const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;
      return { questions, nextCursor, hasNextPage };
    } catch (err: any) {
      console.warn("getFilteredQuestions relation include failed, falling back to safe query:", err?.message);
      const questions = await this.db.question.findMany({
        where: whereClause,
        take: limit ? limitNum + 1 : undefined,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        include: { category: true },
        orderBy: { id: "asc" },
      });

      const formatted = questions.map((q: any) => ({
        ...q,
        author: { name: "System Administrator" },
      }));

      if (!limit) return formatted;

      const hasNextPage = formatted.length > limitNum;
      if (hasNextPage) formatted.pop();

      const nextCursor = formatted.length > 0 ? formatted[formatted.length - 1].id : null;
      return { questions: formatted, nextCursor, hasNextPage };
    }
  }

  async getQuestionStats(authorId?: string) {
    const isValidObjectId = (id?: string) => Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
    const targetAuthorId = isValidObjectId(authorId) ? authorId : undefined;

    const [
      totalQuestions,
      publishedQuestions,
      pendingReviewQuestions,
      teacherAuthoredCount,
      teacherPublishedCount,
      teacherDraftCount,
    ] = await Promise.all([
      this.db.question.count(),
      this.db.question.count({
        where: {
          OR: [{ isPublished: true }, { status: QuestionStatus.APPROVED }],
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
              OR: [{ isPublished: true }, { status: QuestionStatus.APPROVED }],
            },
          })
        : Promise.resolve(0),
      targetAuthorId
        ? this.db.question.count({
            where: {
              authorId: targetAuthorId,
              isPublished: false,
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



  async getQuestionById(questionId: string) {
    const question = await this.db.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        category: true,
      },
    });

    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    return question;
  }

  async deleteQuestion(questionId: string) {
    try {
      const existingQuestion = await this.db.question.findUnique({
        where: {
          id: questionId.trim(),
        },
      });

      if (!existingQuestion) {
        throw new ApiError(404, "Question not found");
      }

      if (existingQuestion.isPublished) {
        throw new ApiError(400, "Published questions cannot be deleted.");
      }

      const deletedQuestion = await this.db.question.delete({
        where: {
          id: questionId.trim(),
        },
      });

      return deletedQuestion;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  }

  async getQuestionsByCategory(categoryId: string) {
    const questions = await this.db.question.findMany({
      where: {
        categoryId,
      },
      include: {
        category: true,
      },
    });

    if (questions.length === 0) {
      throw new ApiError(404, "No questions found for this category");
    }

    return questions;
  }

  async getQuestionByDifficulty(difficulty: QuestionDifficulty) {
    const questions = await this.db.question.findMany({
      where: {
        difficulty,
      },
    });
    return questions;
  }

  async getQuestionByType(type: QuestionType) {
    const questions = await this.db.question.findMany({
      where: {
        type,
      },
    });
    return questions;
  }

  async getQuestionByStatus(status: QuestionStatus) {
    const questions = await this.db.question.findMany({
      where: {
        status,
      },
    });
    return questions;
  }

  async getQuestionBySearch(search: string) {
    const questions = await this.db.question.findMany({
      where: {
        question: {
          contains: search,
        },
      },
    });
    return questions;
  }

  async importQuestions(
    questions: ImportedQuestion[],
    categoryId: string,
    authorId: string,
    status: QuestionStatus = QuestionStatus.DRAFT,
  ) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, "No questions provided for import");
    }

    const queries = questions.map((q) => {
      let choices = q.choices || [];
      if (q.type === QuestionType.TRUE_FALSE && choices.length === 0) {
        choices = ["True", "False"];
      }

      return this.db.question.create({
        data: {
          question: q.question.toLowerCase().trim(),
          choices: choices.map((c) => c.trim()),
          correctAnswer: q.correctAnswer.toLowerCase().trim(),
          categoryId: categoryId.trim(),
          authorId,
          topic: q.topic.trim(),
          difficulty: q.difficulty,
          type: q.type,
          status,
          feedback: q.feedback?.trim() || "",
        },
      });
    });

    const createdQuestions = await this.db.$transaction(queries);
    return createdQuestions;
  }

  async togglePublishState(questionId: string, isPublished: boolean) {
    const question = await this.getQuestionById(questionId);

    // Enforce business logic: only APPROVED questions can be published
    if (isPublished && question.status !== QuestionStatus.APPROVED) {
      throw new ApiError(400, "Only approved questions can be published.");
    }

    const updated = await this.db.question.update({
      where: { id: questionId },
      data: { isPublished },
    });
    return updated;
  }

  async bulkDeleteQuestions(ids: string[], user: any) {
    const questions = await this.db.question.findMany({
      where: { id: { in: ids } },
    });

    for (const question of questions) {
      const isAuthor = question.authorId === user.id;
      const canDelete =
        user.role === "SUPERADMIN" ||
        user.role === "ADMIN" ||
        (user.role === "TEACHER" && isAuthor);
      if (!canDelete) {
        throw new ApiError(
          403,
          `You do not have permission to delete question Q-${question.id.slice(-4).toUpperCase()}`,
        );
      }
      if (question.isPublished) {
        throw new ApiError(
          400,
          `Cannot delete published question Q-${question.id.slice(-4).toUpperCase()}`,
        );
      }
    }

    await this.db.question.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async bulkPublishQuestions(ids: string[], isPublished: boolean, user: any) {
    const canPublish =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      user.role === "TEAMLEAD";
    if (!canPublish) {
      throw new ApiError(
        403,
        "You do not have permission to publish/unpublish questions.",
      );
    }

    const questions = await this.db.question.findMany({
      where: { id: { in: ids } },
    });

    if (isPublished) {
      for (const question of questions) {
        if (question.status !== QuestionStatus.APPROVED) {
          throw new ApiError(
            400,
            `Only approved questions can be published (Q-${question.id.slice(-4).toUpperCase()} is not approved).`,
          );
        }
      }
    }

    await this.db.question.updateMany({
      where: { id: { in: ids } },
      data: { isPublished },
    });
  }

  async bulkFeedbackQuestions(ids: string[], feedback: string, user: any) {
    const canFeedback =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      user.role === "TEAMLEAD";
    if (!canFeedback) {
      throw new ApiError(
        403,
        "You do not have permission to request revision on questions.",
      );
    }

    const questions = await this.db.question.findMany({
      where: { id: { in: ids } },
    });

    for (const question of questions) {
      if (question.isPublished) {
        throw new ApiError(
          400,
          `Cannot request revision on published question Q-${question.id.slice(-4).toUpperCase()}.`,
        );
      }
    }

    await this.db.question.updateMany({
      where: { id: { in: ids } },
      data: {
        status: QuestionStatus.NEEDS_REVISION,
        feedback,
      },
    });

    try {
      const isValidObjectId = (id?: string) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
      const createdById = isValidObjectId(user?.id) ? user.id : undefined;

      await this.db.questionThatNeedsRevision.create({
        data: {
          questionIds: ids,
          feedback,
          createdById,
        },
      });
    } catch (err: any) {
      console.warn("Failed to create QuestionThatNeedsRevision record:", err?.message);
    }
  }

  async getQuestionsThatNeedRevision() {
    const revisionBatches = await this.db.questionThatNeedsRevision.findMany({
      orderBy: { createdAt: "desc" },
    });

    const allQuestionIds = revisionBatches.flatMap((r) => r.questionIds || []);

    const questions = await this.db.question.findMany({
      where: {
        id: { in: allQuestionIds },
        status: QuestionStatus.NEEDS_REVISION,
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    return {
      revisionBatches,
      questions,
    };
  }

  async updateRevisionFeedback(revisionId: string, feedback: string, user: any) {
    const revision = await this.db.questionThatNeedsRevision.findUnique({
      where: { id: revisionId },
    });
    if (!revision) {
      throw new ApiError(404, "Revision request record not found.");
    }

    const canModify =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      (revision.createdById && revision.createdById === user.id);

    if (!canModify) {
      throw new ApiError(403, "You can only modify revision feedback you created.");
    }

    await this.db.questionThatNeedsRevision.update({
      where: { id: revisionId },
      data: { feedback },
    });

    if (revision.questionIds && revision.questionIds.length > 0) {
      await this.db.question.updateMany({
        where: { id: { in: revision.questionIds } },
        data: { feedback },
      });
    }
  }

  async deleteRevisionFeedback(revisionId: string, user: any) {
    const revision = await this.db.questionThatNeedsRevision.findUnique({
      where: { id: revisionId },
    });
    if (!revision) {
      throw new ApiError(404, "Revision request record not found.");
    }

    const canModify =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      (revision.createdById && revision.createdById === user.id);

    if (!canModify) {
      throw new ApiError(403, "You can only delete revision feedback you created.");
    }

    await this.db.questionThatNeedsRevision.delete({
      where: { id: revisionId },
    });

    if (revision.questionIds && revision.questionIds.length > 0) {
      await this.db.question.updateMany({
        where: { id: { in: revision.questionIds } },
        data: {
          status: QuestionStatus.PENDING_REVIEW,
          feedback: "",
        },
      });
    }
  }

  async bulkApproveQuestions(ids: string[], user: any) {
    const canApprove =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      user.role === "TEAMLEAD";
    if (!canApprove) {
      throw new ApiError(
        403,
        "Only administrators and team leads can approve questions.",
      );
    }

    await this.db.question.updateMany({
      where: { id: { in: ids } },
      data: {
        status: QuestionStatus.APPROVED,
        feedback: "",
      },
    });
  }

  async bulkUpdateStatusQuestions(ids: string[], status: QuestionStatus, user: any) {
    const canManage =
      user.role === "SUPERADMIN" ||
      user.role === "ADMIN" ||
      user.role === "TEAMLEAD";
    if (!canManage) {
      throw new ApiError(
        403,
        "You do not have permission to update question status.",
      );
    }

    await this.db.question.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async getPendingReviewAuthors() {
    const pendingQuestions = await this.db.question.findMany({
      where: { status: QuestionStatus.PENDING_REVIEW },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
      },
    });

    const authorIds = Array.from(new Set(pendingQuestions.map((q) => q.authorId).filter(Boolean)));
    const authors = await this.db.adminUser.findMany({
      where: { id: { in: authorIds as string[] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    const result = authors.map((author) => {
      const authorQuestions = pendingQuestions.filter((q) => q.authorId === author.id);
      const latestSubmissionAt = authorQuestions.reduce((latest, q) => {
        return !latest || new Date(q.createdAt) > new Date(latest) ? q.createdAt : latest;
      }, null as Date | null);

      return {
        ...author,
        pendingCount: authorQuestions.length,
        latestSubmissionAt,
      };
    });

    return result.sort((a, b) => b.pendingCount - a.pendingCount);
  }
}

export const questionService = new QuestionService();

export const createNewQuestion =
  questionService.createNewQuestion.bind(questionService);
export const updateQuestion =
  questionService.updateQuestion.bind(questionService);
export const getAllQuestions =
  questionService.getAllQuestions.bind(questionService);
export const getFilteredQuestions =
  questionService.getFilteredQuestions.bind(questionService);
export const getQuestionById =
  questionService.getQuestionById.bind(questionService);
export const deleteQuestion =
  questionService.deleteQuestion.bind(questionService);
export const getQuestionsByCategory =
  questionService.getQuestionsByCategory.bind(questionService);
export const getQuestionByDifficulty =
  questionService.getQuestionByDifficulty.bind(questionService);
export const getQuestionByType =
  questionService.getQuestionByType.bind(questionService);
export const getQuestionByStatus =
  questionService.getQuestionByStatus.bind(questionService);
export const getQuestionBySearch =
  questionService.getQuestionBySearch.bind(questionService);
export const importQuestions =
  questionService.importQuestions.bind(questionService);
export const togglePublishState =
  questionService.togglePublishState.bind(questionService);
export const bulkDeleteQuestions =
  questionService.bulkDeleteQuestions.bind(questionService);
export const bulkPublishQuestions =
  questionService.bulkPublishQuestions.bind(questionService);
export const bulkFeedbackQuestions =
  questionService.bulkFeedbackQuestions.bind(questionService);
export const bulkApproveQuestions =
  questionService.bulkApproveQuestions.bind(questionService);
export const bulkUpdateStatusQuestions =
  questionService.bulkUpdateStatusQuestions.bind(questionService);
export const getQuestionsThatNeedRevision =
  questionService.getQuestionsThatNeedRevision.bind(questionService);
export const updateRevisionFeedback =
  questionService.updateRevisionFeedback.bind(questionService);
export const deleteRevisionFeedback =
  questionService.deleteRevisionFeedback.bind(questionService);
export const synthesizeQuestion =
  questionService.synthesizeQuestion.bind(questionService);
export const createSynthesizedQuestion =
  questionService.createSynthesizedQuestion.bind(questionService);
export const getPendingReviewAuthors =
  questionService.getPendingReviewAuthors.bind(questionService);
export const getQuestionStats =
  questionService.getQuestionStats.bind(questionService);

