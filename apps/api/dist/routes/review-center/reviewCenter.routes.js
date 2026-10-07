import { Router } from "express";
import { authenticateToken, requireRoles, } from "../../middleware/auth.middleware";
import { getReviewCenters, getReviewCenterById, createReviewCenter, updateReviewCenter, deleteReviewCenter, getReviewCenterCandidatesForAdmin, } from "../../controller/review-center/reviewCenter.controller";
import { getAdminReviewCenterAssessments, getAdminCandidateScores, previewStudentGradeReport, emailAssessmentGradeReports, } from "../../controller/review-center/assessment.controller";
import { getReviewSchedules, createReviewSchedule, updateReviewSchedule, deleteReviewSchedule, } from "../../controller/admin/calendar.controller";
const router = Router();
const allowedRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"];
// Review Center Representative Directory Routes
router.get("/", authenticateToken, requireRoles(allowedRoles), getReviewCenters);
router.get("/representatives/:id", authenticateToken, requireRoles(allowedRoles), getReviewCenterById);
router.get("/candidates/:candidateId/scores", authenticateToken, requireRoles(allowedRoles), getAdminCandidateScores);
router.get("/:id/candidates", authenticateToken, requireRoles(allowedRoles), getReviewCenterCandidatesForAdmin);
router.get("/:id/candidates/:candidateId/scores", authenticateToken, requireRoles(allowedRoles), getAdminCandidateScores);
router.get("/:id/students", authenticateToken, requireRoles(allowedRoles), getReviewCenterCandidatesForAdmin);
router.get("/:id/assessments", authenticateToken, requireRoles(allowedRoles), getAdminReviewCenterAssessments);
router.get("/assessments/:id/preview-report", authenticateToken, requireRoles(allowedRoles), previewStudentGradeReport);
router.get("/assessments/:id/preview-report/:candidateId", authenticateToken, requireRoles(allowedRoles), previewStudentGradeReport);
router.get("/assessments/:id/preview", authenticateToken, requireRoles(allowedRoles), previewStudentGradeReport);
router.get("/assessments/:id/preview/:candidateId", authenticateToken, requireRoles(allowedRoles), previewStudentGradeReport);
router.post("/assessments/:id/email-reports", authenticateToken, requireRoles(allowedRoles), emailAssessmentGradeReports);
router.post("/", authenticateToken, requireRoles(allowedRoles), createReviewCenter);
router.put("/:id", authenticateToken, requireRoles(allowedRoles), updateReviewCenter);
router.delete("/:id", authenticateToken, requireRoles(allowedRoles), deleteReviewCenter);
// Review Calendar & Schedule Routes (Delegated to Calendar Controller for compatibility)
const manageScheduleRoles = ["SUPERADMIN", "DEAN", "TEAMLEAD"];
router.get("/schedules/get", authenticateToken, requireRoles(allowedRoles), getReviewSchedules);
router.post("/schedules/create", authenticateToken, requireRoles(manageScheduleRoles), createReviewSchedule);
router.put("/schedules/update/:id", authenticateToken, requireRoles(manageScheduleRoles), updateReviewSchedule);
router.delete("/schedules/delete/:id", authenticateToken, requireRoles(manageScheduleRoles), deleteReviewSchedule);
// Generic ID lookup fallback
router.get("/:id", authenticateToken, requireRoles(allowedRoles), getReviewCenterById);
export default router;
