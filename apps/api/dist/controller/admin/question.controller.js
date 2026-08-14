import * as QuestionService from "../../services/admin/question.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { QuestionType, QuestionStatus, } from "../../../generated/prisma";
import { ApiError } from "../../utils/apiError";
import { extractQuestionsFromCSV } from "../../extraction/extractQuestionFromCSV";
import { extractQuestionsFromExcel } from "../../extraction/extractQuestionFromExcel";
import { agenda } from "../../services/queue.service";
import { logInfo } from "../../services/admin/logger.service";
export const createQuestion = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!req.body.authorId) {
        req.body.authorId = user.id;
    }
    if (user.role === "TEACHER") {
        req.body.status = "PENDING_REVIEW";
    }
    else if (user.role === "TEAMLEAD") {
        if (req.body.status === "APPROVED") {
            throw new ApiError(403, "Co-Admins/Team Leads cannot approve questions");
        }
    }
    const question = await QuestionService.createNewQuestion(req.body);
    await logInfo("CREATE_QUESTION", `Created question: "${(question.question || "").slice(0, 45)}..." (${question.type}, ${question.difficulty})`, "QuestionService", user.email, req.ip);
    return new ApiResponse(201, { question }, "Question created successfully").send(res);
});
export const updateQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const question = await QuestionService.getQuestionById(questionId);
    if (user.role === "TEACHER") {
        if (question.authorId !== user.id) {
            throw new ApiError(403, "You can only update your own questions");
        }
        // Teachers submit/resubmit as PENDING_REVIEW or PENDING_REVISION
        if (req.body.status !== "PENDING_REVIEW" && req.body.status !== "PENDING_REVISION") {
            req.body.status = "PENDING_REVIEW";
        }
        req.body.authorId = user.id; // force ownership
    }
    else if (user.role === "TEAMLEAD") {
        if (req.body.status === "APPROVED") {
            throw new ApiError(403, "Teacher/Team Leads cannot approve questions");
        }
    }
    const updatedQuestion = await QuestionService.updateQuestion(questionId, req.body);
    return new ApiResponse(200, { question: updatedQuestion }, "Question updated successfully").send(res);
});
export const getQuestions = asyncHandler(async (req, res) => {
    const { search, difficulty, category, type, status, cursor, limit, isPublished, authorId, } = req.query;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const isPublishedBool = isPublished === "true"
        ? true
        : isPublished === "false"
            ? false
            : undefined;
    const isValidObjectId = (id) => typeof id === "string" &&
        (/^[0-9a-fA-F]{24}$/.test(id) || id === "superadmin-env-id");
    // If teacher, they can only see their own questions.
    // Admin/Co-Admin can filter specifically by any authorId.
    const rawAuthorId = user.role === "TEACHER" ? user.id : authorId || undefined;
    let authorIdFilter = isValidObjectId(rawAuthorId) ? rawAuthorId : undefined;
    if (authorIdFilter === "superadmin-env-id") {
        authorIdFilter = "507f1f77bcf86cd799439011";
    }
    const hasFilter = !!(search ||
        difficulty ||
        category ||
        type ||
        status ||
        isPublishedBool !== undefined ||
        authorIdFilter ||
        user.role === "TEACHER");
    let result;
    if (hasFilter) {
        result = await QuestionService.getFilteredQuestions(search, difficulty, category, type, status, cursor, limitNum, authorIdFilter, isPublishedBool, undefined, user.handledCategoryIds, user.role);
    }
    else {
        result = await QuestionService.getAllQuestions(cursor, limitNum, authorIdFilter);
    }
    if (Array.isArray(result)) {
        return new ApiResponse(200, { questions: result }, "Questions retrieved successfully").send(res);
    }
    else {
        return new ApiResponse(200, result, "Questions retrieved successfully").send(res);
    }
});
export const getQuestionStats = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const { authorId } = req.query;
    const rawAuthorId = user.role === "TEACHER" ? user.id : authorId || undefined;
    const stats = await QuestionService.getQuestionStats(rawAuthorId);
    return new ApiResponse(200, { stats }, "Question statistics retrieved successfully").send(res);
});
export const getQuestionById = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const question = await QuestionService.getQuestionById(questionId);
    if (user.role === "TEACHER" && question.authorId !== user.id) {
        throw new ApiError(403, "You can only view your own questions");
    }
    return new ApiResponse(200, { question }, "Question retrieved successfully").send(res);
});
export const getQuestionsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const questions = await QuestionService.getQuestionsByCategory(categoryId);
    return new ApiResponse(200, { questions }, "Questions retrieved successfully").send(res);
});
export const deleteQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const questionObj = await QuestionService.getQuestionById(questionId);
    if (user.role === "TEACHER" && questionObj.authorId !== user.id) {
        throw new ApiError(403, "You can only delete your own questions");
    }
    const question = await QuestionService.deleteQuestion(questionId);
    return new ApiResponse(200, { question }, "Question deleted successfully").send(res);
});
export const bulkUploadQuestions = asyncHandler(async (req, res) => {
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
    const defaultStatus = status || QuestionStatus.PENDING_REVIEW;
    // Dispatch the bulk upload task to Agenda background queue
    await agenda.now("bulk-question-upload", {
        questions,
        categoryId,
        authorId: user.id,
        status: defaultStatus,
    });
    return new ApiResponse(202, {
        message: "Bulk question upload job has been queued in the background.",
    }).send(res);
});
export const extractQuestions = asyncHandler(async (req, res) => {
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
    let questions = [];
    try {
        if (fileType === "csv") {
            questions = extractQuestionsFromCSV(fileContent);
        }
        else if (fileType === "excel" || fileType === "xlsx") {
            const buffer = Buffer.from(fileContent, "base64");
            questions = extractQuestionsFromExcel(buffer);
        }
        else {
            throw new ApiError(400, "Unsupported file type. Use 'csv' or 'excel'");
        }
    }
    catch (err) {
        throw new ApiError(400, err.message || "Failed to parse file");
    }
    return new ApiResponse(200, { questions }, `${questions.length} questions extracted successfully`).send(res);
});
export const bulkDeleteQuestions = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "ids must be a non-empty array of strings");
    }
    await QuestionService.bulkDeleteQuestions(ids, user);
    return new ApiResponse(200, null, `${ids.length} questions deleted successfully`).send(res);
});
export const bulkApproveQuestions = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "ids must be a non-empty array of strings");
    }
    await QuestionService.bulkApproveQuestions(ids, user);
    await logInfo("BULK_APPROVE_QUESTION", `Approved ${ids.length} question(s) in bulk`, "QuestionService", user.email, req.ip);
    return new ApiResponse(200, null, `Successfully approved ${ids.length} questions`).send(res);
});
export const bulkUpdateStatusQuestions = asyncHandler(async (req, res) => {
    const { ids, status } = req.body;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "ids must be a non-empty array of strings");
    }
    if (!status) {
        throw new ApiError(400, "status is required");
    }
    await QuestionService.bulkUpdateStatusQuestions(ids, status, user);
    await logInfo("BULK_UPDATE_STATUS_QUESTION", `Updated status for ${ids.length} question(s) to ${status}`, "QuestionService", user.email, req.ip);
    return new ApiResponse(200, null, `Successfully updated status for ${ids.length} questions`).send(res);
});
export const bulkFeedbackQuestions = asyncHandler(async (req, res) => {
    const { ids, feedback } = req.body;
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "ids must be a non-empty array of strings");
    }
    await QuestionService.bulkFeedbackQuestions(ids, feedback || "", user);
    await logInfo("BULK_FEEDBACK_QUESTION", `Sent revision feedback for ${ids.length} question(s)`, "QuestionService", user.email, req.ip);
    return new ApiResponse(200, null, `Successfully sent feedback for ${ids.length} questions`).send(res);
});
export const synthesizeQuestion = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const { question, choices, correctAnswer, topic, targetDifficulty, type, additionalContext, } = req.body;
    if (!question ||
        !choices ||
        !correctAnswer ||
        !topic ||
        !targetDifficulty) {
        throw new ApiError(400, "Missing required question synthesis fields: question, choices, correctAnswer, topic, targetDifficulty");
    }
    const result = await QuestionService.synthesizeQuestion({
        question,
        choices,
        correctAnswer,
        topic,
        targetDifficulty,
        type: type || QuestionType.MCQ,
        count: 5,
        additionalContext,
    });
    await logInfo("SYNTHESIZE_QUESTION", `Synthesized 5 question variants for topic '${topic}' at level ${targetDifficulty}`, "QuestionService", user.email, req.ip);
    return new ApiResponse(200, { synthesizedList: result }, "5 Question variants synthesized successfully").send(res);
});
export const createSynthesizedQuestion = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    if (user.role === "TEACHER") {
        req.body.authorId = user.id;
        req.body.status = "PENDING_REVIEW";
    }
    const question = await QuestionService.createSynthesizedQuestion(req.body);
    await logInfo("CREATE_SYNTHESIZED_QUESTION", `Synthesized & created question: "${(question.question || "").slice(0, 45)}..." (${question.difficulty})`, "QuestionService", user.email, req.ip);
    return new ApiResponse(201, { question }, "Synthesized question created and saved successfully").send(res);
});
export const getPendingReviewAuthors = asyncHandler(async (req, res) => {
    const authors = await QuestionService.getPendingReviewAuthors();
    return new ApiResponse(200, { authors }, "Pending review authors retrieved successfully").send(res);
});
export const getQuestionComments = asyncHandler(async (req, res) => {
    const questionId = String(req.params.questionId);
    const comments = await QuestionService.getQuestionComments(questionId);
    return new ApiResponse(200, { comments }, "Question comments retrieved successfully").send(res);
});
export const createQuestionComment = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const questionId = String(req.params.questionId);
    const { content } = req.body;
    const comment = await QuestionService.createQuestionComment(questionId, user.id, content);
    await logInfo("CREATE_QUESTION_COMMENT", `Added comment to question ${questionId}`, "QuestionService", user.email, req.ip);
    return new ApiResponse(201, { comment }, "Comment added successfully").send(res);
});
export const deleteQuestionComment = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const questionId = String(req.params.questionId);
    const commentId = String(req.params.commentId);
    const result = await QuestionService.deleteQuestionComment(questionId, commentId, user.id, user.role || "");
    return new ApiResponse(200, result, "Comment deleted successfully").send(res);
});
export const toggleResolveComment = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Authentication required");
    }
    const questionId = String(req.params.questionId);
    const commentId = String(req.params.commentId);
    const { isResolved } = req.body;
    const comment = await QuestionService.toggleResolveComment(questionId, commentId, isResolved);
    return new ApiResponse(200, { comment }, `Comment marked as ${comment.isResolved ? "resolved" : "unresolved"}`).send(res);
});
