import z from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

export const CreateQuestionSchema = z.object({
    question: z.string().min(1, "Question title is required"),
    choices: z.array(z.string()).min(1, "Question choices is required"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

export const UpdateQuestionSchema = z.object({
    id: z.string().min(1, "Question ID is required"),
    question: z.string().min(1, "Question title is required"),
    choices: z.array(z.string()).min(1, "Question choices is required"),
    correctAnswer: z.string().min(1, "Correct answer is required"),
    categoryId: z.string().min(1, "Question category is required"),
    authorId: z.string().min(1, "Author ID is required"),
});

type CreateNewQuestionInput = z.infer<typeof CreateQuestionSchema>;
type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export const createNewQuestion = async (data: CreateNewQuestionInput) => {
    const parsed = CreateQuestionSchema.safeParse(data);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { question, choices, correctAnswer, categoryId, authorId } = parsed.data;

    const newQuestion = await prisma.question.create({
        data: {
            question: question.toLowerCase().trim(),
            choices,
            correctAnswer: correctAnswer.toLowerCase().trim(),
            categoryId: categoryId.trim(),
            authorId,
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

    const { question, choices, correctAnswer, categoryId, authorId } = parsed.data;

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
        },
    });

    return updatedQuestion;
};

export const getAllQuestions = async () => {
    const questions = await prisma.question.findMany({
        include: {
            category: true,     
        },
    });
    return questions;
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