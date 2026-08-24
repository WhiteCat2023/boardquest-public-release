import * as QuestionService from "../../services/admin/question.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { Response } from "express";
import {
  QuestionDifficulty,
  QuestionType,
} from "../../types/prisma.types";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/apiError";
import { extractQuestionsFromCSV } from "../../extraction/extractQuestionFromCSV";
import { extractQuestionsFromExcel } from "../../extraction/extractQuestionFromExcel";
import { agenda } from "../../services/queue.service";
import { logInfo } from "../../services/admin/logger.service";
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

    // If teacher, they can only see their own questions unless browsing categories.
    const rawAuthorId =
      user.role === "TEACHER" ? user.id : (authorId as string) || undefined;
    let authorIdFilter = isValidObjectId(rawAuthorId) ? rawAuthorId : undefined;
    if (authorIdFilter && isSuperAdmin(authorIdFilter)) {
      authorIdFilter = superAdminCredentials.id;
    }

    const hasFilter = !!(
      search ||
      difficulty ||
      category ||
      type ||
      isPublishedBool !== undefined ||
      authorIdFilter ||
      user.role === "TEACHER"
    );

    let result;
    if (hasFilter) {
      result = await QuestionService.getFilteredQuestions(
        search as string,
        difficulty as QuestionDifficulty,
        category as string,
        type as QuestionType,
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

    if (Array.isArray(result)) {
      return new ApiResponse(
        200,
        { questions: result },
        "Questions retrieved successfully",
      ).send(res);
    } else {
      return new ApiResponse(
        200,
        result,
        "Questions retrieved successfully",
      ).send(res);
    }
  },
);

export const getQuestionStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { authorId } = req.query;
    const rawAuthorId =
      user.role === "TEACHER" ? user.id : (authorId as string) || undefined;

    const stats = await QuestionService.getQuestionStats(rawAuthorId);
    return new ApiResponse(
      200,
      { stats },
      "Question statistics retrieved successfully",
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

export const deleteQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const questionObj = await QuestionService.getQuestionById(
      questionId as string,
    );
    if (user.role === "TEACHER" && questionObj.authorId !== user.id) {
      throw new ApiError(403, "You can only delete your own questions");
    }

    const question = await QuestionService.deleteQuestion(questionId as string);
    return new ApiResponse(
      200,
      { question },
      "Question deleted successfully",
    ).send(res);
  },
);

export const bulkUploadQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    const { questions, categoryId } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, "Questions list is required");
    }
    if (!categoryId) {
      throw new ApiError(400, "Category ID is required");
    }

    // Dispatch the bulk upload task to Agenda background queue
    await agenda.now("bulk-question-upload", {
      questions,
      categoryId,
      authorId: user.id,
    });

    return new ApiResponse(202, {
      message: "Bulk question upload job has been queued in the background.",
    }).send(res);
  },
);

export const extractQuestions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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
