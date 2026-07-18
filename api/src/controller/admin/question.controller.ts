import * as QuesitonServices from "../../services/admin/question.services";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { Response } from "express";
import { QuestionDifficulty, QuestionType, QuestionStatus } from "../../../generated/prisma/enums";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { extractQuestionsFromCSV } from "../../extraction/extractQuestionFromCSV";
import { extractQuestionsFromExcel } from "../../extraction/extractQuestionFromExcel";
import { agenda } from "../../services/queue.service";

export const createQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    if (user.role === "TEACHER") {
        req.body.authorId = user.id;
        req.body.status = "DRAFT";
    } else if (user.role === "TEAMLEAD") {
        if (req.body.status === "APPROVED") {
            throw new ApiError(403, "Co-Admins/Team Leads cannot approve questions");
        }
    }

    const question = await QuesitonServices.createNewQuestion(req.body);
    return new ApiResponse(201, { question }, "Question created successfully").send(res);
}); 

export const updateQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const question = await QuesitonServices.getQuestionById(questionId as string);

    if (user.role === "TEACHER") {
        if (question.authorId !== user.id) {
            throw new ApiError(403, "You can only update your own questions");
        }
        // Teachers can only save questions as DRAFT
        req.body.status = "DRAFT";
        req.body.authorId = user.id; // force ownership
    } else if (user.role === "TEAMLEAD") {
        if (req.body.status === "APPROVED") {
            throw new ApiError(403, "Co-Admins/Team Leads cannot approve questions");
        }
    }

    const updatedQuestion = await QuesitonServices.updateQuestion(questionId as string, req.body);
    return new ApiResponse(200, { question: updatedQuestion }, "Question updated successfully").send(res);
});

export const getQuestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { search, difficulty, category, type, status, cursor, limit } = req.query;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    const hasFilter = !!(search || difficulty || category || type || status);

    // If teacher, they can only see their own questions
    const authorIdFilter = user.role === "TEACHER" ? user.id : undefined;

    let result;
    if (hasFilter || authorIdFilter) {
        result = await QuesitonServices.getFilteredQuestions(
            search as string,
            difficulty as QuestionDifficulty,
            category as string,
            type as QuestionType,
            status as QuestionStatus,
            cursor as string,
            limitNum,
            authorIdFilter
        );
    } else {
        result = await QuesitonServices.getAllQuestions(cursor as string, limitNum, authorIdFilter);
    }

    if (Array.isArray(result)) {
        return new ApiResponse(200, { questions: result }, "Questions retrieved successfully").send(res);
    } else {
        return new ApiResponse(200, result, "Questions retrieved successfully").send(res);
    }
});             

export const getQuestionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {        
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const question = await QuesitonServices.getQuestionById(questionId as string);
    if (user.role === "TEACHER" && question.authorId !== user.id) {
        throw new ApiError(403, "You can only view your own questions");
    }

    return new ApiResponse(200, { question }, "Question retrieved successfully").send(res);
});

export const getQuestionsByCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;
    const questions = await QuesitonServices.getQuestionsByCategory(categoryId as string);
    return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
});

export const deleteQuestion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const questionObj = await QuesitonServices.getQuestionById(questionId as string);
    if (user.role === "TEACHER" && questionObj.authorId !== user.id) {
        throw new ApiError(403, "You can only delete your own questions");
    }

    const question = await QuesitonServices.deleteQuestion(questionId as string);
    return new ApiResponse(200, { question }, "Question deleted successfully").send(res);
});

export const bulkUploadQuestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const { questions, categoryId, status } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, "Questions list is required");
    }
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    const defaultStatus = user.role === "TEACHER" ? QuestionStatus.DRAFT : (status || QuestionStatus.PENDING_REVIEW);

    // Dispatch the bulk upload task to Agenda background queue
    await agenda.now("bulk-question-upload", {
        questions,
        categoryId,
        authorId: user.id,
        status: defaultStatus
    });

    return new ApiResponse(202, { message: "Bulk question upload job has been queued in the background." }).send(res);
});

export const extractQuestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }

    const { fileContent, fileType } = req.body;
    if (!fileContent) {
        throw new ApiError(400, "File content is required");
    }
    if (!fileType) {
        throw new ApiError(400, "File type is required");
    }

    let questions: any[] = [];
    try {
        if (fileType === "csv") {
            questions = extractQuestionsFromCSV(fileContent);
        } else if (fileType === "excel" || fileType === "xlsx") {
            const buffer = Buffer.from(fileContent, "base64");
            questions = extractQuestionsFromExcel(buffer);
        } else {
            throw new ApiError(400, "Unsupported file type. Use 'csv' or 'excel'");
        }
    } catch (err: any) {
        throw new ApiError(400, err.message || "Failed to parse file");
    }

    return new ApiResponse(200, { questions }, `${questions.length} questions extracted successfully`).send(res);
});