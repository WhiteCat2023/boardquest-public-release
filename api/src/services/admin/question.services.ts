import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { QuestionDifficulty, QuestionType, QuestionStatus } from "../../../generated/prisma/enums";

// ============ Validation Schemas ============

export const CreateQuestionSchema = z.object({
    question: z.string().min(1, "Question title is required"),
    choices: z.array(z.string()).min(1, "Question choices is required"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().min(1, "Author ID is required"),
    topic: z.string().min(1, "Topic is required"),
    difficulty: z.nativeEnum(QuestionDifficulty),
    type: z.nativeEnum(QuestionType),
    status: z.nativeEnum(QuestionStatus).optional().default(QuestionStatus.DRAFT),
    isPublished: z.boolean().optional().default(false),
});

export const UpdateQuestionSchema = z.object({
    id: z.string().min(1, "Question ID is required"),
    question: z.string().min(1, "Question title is required"),
    choices: z.array(z.string()).min(1, "Question choices is required"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().min(1, "Author ID is required"),
    topic: z.string().min(1, "Topic is required"),
    difficulty: z.nativeEnum(QuestionDifficulty),
    type: z.nativeEnum(QuestionType),
    status: z.nativeEnum(QuestionStatus),
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

    const { question, choices, correctAnswer, categoryId, authorId, topic, difficulty, type, status, isPublished } = parsed.data;

    const newQuestion = await this.db.question.create({
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

    return newQuestion;
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

    const { question, choices, correctAnswer, categoryId, authorId, topic, difficulty, type, status, isPublished } = parsed.data;

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

    if (cursor === undefined && limit === undefined) {
        const questions = await this.db.question.findMany({
            where: whereClause,
            include: {
                category: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: {
                id: "asc",
            },
        });
        return questions;
    }

    const limitNum = limit || 20;
    const questions = await this.db.question.findMany({
        where: whereClause,
        take: limitNum + 1,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? {
            id: cursor,
        } : undefined,
        include: {
            category: true,
            author: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            id: "asc",
        },
    });

    const hasNextPage = questions.length > limitNum;
    if (hasNextPage) {
        questions.pop();
    }

    const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;

    return {
        questions,
        nextCursor,
        hasNextPage,
    };
  }

  async getFilteredQuestions(
    search?: string,
    difficulty?: QuestionDifficulty,
    category?: string,
    type?: QuestionType,
    status?: QuestionStatus,
    cursor?: string,
    limit?: number,
    authorId?: string
  ) {
    const whereClause = {
        question: search ? {
            contains: search,
            mode: 'insensitive' as const,
        } : undefined,
        difficulty,
        categoryId: category,
        type,
        status,
        authorId,
    };

    if (cursor === undefined && limit === undefined) {
        const questions = await this.db.question.findMany({
            where: whereClause,
            include: {
                category: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            },
            take: 20,
            orderBy: {
                id: "asc",
            },
        });
        return questions;
    }

    const limitNum = limit || 20;
    const questions = await this.db.question.findMany({
        where: whereClause,
        take: limitNum + 1,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? {
            id: cursor,
        } : undefined,
        include: {
            category: true,
            author: {
                select: {
                    name: true,
                }
            }
        },
        orderBy: {
            id: "asc",
        },
    });

    const hasNextPage = questions.length > limitNum;
    if (hasNextPage) {
        questions.pop();
    }

    const nextCursor = questions.length > 0 ? questions[questions.length - 1].id : null;

    return {
        questions,
        nextCursor,
        hasNextPage,
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
    } catch(error) {
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

    if(questions.length === 0) {
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
    status: QuestionStatus = QuestionStatus.DRAFT
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
          choices: choices.map(c => c.trim()),
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
export const togglePublishState = questionService.togglePublishState.bind(questionService);