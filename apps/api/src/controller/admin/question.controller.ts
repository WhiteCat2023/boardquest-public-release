import * as QuestionService from "../../services/admin/question.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { Response } from "express";
import {
  QuestionDifficulty,
  QuestionType,
  QuestionStatus,
} from "../../types/prisma.types";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { extractQuestionsFromCSV } from "../../extraction/extractQuestionFromCSV";
import { extractQuestionsFromExcel } from "../../extraction/extractQuestionFromExcel";
import { agenda } from "../../services/queue.service";
import { logInfo, logWarn } from "../../services/admin/logger.service";
import { isSuperAdmin, superAdminCredentials } from "../../config/credentials";

export const createQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!req.body.authorId) {
      req.body.authorId = user.id;
    }

    if (user.role === "TEACHER") {
      req.body.authorId = user.id;
      req.body.status = "PENDING_REVIEW";
    } else if (!req.body.status) {
      req.body.status =
        user.role === "SUPERADMIN" || user.role === "DEAN" || user.role === "TEAMLEAD"
          ? "APPROVED"
          : "PENDING_REVIEW";
    }

    const question = await QuestionService.createNewQuestion(req.body);
    await logInfo(
      "CREATE_QUESTION",
      `Created question: "${(question.question || "").slice(0, 45)}..." (${question.type}, ${question.difficulty})`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      201,
      { question },
      "Question created successfully",
    ).send(res);
  },
);

export const updateQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const existingQuestion = await QuestionService.getQuestionById(
      questionId as string,
    );
    if (!existingQuestion) {
      throw new ApiError(404, "Question not found");
    }

    const isAuthor =
      existingQuestion.authorId && existingQuestion.authorId === user.id;
    const isAdmin =
      user.role === "SUPERADMIN" ||
      user.role === "DEAN" ||
      user.role === "TEAMLEAD";

    if (!isAuthor && !isAdmin) {
      throw new ApiError(
        403,
        "You do not have permission to update this question",
      );
    }

    if (user.role === "TEACHER") {
      if (
        existingQuestion.status === "APPROVED" &&
        req.body.status === "APPROVED"
      ) {
        throw new ApiError(403, "Approved questions cannot be edited by teachers");
      }
      if (
        req.body.status !== "PENDING_REVIEW" &&
        req.body.status !== "PENDING_REVISION"
      ) {
        req.body.status = "PENDING_REVIEW";
      }
      req.body.authorId = user.id;
    } else if (user.role === "TEAMLEAD") {
      // Team leads can review/approve or provide feedback
    }

    req.body.id = questionId;

    const question = await QuestionService.updateQuestion(
      questionId as string,
      req.body,
    );
    await logInfo(
      "UPDATE_QUESTION",
      `Updated question: "${(question.question || "").slice(0, 45)}..."`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      200,
      { question },
      "Question updated successfully",
    ).send(res);
  },
);

export const getQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const {
      search,
      difficulty,
      category,
      type,
      status,
      cursor,
      limit,
      authorId,
      isPublished,
    } = req.query;

    const limitNum = limit ? parseInt(limit as string, 10) : 20;
    const isPublishedBool =
      isPublished === "true"
        ? true
        : isPublished === "false"
          ? false
          : undefined;

    const isValidObjectId = (id?: string) =>
      typeof id === "string" &&
      (/^[0-9a-fA-F]{24}$/.test(id) || isSuperAdmin(id));

    // Only filter by authorId if explicitly requested (e.g., My Questions page),
    // allowing teachers to view the shared repository of approved questions in All Questions.
    let authorIdFilter: string | undefined = undefined;
    if (authorId) {
      const rawAuthorId = authorId as string;
      authorIdFilter = isValidObjectId(rawAuthorId) ? rawAuthorId : undefined;
      if (authorIdFilter && isSuperAdmin(authorIdFilter)) {
        authorIdFilter = superAdminCredentials.id;
      }
    }

    const hasFilter = !!(
      search ||
      difficulty ||
      category ||
      type ||
      status ||
      isPublishedBool !== undefined ||
      authorIdFilter
    );

    let result;
    if (hasFilter) {
      result = await QuestionService.getFilteredQuestions(
        search as string,
        difficulty as QuestionDifficulty,
        category as string,
        type as QuestionType,
        status as QuestionStatus,
        cursor as string,
        limitNum,
        authorIdFilter,
        isPublishedBool,
        undefined,
        user.handledCategoryIds,
        user.role,
      );
    } else {
      result = await QuestionService.getAllQuestions(
        cursor as string,
        limitNum,
        authorIdFilter,
      );
    }

    const responseData =
      Array.isArray(result)
        ? { questions: result, total: result.length }
        : result;

    return new ApiResponse(200, responseData, "Questions retrieved successfully").send(
      res,
    );
  },
);

