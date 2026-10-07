import { Router } from "express";
import {
  authenticateToken,
  requireRoles,
} from "../../middleware/auth.middleware";
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestions,
  getQuestionsByCategory,
  updateQuestion,
  bulkUploadQuestions,
  extractQuestions,
  bulkDeleteQuestions,
  bulkApproveQuestions,
  bulkUpdateStatusQuestions,
  bulkFeedbackQuestions,
  synthesizeQuestion,
  createSynthesizedQuestion,
  getPendingReviewAuthors,
  getQuestionStats,
  getQuestionComments,
  createQuestionComment,
  deleteQuestionComment,
  toggleResolveComment,
  bulkParaphraseQuestions,
  bulkApplyParaphrase,
} from "../../controller/admin/question.controller";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesTotalCount,
  getModulesByCategory,
  createModule,
  updateModule,
  deleteModule,
  assignCategoryHandlers,
} from "../../controller/admin/subject.controller";

import {
  getTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../controller/admin/topic.controller.js";

const router = Router();

router.get("/stats", authenticateToken, getQuestionStats);
router.post("/create", authenticateToken, createQuestion);

router.post("/synthesize", authenticateToken, synthesizeQuestion);
router.post("/create-synthesized", authenticateToken, createSynthesizedQuestion);

router.post("/bulk-upload", authenticateToken, bulkUploadQuestions);
router.post("/extract", authenticateToken, extractQuestions);
router.post("/bulk/delete", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), bulkDeleteQuestions);
router.post("/bulk/approve", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), bulkApproveQuestions);
router.post("/bulk/status", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"]), bulkUpdateStatusQuestions);
router.post("/bulk/feedback", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), bulkFeedbackQuestions);
router.post("/bulk/paraphrase", authenticateToken, bulkParaphraseQuestions);
router.post("/bulk/paraphrase/apply", authenticateToken, bulkApplyParaphrase);
router.get("/review/authors", authenticateToken, getPendingReviewAuthors);
router.get("/get", authenticateToken, getQuestions);
router.get("/get/:questionId", authenticateToken, getQuestionById);
router.get("/:questionId/comments", authenticateToken, getQuestionComments);
router.post("/:questionId/comments", authenticateToken, createQuestionComment);
router.patch("/:questionId/comments/:commentId/resolve", authenticateToken, toggleResolveComment);
router.delete("/:questionId/comments/:commentId", authenticateToken, deleteQuestionComment);
router.put("/update/:questionId", authenticateToken, updateQuestion);
router.put("/:questionId", authenticateToken, updateQuestion);
router.delete("/:questionId", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), deleteQuestion);

// Subject & Category routes
router.get("/category/get", authenticateToken, getCategories);
router.get("/subject/get", authenticateToken, getCategories);

router.post(
  "/category/create",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createCategory,
);
router.post(
  "/subject/create",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createCategory,
);

router.get("/category/count", authenticateToken, getCategoriesTotalCount);
router.get("/subject/count", authenticateToken, getCategoriesTotalCount);

router.get("/category/single/:categoryId", authenticateToken, getCategory);
router.get("/subject/single/:subjectId", authenticateToken, getCategory);

router.put(
  "/category/single/:categoryId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  updateCategory,
);
router.put(
  "/subject/single/:subjectId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  updateCategory,
);

router.put(
  "/category/single/:categoryId/handlers",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  assignCategoryHandlers,
);
router.put(
  "/subject/single/:subjectId/handlers",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  assignCategoryHandlers,
);

router.delete(
  "/category/single/:categoryId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteCategory,
);
router.delete(
  "/subject/single/:subjectId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteCategory,
);

router.get("/category/:categoryId", authenticateToken, getQuestionsByCategory);
router.get("/subject/:subjectId", authenticateToken, getQuestionsByCategory);

// Learning Module routes
router.get("/category/:categoryId/modules", authenticateToken, getModulesByCategory);
router.get("/subject/:subjectId/modules", authenticateToken, getModulesByCategory);

router.post(
  "/category/:categoryId/modules",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createModule,
);
router.post(
  "/subject/:subjectId/modules",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createModule,
);

router.put(
  "/category/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  updateModule,
);
router.put(
  "/subject/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  updateModule,
);

router.delete(
  "/category/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteModule,
);
router.delete(
  "/subject/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteModule,
);

// Topic CMS routes
const topicRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];

router.get("/category/:categoryId/topics", authenticateToken, getTopicsBySubject);
router.get("/subject/:subjectId/topics", authenticateToken, getTopicsBySubject);

router.post(
  "/category/:categoryId/topics",
  authenticateToken,
  requireRoles(topicRoles),
  createTopic,
);
router.post(
  "/subject/:subjectId/topics",
  authenticateToken,
  requireRoles(topicRoles),
  createTopic,
);

router.put(
  "/topics/:topicId",
  authenticateToken,
  requireRoles(topicRoles),
  updateTopic,
);
router.put(
  "/category/:categoryId/topics/:topicId",
  authenticateToken,
  requireRoles(topicRoles),
  updateTopic,
);

router.delete(
  "/topics/:topicId",
  authenticateToken,
  requireRoles(topicRoles),
  deleteTopic,
);
router.delete(
  "/category/:categoryId/topics/:topicId",
  authenticateToken,
  requireRoles(topicRoles),
  deleteTopic,
);

export default router;
