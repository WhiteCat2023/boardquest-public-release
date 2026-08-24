import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import {
  QuestionDifficulty,
  QuestionType,
} from "../../types/prisma.types";
import {
  questionSynthesizerService,
  SynthesizeQuestionInput,
} from "./questionSynthesizer.service";
import { createNotification } from "./notification.service";

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
  difficulty: z.preprocess(
    (val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val),
    z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM),
  ),
  type: z.preprocess(
    (val) => (val === "" || !val ? QuestionType.MCQ : val),
    z.nativeEnum(QuestionType).default(QuestionType.MCQ),
  ),
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
  difficulty: z.preprocess(
    (val) => (val === "" || !val ? QuestionDifficulty.MEDIUM : val),
    z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM),
  ),
  type: z.preprocess(
    (val) => (val === "" || !val ? QuestionType.MCQ : val),
    z.nativeEnum(QuestionType).default(QuestionType.MCQ),
  ),
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
      imageUrl,
      choices,
      choiceImages,
      correctAnswer,
      categoryId,
      authorId,
      topic,
      difficulty,
      type,
    } = parsed.data;

    let finalAuthorId: string = authorId || "";
    const isValidObjectId = (id?: string) =>
      Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
    if (!isValidObjectId(finalAuthorId)) {
      const existingAdmin = await this.db.adminUser.findFirst();
      finalAuthorId = existingAdmin?.id || "507f1f77bcf86cd799439011";
    }

    if (finalAuthorId) {
      const authorUser = await this.db.adminUser.findUnique({
        where: { id: finalAuthorId },
      });
      if (
        authorUser?.role === "TEACHER" &&
        authorUser?.handledCategoryIds?.length
      ) {
        if (!authorUser.handledCategoryIds.includes(categoryId)) {
          throw new ApiError(
            403,
            "Teachers can only create questions for subjects assigned to them.",
          );
        }
      }
    }

    const newQuestion = await this.db.question.create({
      data: {
        question: question.toLowerCase().trim(),
        imageUrl: imageUrl || null,
        choices,
        choiceImages: choiceImages || [],
        correctAnswer: correctAnswer.toLowerCase().trim(),
        categoryId: categoryId.trim(),
        authorId: finalAuthorId,
        topic: topic.trim(),
        difficulty,
        type,
      },
    });

    createNotification({
      recipientRole: "ALL",
      title: "New Question Added",
      message: `A new question for topic "${topic}" was added to the question bank.`,
      type: "INFO",
      link: "/question-bank",
    }).catch((err) => console.warn("Notification error:", err?.message));

    return newQuestion;
  }

  async synthesizeQuestion(input: SynthesizeQuestionInput) {
    return await questionSynthesizerService.synthesizeQuestion(input);
  }

  async createSynthesizedQuestion(data: CreateNewQuestionInput) {
    const synthesizedList = await questionSynthesizerService.synthesizeQuestion(
      {
        question: data.question,
        choices: data.choices,
        correctAnswer: data.correctAnswer,
        topic: data.topic,
        targetDifficulty: data.difficulty,
        type: data.type,
        count: 5,
      },
    );

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

    const {
      question,
      imageUrl,
      choices,
      choiceImages,
      correctAnswer,
      categoryId,
      authorId,
      topic,
      difficulty,
      type,
    } = parsed.data;

    const updatedQuestion = await this.db.question.update({
      where: {
        id: questionId,
      },
      data: {
        question: question.toLowerCase().trim(),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        choices,
        ...(choiceImages !== undefined && { choiceImages }),
        correctAnswer: correctAnswer.toLowerCase().trim(),
        categoryId: categoryId.trim(),
        authorId,
        topic: topic.trim(),
        difficulty,
        type,
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

      const nextCursor =
        questions.length > 0 ? questions[questions.length - 1].id : null;
      return { questions, nextCursor, hasNextPage };
    } catch (err: any) {
      console.warn(
        "getAllQuestions relation include failed, falling back to safe query:",
        err?.message,
      );
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

      const nextCursor =
        formatted.length > 0 ? formatted[formatted.length - 1].id : null;
      return { questions: formatted, nextCursor, hasNextPage };
    }
  }

  async getFilteredQuestions(
    search?: string,
    difficulty?: QuestionDifficulty,
    category?: string,
    type?: QuestionType,
    cursor?: string,
    limit?: number,
    authorId?: string,
    isPublished?: boolean,
    schoolYear?: string,
    handledCategoryIds?: string[],
    userRole?: string,
  ) {
    let categoryFilter: any = category;
    if (userRole === "TEACHER" && !category && handledCategoryIds?.length) {
      categoryFilter = { in: handledCategoryIds };
    }

    const whereClause: any = {
      question: search ? { contains: search } : undefined,
      difficulty,
      categoryId: categoryFilter,
      type,
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

      const nextCursor =
        questions.length > 0 ? questions[questions.length - 1].id : null;
      return { questions, nextCursor, hasNextPage };
    } catch (err: any) {
      console.warn(
        "getFilteredQuestions relation include failed, falling back to safe query:",
        err?.message,
      );
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

      const nextCursor =
        formatted.length > 0 ? formatted[formatted.length - 1].id : null;
      return { questions: formatted, nextCursor, hasNextPage };
    }
  }

  async getQuestionStats(authorId?: string) {
    const isValidObjectId = (id?: string) =>
      Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));
    const targetAuthorId = isValidObjectId(authorId) ? authorId : undefined;

    const [
      totalQuestions,
      teacherAuthoredCount,
    ] = await Promise.all([
      this.db.question.count(),
      targetAuthorId
        ? this.db.question.count({ where: { authorId: targetAuthorId } })
        : Promise.resolve(0),
    ]);

    return {
      totalQuestions,
      publishedQuestions: totalQuestions,
      pendingReviewQuestions: 0,
      teacherAuthoredCount,
      teacherPublishedCount: teacherAuthoredCount,
      teacherDraftCount: 0,
    };
  }

  async getQuestionById(questionId: string) {
    const question = await this.db.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
      },
    });

    if (!question) {
      throw new ApiError(404, "Question not found");
    }

    return question;
  }

  async deleteQuestion(questionId: string) {
    const question = await this.db.question.delete({
      where: {
        id: questionId,
      },
    });
    return question;
  }

  async getQuestionsByCategory(categoryId: string) {
    const questions = await this.db.question.findMany({
      where: {
        categoryId,
      },
    });
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
        },
      });
    });

    const createdQuestions = await this.db.$transaction(queries);

    createNotification({
      recipientRole: "ALL",
      title: "Bulk Questions Uploaded",
      message: `${createdQuestions.length} new question(s) were added to the question bank.`,
      type: "INFO",
      link: "/question-bank",
    }).catch((err) => console.warn("Notification error:", err?.message));

    return createdQuestions;
  }

  async bulkDeleteQuestions(ids: string[], user: any) {
    const questions = await this.db.question.findMany({
      where: { id: { in: ids } },
    });

    for (const question of questions) {
      const isAuthor = question.authorId === user.id;
      const canDelete =
        user.role === "SUPERADMIN" ||
        user.role === "DEAN" ||
        user.role === "TEAMLEAD" ||
        (user.role === "TEACHER" && isAuthor);
      if (!canDelete) {
        throw new ApiError(
          403,
          `You do not have permission to delete question Q-${question.id.slice(-4).toUpperCase()}`,
        );
      }
    }

    await this.db.question.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async getQuestionComments(questionId: string) {
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

  async createQuestionComment(
    questionId: string,
    authorId: string,
    content: string,
  ) {
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

    if (question.authorId && question.authorId !== authorId) {
      try {
        const commenter = comment.author;
        const commenterRole = commenter?.role;
        const roleLabel =
          commenterRole === "SUPERADMIN"
            ? "Super Administrator"
            : commenterRole === "DEAN"
              ? "Dean"
              : commenterRole === "TEAMLEAD"
                ? "Team Lead"
                : commenterRole || "Reviewer";

        const commenterName = commenter?.name || "A faculty member";
        const contentSnippet =
          content.trim().length > 60
            ? content.trim().slice(0, 60) + "..."
            : content.trim();

        await createNotification({
          recipientId: question.authorId,
          title: "New Comment on Question",
          message: `${commenterName} (${roleLabel}) commented on your question: "${contentSnippet}"`,
          type: "INFO",
          link: `/question-bank/view/${questionId}`,
        });
      } catch (err) {
        // notification failure shouldn't block comment creation
      }
    }

    return comment;
  }

  async deleteQuestionComment(
    questionId: string,
    commentId: string,
    userId: string,
    userRole: string,
  ) {
    const comment = await this.db.questionComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.questionId !== questionId) {
      throw new ApiError(404, "Comment not found");
    }

    const isAuthor = comment.authorId === userId;
    const isAdminOrLead = ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(userRole);

    if (!isAuthor && !isAdminOrLead) {
      throw new ApiError(
        403,
        "You do not have permission to delete this comment",
      );
    }

    await this.db.questionComment.delete({
      where: { id: commentId },
    });

    return { message: "Comment deleted successfully" };
  }

  async toggleResolveComment(
    questionId: string,
    commentId: string,
    isResolved?: boolean,
  ) {
    const comment = await this.db.questionComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.questionId !== questionId) {
      throw new ApiError(404, "Comment not found");
    }

    const nextState =
      isResolved !== undefined ? isResolved : !comment.isResolved;

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

    return updatedComment;
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
export const getQuestionBySearch =
  questionService.getQuestionBySearch.bind(questionService);
export const importQuestions =
  questionService.importQuestions.bind(questionService);
export const bulkDeleteQuestions =
  questionService.bulkDeleteQuestions.bind(questionService);
export const synthesizeQuestion =
  questionService.synthesizeQuestion.bind(questionService);
export const createSynthesizedQuestion =
  questionService.createSynthesizedQuestion.bind(questionService);
export const getQuestionStats =
  questionService.getQuestionStats.bind(questionService);
export const getQuestionComments =
  questionService.getQuestionComments.bind(questionService);
export const createQuestionComment =
  questionService.createQuestionComment.bind(questionService);
export const deleteQuestionComment =
  questionService.deleteQuestionComment.bind(questionService);
export const toggleResolveComment =
  questionService.toggleResolveComment.bind(questionService);
