import { Router } from "express";
import { authenticateToken, requireAdmin } from "../../middleware/auth.middleware";
import * as studentController from "../../controller/admin/student.controller";

const router = Router();

// ============ Student Management Routes ============

/**
 * POST /create - Create a new student account
 */
router.post("/create", authenticateToken, requireAdmin, studentController.createStudent);

/**
 * GET /get - Get all students with pagination
 */
router.get("/get", authenticateToken, requireAdmin, studentController.getAllStudents);

/**
 * GET /get/:studentId - Get student profile by ID
 */
router.get("/get/:studentId", authenticateToken, requireAdmin, studentController.getStudentById);

/**
 * PUT /:studentId - Update student profile
 */
router.put("/:studentId", authenticateToken, requireAdmin, studentController.updateStudent);

/**
 * DELETE /:studentId - Delete student account
 */
router.delete("/:studentId", authenticateToken, requireAdmin, studentController.deleteStudent);

/**
 * GET /stats/:studentId - Get student statistics
 */
router.get("/stats/:studentId", authenticateToken, requireAdmin, studentController.getStudentStats);

// ============ Study Plan Routes ============

/**
 * POST /study-plan/create - Create or update study plan
 */
router.post("/study-plan/create", authenticateToken, requireAdmin, studentController.createStudyPlan);

/**
 * GET /study-plan/:studentId - Get all study plans for a student
 */
router.get("/study-plan/:studentId", authenticateToken, requireAdmin, studentController.getStudyPlans);

/**
 * DELETE /study-plan/:studentId/:subject - Delete a study plan
 */
router.delete("/study-plan/:studentId/:subject", authenticateToken, requireAdmin, studentController.deleteStudyPlan);

// ============ Subject Mastery Routes ============

/**
 * PUT /mastery/update - Update subject mastery
 */
router.put("/mastery/update", authenticateToken, requireAdmin, studentController.updateSubjectMastery);

/**
 * GET /mastery/:studentId - Get subject mastery for a student
 */
router.get("/mastery/:studentId", authenticateToken, requireAdmin, studentController.getSubjectMastery);

// ============ Exam Result Routes ============

/**
 * POST /exam/record - Record exam result
 */
router.post("/exam/record", authenticateToken, requireAdmin, studentController.recordExamResult);

/**
 * GET /exam/:studentId - Get exam results for a student
 */
router.get("/exam/:studentId", authenticateToken, requireAdmin, studentController.getExamResults);

/**
 * GET /exam/stats/:studentId - Get exam result statistics
 */
router.get("/exam/stats/:studentId", authenticateToken, requireAdmin, studentController.getExamResultStats);

// ============ Achievement Routes ============

/**
 * POST /achievement/award - Award achievement to a student
 */
router.post("/achievement/award", authenticateToken, requireAdmin, studentController.awardAchievement);

/**
 * GET /achievement/:studentId - Get achievements for a student
 */
router.get("/achievement/:studentId", authenticateToken, requireAdmin, studentController.getAchievements);

// ============ Lesson Completion Routes ============

/**
 * POST /lesson/record - Record lesson completion
 */
router.post("/lesson/record", authenticateToken, requireAdmin, studentController.recordLessonCompletion);

/**
 * GET /lesson/:studentId - Get lesson completions for a student
 */
router.get("/lesson/:studentId", authenticateToken, requireAdmin, studentController.getLessonCompletions);

/**
 * GET /lesson/progress/:studentId - Get lesson completion progress
 */
router.get("/lesson/progress/:studentId", authenticateToken, requireAdmin, studentController.getLessonCompletionProgress);

export default router;
