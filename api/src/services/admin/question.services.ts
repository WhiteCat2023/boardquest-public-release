import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { QuestionDifficulty, QuestionType, QuestionStatus } from "../../../generated/prisma/enums";

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
});

type CreateNewQuestionInput = z.infer<typeof CreateQuestionSchema>;
type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export const createNewQuestion = async (data: CreateNewQuestionInput) => {
    const parsed = CreateQuestionSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { question, choices, correctAnswer, categoryId, authorId, topic, difficulty, type, status } = parsed.data;

    const newQuestion = await prisma.question.create({
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
        },
    });

    return newQuestion;
};

export const updateQuestion = async (questionId: string, data: UpdateQuestionInput) => {
    const parsed = UpdateQuestionSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]   );
    }

    const { question, choices, correctAnswer, categoryId, authorId, topic, difficulty, type, status } = parsed.data;

    const updatedQuestion = await prisma.question.update({
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
        },
    });

    return updatedQuestion;
};

export const getAllQuestions = async (cursor?: string, limit?: number, authorId?: string) => {
    const whereClause = authorId ? { authorId } : undefined;

    if (cursor === undefined && limit === undefined) {
        const questions = await prisma.question.findMany({
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
    const questions = await prisma.question.findMany({
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
};

export const getFilteredQuestions = async (
    search?: string,
    difficulty?: QuestionDifficulty,
    category?: string,
    type?: QuestionType,
    status?: QuestionStatus,
    cursor?: string,
    limit?: number,
    authorId?: string
) => {
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
        const questions = await prisma.question.findMany({
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
    const questions = await prisma.question.findMany({
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
};

export const getQuestionById = async (questionId: string) => {
    const question = await prisma.question.findUnique({
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
};

export const deleteQuestion = async (questionId: string) => {
    try{
        const existingQuestion = await prisma.question.findUnique({
                where: {
                    id: questionId.trim(),
                },
            });

            if (!existingQuestion) {
                throw new ApiError(404, "Question not found");
            }

            const deletedQuestion = await prisma.question.delete({
                where: {
                    id: questionId.trim(),
                },
            })

            return deletedQuestion;
    }catch(error) {
        console.error("Error deleting question:", error);
        throw error;
    }
};

export const getQuestionsByCategory = async (categoryId: string) => {
    const questions = await prisma.question.findMany({
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
};

export const getQuestionByDifficulty = async (difficulty: QuestionDifficulty) => {
    const questions = await prisma.question.findMany({
        where: {
            difficulty,
        },
    });
    return questions;
};

export const getQuestionByType = async (type: QuestionType) => {
    const questions = await prisma.question.findMany({
        where: {
            type,
        },
    });
    return questions;
};

export const getQuestionByStatus = async (status: QuestionStatus) => {
    const questions = await prisma.question.findMany({
        where: {
            status,
        },
    });
    return questions;
};

export const getQuestionBySearch = async (search: string) => {
    const questions = await prisma.question.findMany({
        where: {
            question: {
                contains: search,
            },
        }, 
    });
    return questions;
};  