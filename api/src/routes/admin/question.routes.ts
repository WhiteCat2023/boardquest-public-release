import { Router } from "express";
import {
  authenticateToken,
  requireAdmin,
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
} from "../../controller/admin/category.controller";

const router = Router();

router.get("/stats", authenticateToken, getQuestionStats);
router.post("/create", authenticateToken, createQuestion);

router.post("/synthesize", authenticateToken, synthesizeQuestion);
router.post("/create-synthesized", authenticateToken, createSynthesizedQuestion);

router.post("/bulk-upload", authenticateToken, bulkUploadQuestions);
router.post("/extract", authenticateToken, extractQuestions);
router.post("/bulk/delete", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), bulkDeleteQuestions);
router.post("/bulk/approve", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), bulkApproveQuestions);
router.post("/bulk/status", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), bulkUpdateStatusQuestions);
router.post("/bulk/feedback", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), bulkFeedbackQuestions);
router.get("/review/authors", authenticateToken, getPendingReviewAuthors);
router.get("/get", authenticateToken, getQuestions);
router.get("/get/:questionId", authenticateToken, getQuestionById);
router.get("/:questionId/comments", authenticateToken, getQuestionComments);
router.post("/:questionId/comments", authenticateToken, createQuestionComment);
router.patch("/:questionId/comments/:commentId/resolve", authenticateToken, toggleResolveComment);
router.delete("/:questionId/comments/:commentId", authenticateToken, deleteQuestionComment);
router.put("/update/:questionId", authenticateToken, updateQuestion);
router.put("/:questionId", authenticateToken, updateQuestion);
router.delete("/:questionId", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), deleteQuestion);

// Category routes
router.get("/category/get", authenticateToken, getCategories);
router.post(
  "/category/create",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  createCategory,
);

router.get("/category/count", authenticateToken, getCategoriesTotalCount);

router.get("/category/single/:categoryId", authenticateToken, getCategory);
router.put(
  "/category/single/:categoryId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  updateCategory,
);
router.delete(
  "/category/single/:categoryId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  deleteCategory,
);

router.get("/category/:categoryId", authenticateToken, getQuestionsByCategory);

// Learning Module routes
router.get("/category/:categoryId/modules", authenticateToken, getModulesByCategory);
router.post(
  "/category/:categoryId/modules",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  createModule,
);
router.put(
  "/category/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  updateModule,
);
router.delete(
  "/category/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  deleteModule,
);

export default router;
