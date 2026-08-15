import { asyncHandler } from "../../utils/asyncHandler";
import * as studentService from "../../services/admin/student.service";
import { ApiResponse } from "../../utils/apiResponse";
// ============ Student Management Controllers ============
/**
 * Create a new student account
 * Body: { email, password, confirmPassword, name, location? }
 */
export const createStudent = asyncHandler(async (req, res) => {
    const student = await studentService.createStudent(req.body);
    return new ApiResponse(201, { student }, "Student account created successfully").send(res);
});
/**
 * Get all students with pagination
 * Query: skip?, take?
 */
export const getAllStudents = asyncHandler(async (req, res) => {
    const search = req.query.search;
    const level = req.query.level;
    const location = req.query.location;
    const advisorId = req.query.advisorId;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 50;
    const result = await studentService.getAllStudents({
        search,
        level,
        location,
        advisorId,
        skip,
        take,
    });
    return new ApiResponse(200, result, "Students retrieved successfully").send(res);
});
/**
 * Get student profile by ID
 * Params: studentId
 */
export const getStudentById = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const student = await studentService.getStudentById(studentId);
    return new ApiResponse(200, { student }, "Student profile retrieved successfully").send(res);
});
/**
 * Update student profile
 * Body: { studentId, name?, location? }
 */
export const updateStudent = asyncHandler(async (req, res) => {
    const updatedStudent = await studentService.updateStudent(req.body);
    return new ApiResponse(200, { student: updatedStudent }, "Student profile updated successfully").send(res);
});
/**
 * Delete student account
 * Params: studentId
 */
export const deleteStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    await studentService.deleteStudent(studentId);
    return new ApiResponse(200, null, "Student account deleted successfully").send(res);
});
/**
 * Bulk create / enroll students from CSV
 * Body: { students: [...] }
 */
export const bulkCreateStudents = asyncHandler(async (req, res) => {
    const { students } = req.body;
    const result = await studentService.bulkCreateStudents(students);
    return new ApiResponse(201, result, `${result.createdCount} student(s) enrolled successfully`).send(res);
});
/**
 * Get student statistics (level, XP, streak, achievements)
 * Params: studentId
 */
export const getStudentStats = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const stats = await studentService.getStudentStats(studentId);
    return new ApiResponse(200, { stats }, "Student statistics retrieved successfully").send(res);
});
// ============ Study Plan Controllers ============
/**
 * Create or update a study plan
 * Body: { studentId, subject, targetDate }
 */
export const createStudyPlan = asyncHandler(async (req, res) => {
    const studyPlan = await studentService.createStudyPlan(req.body);
    return new ApiResponse(201, { studyPlan }, "Study plan created successfully").send(res);
});
/**
 * Get all study plans for a student
 * Params: studentId
 */
export const getStudyPlans = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const studyPlans = await studentService.getStudyPlans(studentId);
    return new ApiResponse(200, { studyPlans }, "Study plans retrieved successfully").send(res);
});
/**
 * Delete a study plan
 * Params: studentId, subject
 */
export const deleteStudyPlan = asyncHandler(async (req, res) => {
    const { studentId, subject } = req.params;
    await studentService.deleteStudyPlan(studentId, subject);
    return new ApiResponse(200, null, "Study plan deleted successfully").send(res);
});
// ============ Subject Mastery Controllers ============
/**
 * Update subject mastery
 * Body: { studentId, subject, proficiency, minScore?, status? }
 */
export const updateSubjectMastery = asyncHandler(async (req, res) => {
    const mastery = await studentService.updateSubjectMastery(req.body);
    return new ApiResponse(200, { mastery }, "Subject mastery updated successfully").send(res);
});
/**
 * Get subject mastery for a student
 * Params: studentId
 */
export const getSubjectMastery = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const mastery = await studentService.getSubjectMastery(studentId);
    return new ApiResponse(200, { mastery }, "Subject mastery retrieved successfully").send(res);
});
// ============ Exam Result Controllers ============
/**
 * Record an exam result
 * Body: { studentId, score, total, subject? }
 */
export const recordExamResult = asyncHandler(async (req, res) => {
    const examResult = await studentService.recordExamResult(req.body);
    return new ApiResponse(201, { examResult }, "Exam result recorded successfully").send(res);
});
/**
 * Get exam results for a student
 * Params: studentId
 */
export const getExamResults = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const results = await studentService.getExamResults(studentId);
    return new ApiResponse(200, { results }, "Exam results retrieved successfully").send(res);
});
/**
 * Get exam result statistics
 * Params: studentId
 */
export const getExamResultStats = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const stats = await studentService.getExamResultStats(studentId);
    return new ApiResponse(200, { stats }, "Exam result statistics retrieved successfully").send(res);
});
// ============ Achievement Controllers ============
/**
 * Award an achievement to a student
 * Body: { studentId, task, type, badge?, xp, confidenceLevel?, accuracy?, questMode?, subject? }
 */
export const awardAchievement = asyncHandler(async (req, res) => {
    const achievement = await studentService.awardAchievement(req.body);
    return new ApiResponse(201, { achievement }, "Achievement awarded successfully").send(res);
});
/**
 * Get achievements for a student
 * Params: studentId
 */
export const getAchievements = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const achievements = await studentService.getAchievements(studentId);
    return new ApiResponse(200, { achievements }, "Achievements retrieved successfully").send(res);
});
// ============ Lesson Completion Controllers ============
/**
 * Record lesson completion
 * Body: { studentId, subject, lessonId, status }
 */
export const recordLessonCompletion = asyncHandler(async (req, res) => {
    const completion = await studentService.recordLessonCompletion(req.body);
    return new ApiResponse(201, { completion }, "Lesson completion recorded successfully").send(res);
});
/**
 * Get lesson completions for a student
 * Params: studentId
 * Query: subject?
 */
export const getLessonCompletions = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const subject = req.query.subject;
    const completions = await studentService.getLessonCompletions(studentId, subject);
    return new ApiResponse(200, { completions }, "Lesson completions retrieved successfully").send(res);
});
/**
 * Get lesson completion progress
 * Params: studentId
 */
export const getLessonCompletionProgress = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const progress = await studentService.getLessonCompletionProgress(studentId);
    return new ApiResponse(200, { progress }, "Lesson completion progress retrieved successfully").send(res);
});
