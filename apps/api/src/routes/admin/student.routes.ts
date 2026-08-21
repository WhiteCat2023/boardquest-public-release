import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import * as studentController from "../../controller/admin/student.controller";

const router = Router();

const studentRoles = requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"]);

// ============ Student Management Routes ============

/**
 * POST /create - Create a new student account
 */
router.post("/create", authenticateToken, studentRoles, studentController.createStudent);

/**
 * POST /bulk - Bulk create / enroll students via CSV
 */
router.post("/bulk", authenticateToken, studentRoles, studentController.bulkCreateStudents);

/**
 * GET /get - Get all students with pagination
 */
router.get("/get", authenticateToken, studentRoles, studentController.getAllStudents);

/**
 * GET /get/:studentId - Get student profile by ID
 */
router.get("/get/:studentId", authenticateToken, studentRoles, studentController.getStudentById);

/**
 * PUT /:studentId - Update student profile
 */
router.put("/:studentId", authenticateToken, studentRoles, studentController.updateStudent);

/**
 * DELETE /:studentId - Delete student account
 */
router.delete("/:studentId", authenticateToken, studentRoles, studentController.deleteStudent);

/**
 * GET /stats/:studentId - Get student statistics
 */
router.get("/stats/:studentId", authenticateToken, studentRoles, studentController.getStudentStats);

// ============ Study Plan Routes ============

/**
 * POST /study-plan/create - Create or update study plan
 */
router.post("/study-plan/create", authenticateToken, studentRoles, studentController.createStudyPlan);

/**
 * GET /study-plan/:studentId - Get all study plans for a student
 */
router.get("/study-plan/:studentId", authenticateToken, studentRoles, studentController.getStudyPlans);

/**
 * DELETE /study-plan/:studentId/:subject - Delete a study plan
 */
router.delete("/study-plan/:studentId/:subject", authenticateToken, studentRoles, studentController.deleteStudyPlan);

// ============ Subject Mastery Routes ============

/**
 * PUT /mastery/update - Update subject mastery
 */
router.put("/mastery/update", authenticateToken, studentRoles, studentController.updateSubjectMastery);

/**
 * GET /mastery/:studentId - Get subject mastery for a student
 */
router.get("/mastery/:studentId", authenticateToken, studentRoles, studentController.getSubjectMastery);

// ============ Exam Result Routes ============

/**
 * POST /exam/record - Record exam result
 */
router.post("/exam/record", authenticateToken, studentRoles, studentController.recordExamResult);

/**
 * GET /exam/:studentId - Get exam results for a student
 */
router.get("/exam/:studentId", authenticateToken, studentRoles, studentController.getExamResults);

/**
 * GET /exam/stats/:studentId - Get exam result statistics
 */
router.get("/exam/stats/:studentId", authenticateToken, studentRoles, studentController.getExamResultStats);

// ============ Achievement Routes ============

/**
 * POST /achievement/award - Award achievement to a student
 */
router.post("/achievement/award", authenticateToken, studentRoles, studentController.awardAchievement);

/**
 * GET /achievement/:studentId - Get achievements for a student
 */
router.get("/achievement/:studentId", authenticateToken, studentRoles, studentController.getAchievements);

// ============ Lesson Completion Routes ============

/**
 * POST /lesson/record - Record lesson completion
 */
router.post("/lesson/record", authenticateToken, studentRoles, studentController.recordLessonCompletion);

/**
 * GET /lesson/:studentId - Get lesson completions for a student
 */
router.get("/lesson/:studentId", authenticateToken, studentRoles, studentController.getLessonCompletions);

/**
 * GET /lesson/progress/:studentId - Get lesson completion progress
 */
router.get("/lesson/progress/:studentId", authenticateToken, studentRoles, studentController.getLessonCompletionProgress);

export default router;
