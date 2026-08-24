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
  synthesizeQuestion,
  createSynthesizedQuestion,
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
  assignCategoryHandlers,
} from "../../controller/admin/category.controller";

const router = Router();

router.get("/stats", authenticateToken, getQuestionStats);
router.post("/create", authenticateToken, createQuestion);

router.post("/synthesize", authenticateToken, synthesizeQuestion);
router.post("/create-synthesized", authenticateToken, createSynthesizedQuestion);

router.post("/bulk-upload", authenticateToken, bulkUploadQuestions);
router.post("/extract", authenticateToken, extractQuestions);
router.post("/bulk/delete", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), bulkDeleteQuestions);
router.get("/get", authenticateToken, getQuestions);
router.get("/get/:questionId", authenticateToken, getQuestionById);
router.get("/:questionId/comments", authenticateToken, getQuestionComments);
router.post("/:questionId/comments", authenticateToken, createQuestionComment);
router.patch("/:questionId/comments/:commentId/resolve", authenticateToken, toggleResolveComment);
router.delete("/:questionId/comments/:commentId", authenticateToken, deleteQuestionComment);
router.put("/update/:questionId", authenticateToken, updateQuestion);
router.put("/:questionId", authenticateToken, updateQuestion);
router.delete("/:questionId", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), deleteQuestion);

// Category routes
router.get("/category/get", authenticateToken, getCategories);
router.post(
  "/category/create",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createCategory,
);

router.get("/category/count", authenticateToken, getCategoriesTotalCount);

router.get("/category/single/:categoryId", authenticateToken, getCategory);
router.put(
  "/category/single/:categoryId",
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
router.delete(
  "/category/single/:categoryId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteCategory,
);

router.get("/category/:categoryId", authenticateToken, getQuestionsByCategory);

// Learning Module routes
router.get("/category/:categoryId/modules", authenticateToken, getModulesByCategory);
router.post(
  "/category/:categoryId/modules",
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
router.delete(
  "/category/modules/:moduleId",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteModule,
);

export default router;