export const getQuestionsByCategory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;
    const questions = await QuestionService.getQuestionsByCategory(
      categoryId as string,
    );
    return new ApiResponse(
      200,
      { questions },
      "Questions retrieved successfully",
    ).send(res);
  },
);

export const getQuestionById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const question = await QuestionService.getQuestionById(
      questionId as string,
    );

    return new ApiResponse(
      200,
      { question },
      "Question retrieved successfully",
    ).send(res);
  },
);

export const deleteQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const existingQuestion = await QuestionService.getQuestionById(
      questionId as string,
    );
    if (!existingQuestion) {
      throw new ApiError(404, "Question not found");
    }

    const isAuthor =
      existingQuestion.authorId && existingQuestion.authorId === user.id;
    const isAdmin =
      user.role === "SUPERADMIN" ||
      user.role === "DEAN" ||
      user.role === "TEAMLEAD";

    if (!isAuthor && !isAdmin) {
      throw new ApiError(
        403,
        "You do not have permission to delete this question",
      );
    }

    const question = await QuestionService.deleteQuestion(
      questionId as string,
    );
    await logInfo(
      "DELETE_QUESTION",
      `Deleted question ID: ${questionId}`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      200,
      { question },
      "Question deleted successfully",
    ).send(res);
  },
);

export const getQuestionStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { authorId } = req.query;
    const stats = await QuestionService.getQuestionStats(authorId as string);
    return new ApiResponse(
      200,
      stats,
      "Question stats retrieved successfully",
    ).send(res);
  },
);

export const bulkUploadQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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

    let uploadStatus = status;
    if (user.role === "TEACHER") {
      uploadStatus = QuestionStatus.PENDING_REVIEW;
    } else if (!uploadStatus) {
      uploadStatus =
        user.role === "SUPERADMIN" || user.role === "DEAN" || user.role === "TEAMLEAD"
          ? QuestionStatus.APPROVED
          : QuestionStatus.PENDING_REVIEW;
    }

    const isSilent = Boolean(req.body.silentNotification);
    const imported = await QuestionService.importQuestions(
      questions,
      categoryId,
      user.id,
      uploadStatus,
      isSilent,
    );

    await logInfo(
      "BULK_UPLOAD_QUESTIONS",
      `Uploaded and queued ${imported.length} question(s) into category ${categoryId} with status ${uploadStatus}`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(201, {
      message: `${imported.length} question(s) uploaded successfully`,
      count: imported.length,
      status: uploadStatus,
    }).send(res);
  },
);

export const extractQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { fileContent, fileType } = req.body;
    if (!fileContent) {
      throw new ApiError(400, "File content is required");
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

    return new ApiResponse(
      200,
      { questions },
      `${questions.length} questions extracted successfully`,
    ).send(res);
  },
);

export const bulkDeleteQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { ids } = req.body;
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "ids must be a non-empty array of strings");
    }

    await QuestionService.bulkDeleteQuestions(ids, user);
    return new ApiResponse(
      200,
      null,
      `${ids.length} questions deleted successfully`,
    ).send(res);
  },
);

export const bulkApproveQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { ids } = req.body;
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "ids must be a non-empty array of strings");
    }

    await QuestionService.bulkApproveQuestions(ids, user);
    await logInfo(
      "BULK_APPROVE_QUESTION",
      `Approved ${ids.length} question(s) in bulk`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      200,
      null,
      `Successfully approved ${ids.length} questions`,
    ).send(res);
  },
);

export const bulkUpdateStatusQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
    await logInfo(
      "BULK_UPDATE_STATUS_QUESTION",
      `Updated status for ${ids.length} question(s) to ${status}`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      200,
      null,
      `Successfully updated status for ${ids.length} questions`,
    ).send(res);
  },
);

export const bulkFeedbackQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { ids, feedback } = req.body;
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, "ids must be a non-empty array of strings");
    }

    await QuestionService.bulkFeedbackQuestions(ids, feedback || "", user);
    await logInfo(
      "BULK_FEEDBACK_QUESTION",
      `Sent revision feedback for ${ids.length} question(s)`,
      "QuestionService",
      user.email,
      req.ip,
    );
    return new ApiResponse(
      200,
      null,
      `Successfully sent feedback for ${ids.length} questions`,
    ).send(res);
  },
);

