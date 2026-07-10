import * as QuesitonServices from "../../services/admin/question.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { Request, Response } from "express";
import { QuestionDifficulty, QuestionType, QuestionStatus } from "../../../generated/prisma/enums";

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
    const question = await QuesitonServices.createNewQuestion(req.body);
    return new ApiResponse(201, { question }, "Question created successfully").send(res);
}); 

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const updatedQuestion = await QuesitonServices.updateQuestion(questionId as string, req.body);
    return new ApiResponse(200, { question: updatedQuestion }, "Question updated successfully").send(res);
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
    const { search, difficulty, category, type, status } = req.query;

    if(search) {
        const questions = await QuesitonServices.getQuestionBySearch(search as string);
        return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
    }
    if(difficulty) {
        const questions = await QuesitonServices.getQuestionByDifficulty(difficulty as QuestionDifficulty);
        return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
    }
    if(category) {
        const questions = await QuesitonServices.getQuestionsByCategory(category as string);
        return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
    }
    if(type) {
        const questions = await QuesitonServices.getQuestionByType(type as QuestionType);
        return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
    }
    if(status) {
        const questions = await QuesitonServices.getQuestionByStatus(status as QuestionStatus);
        return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
    }

    const questions = await QuesitonServices.getAllQuestions();
    return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
});             

export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {        
    const { questionId } = req.params;
    const question = await QuesitonServices.getQuestionById(questionId as string);
    return new ApiResponse(200, { question }, "Question retrieved successfully").send(res);
});

export const getQuestionsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const questions = await QuesitonServices.getQuestionsByCategory(categoryId as string);
    return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const question = await QuesitonServices.deleteQuestion(questionId as string);
    return new ApiResponse(200, { question }, "Question deleted successfully").send(res);
});