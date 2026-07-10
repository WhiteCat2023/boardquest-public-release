import { Router } from "express";
import {
authenticateToken,
  requireAdmin,
} from "../../middleware/auth.middleware";
import {
  createQuestion,
  deleteQuestion,
    getQuestionById,
    getQuestions,
    getQuestionsByCategory, 
    updateQuestion,
} from "../../controller/admin/question.controller";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../controller/admin/category.controller";

const router = Router();

router.post("/create", authenticateToken, requireAdmin, createQuestion);
router.get("/get", authenticateToken, requireAdmin, getQuestions);
router.get("/get/:questionId", authenticateToken, requireAdmin, getQuestionById);
router.put("/:questionId", authenticateToken, requireAdmin, updateQuestion);
router.delete("/:questionId", authenticateToken, requireAdmin, deleteQuestion);

// Category routes
router.get("/category/get", authenticateToken, requireAdmin, getCategories);
router.post("/category/create", authenticateToken, requireAdmin, createCategory);

router.get("/category/single/:categoryId", authenticateToken, requireAdmin, getCategory);
router.put("/category/single/:categoryId", authenticateToken, requireAdmin, updateCategory);
router.delete("/category/single/:categoryId", authenticateToken, requireAdmin, deleteCategory);

router.get("/category/:categoryId", authenticateToken, requireAdmin, getQuestionsByCategory);

export default router;