export const synthesizeQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const {
      question,
      choices,
      correctAnswer,
      topic,
      targetDifficulty,
      type,
      additionalContext,
    } = req.body;
    if (
      !question ||
      !choices ||
      !correctAnswer ||
      !topic ||
      !targetDifficulty
    ) {
      throw new ApiError(
        400,
        "Missing required question synthesis fields: question, choices, correctAnswer, topic, targetDifficulty",
      );
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

    await logInfo(
      "SYNTHESIZE_QUESTION",
      `Synthesized 5 question variants for topic '${topic}' at level ${targetDifficulty}`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(
      200,
      { synthesizedList: result },
      "5 Question variants synthesized successfully",
    ).send(res);
  },
);

export const createSynthesizedQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (user.role === "TEACHER") {
      req.body.authorId = user.id;
      req.body.status = "PENDING_REVIEW";
    }

    const question = await QuestionService.createSynthesizedQuestion(req.body);

    await logInfo(
      "CREATE_SYNTHESIZED_QUESTION",
      `Synthesized & created question: "${(question.question || "").slice(0, 45)}..." (${question.difficulty})`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(
      201,
      { question },
      "Synthesized question created and saved successfully",
    ).send(res);
  },
);

export const getPendingReviewAuthors = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const search = req.query.search ? String(req.query.search) : undefined;
    const authors = await QuestionService.getPendingReviewAuthors({ search });
    return new ApiResponse(
      200,
      { authors },
      "Pending review authors retrieved successfully",
    ).send(res);
  },
);

export const getQuestionComments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const questionId = String(req.params.questionId);
    const comments = await QuestionService.getQuestionComments(questionId);
    return new ApiResponse(
      200,
      { comments },
      "Question comments retrieved successfully",
    ).send(res);
  },
);

export const createQuestionComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const questionId = String(req.params.questionId);
    const { content } = req.body;

    const comment = await QuestionService.createQuestionComment(
      questionId,
      user.id,
      content,
    );

    await logInfo(
      "CREATE_QUESTION_COMMENT",
      `Added comment to question ${questionId}`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(201, { comment }, "Comment added successfully").send(
      res,
    );
  },
);

export const deleteQuestionComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const questionId = String(req.params.questionId);
    const commentId = String(req.params.commentId);

    const result = await QuestionService.deleteQuestionComment(
      questionId,
      commentId,
      user.id,
      user.role || "",
    );

    return new ApiResponse(200, result, "Comment deleted successfully").send(
      res,
    );
  },
);

export const toggleResolveComment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const questionId = String(req.params.questionId);
    const commentId = String(req.params.commentId);
    const { isResolved } = req.body;

    const comment = await QuestionService.toggleResolveComment(
      questionId,
      commentId,
      isResolved,
    );

    return new ApiResponse(
      200,
      { comment },
      `Comment marked as ${comment.isResolved ? "resolved" : "unresolved"}`,
    ).send(res);
  },
);

export const bulkParaphraseQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { questions, tone } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, "questions must be a non-empty array");
    }

    const items = questions.map((q: any) => ({
      id: String(q.id),
      question: String(q.question),
      topic: q.topic || "General",
      subject: q.subject || "Board Exam",
      difficulty: q.difficulty,
      tone: tone || "BOARD_EXAM",
      variationIndex: typeof q.variationIndex === "number" ? q.variationIndex : 0,
    }));

    const results = await QuestionService.bulkParaphraseQuestions(items);

    await logInfo(
      "BULK_PARAPHRASE_QUESTIONS",
      `Paraphrased ${results.length} question(s) in bulk`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(
      200,
      { results },
      `Successfully paraphrased ${results.length} question(s)`,
    ).send(res);
  },
);

export const bulkApplyParaphrase = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ApiError(400, "updates must be a non-empty array");
    }

    const updated = await QuestionService.bulkApplyParaphrase(updates, user);

    await logInfo(
      "BULK_APPLY_PARAPHRASE",
      `Applied paraphrased stems to ${updated.length} question(s)`,
      "QuestionService",
      user.email,
      req.ip,
    );

    return new ApiResponse(
      200,
      { updatedCount: updated.length, questions: updated },
      `Successfully updated ${updated.length} question(s)`,
    ).send(res);
  },
);

