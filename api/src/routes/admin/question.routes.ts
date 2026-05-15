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

const router = Router();

router.post("/create", authenticateToken, requireAdmin, createQuestion);
router.get("/get", authenticateToken, requireAdmin, getQuestions);
router.get("/get/:questionId", authenticateToken, requireAdmin, getQuestionById);
router.get("/category/:categoryId", authenticateToken, requireAdmin, getQuestionsByCategory);
router.put("/:questionId", authenticateToken, requireAdmin, updateQuestion);
router.delete("/:questionId", authenticateToken, requireAdmin, deleteQuestion);

export default router;