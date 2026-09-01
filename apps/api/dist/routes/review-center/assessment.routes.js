import { Router } from "express";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";
import { getAssessments, getAssessmentById, createAssessment, updateAssessment, deleteAssessment, downloadAssessmentTemplate, bulkSaveScores, emailAssessmentGradeReports, previewStudentGradeReport, getGradeMatrix, getCandidateScores, } from "../../controller/review-center/assessment.controller";
const router = Router();
// Matrix & Transcripts
router.get("/matrix", authenticateReviewCenterToken, getGradeMatrix);
router.get("/candidate/:candidateId/scores", authenticateReviewCenterToken, getCandidateScores);
// Assessment CRUD & Management
router.get("/", authenticateReviewCenterToken, getAssessments);
router.post("/", authenticateReviewCenterToken, createAssessment);
router.get("/:id", authenticateReviewCenterToken, getAssessmentById);
router.put("/:id", authenticateReviewCenterToken, updateAssessment);
router.delete("/:id", authenticateReviewCenterToken, deleteAssessment);
// Actions on single assessment
router.get("/:id/template", authenticateReviewCenterToken, downloadAssessmentTemplate);
router.post("/:id/scores/bulk", authenticateReviewCenterToken, bulkSaveScores);
router.post("/:id/email-reports", authenticateReviewCenterToken, emailAssessmentGradeReports);
router.get("/:id/preview-report", authenticateReviewCenterToken, previewStudentGradeReport);
router.get("/:id/preview-report/:candidateId", authenticateReviewCenterToken, previewStudentGradeReport);
export default router;
