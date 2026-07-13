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
} from "../../controller/admin/question.controller";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../controller/admin/category.controller";

const router = Router();

router.post("/create", authenticateToken, createQuestion);
router.get("/get", authenticateToken, getQuestions);
router.get("/get/:questionId", authenticateToken, getQuestionById);
router.put("/:questionId", authenticateToken, updateQuestion);
router.delete("/:questionId", authenticateToken, deleteQuestion);

// Category routes
router.get("/category/get", authenticateToken, getCategories);
router.post("/category/create", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), createCategory);

router.get("/category/single/:categoryId", authenticateToken, getCategory);
router.put("/category/single/:categoryId", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), updateCategory);
router.delete("/category/single/:categoryId", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN"]), deleteCategory);

router.get("/category/:categoryId", authenticateToken, getQuestionsByCategory);

export default router;