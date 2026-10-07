import { Router } from "express";
import { authenticateReviewCenterToken } from "../../middleware/reviewCenterAuth.middleware";
import { getMyReviewCenterCandidates, enrollMyReviewCenterCandidate, bulkEnrollMyReviewCenterCandidates, updateMyReviewCenterCandidate, deleteMyReviewCenterCandidate, getMyReviewCenterSchoolYears, createMyReviewCenterSchoolYear, setMyReviewCenterCurrentSchoolYear, updateMyReviewCenterSchoolYear, deleteMyReviewCenterSchoolYear, } from "../../controller/review-center/candidate.controller";
const router = Router();
// School Years endpoints
router.get("/school-years", authenticateReviewCenterToken, getMyReviewCenterSchoolYears);
router.post("/school-years", authenticateReviewCenterToken, createMyReviewCenterSchoolYear);
router.put("/school-years/:schoolYear/current", authenticateReviewCenterToken, setMyReviewCenterCurrentSchoolYear);
router.put("/school-years/:schoolYear", authenticateReviewCenterToken, updateMyReviewCenterSchoolYear);
router.delete("/school-years/:schoolYear", authenticateReviewCenterToken, deleteMyReviewCenterSchoolYear);
// Candidate endpoints for Review Center Representative
router.get("/get", authenticateReviewCenterToken, getMyReviewCenterCandidates);
router.post("/create", authenticateReviewCenterToken, enrollMyReviewCenterCandidate);
router.post("/enroll", authenticateReviewCenterToken, enrollMyReviewCenterCandidate);
router.post("/bulk-enroll", authenticateReviewCenterToken, bulkEnrollMyReviewCenterCandidates);
router.post("/bulk", authenticateReviewCenterToken, bulkEnrollMyReviewCenterCandidates);
router.put("/update/:id", authenticateReviewCenterToken, updateMyReviewCenterCandidate);
router.delete("/delete/:id", authenticateReviewCenterToken, deleteMyReviewCenterCandidate);
// Standard REST endpoints
router.get("/", authenticateReviewCenterToken, getMyReviewCenterCandidates);
router.post("/", authenticateReviewCenterToken, enrollMyReviewCenterCandidate);
router.put("/:id", authenticateReviewCenterToken, updateMyReviewCenterCandidate);
router.delete("/:id", authenticateReviewCenterToken, deleteMyReviewCenterCandidate);
export default router;
