import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { AssessmentService } from "../../services/review-center/assessment.service";
import { sendAssessmentGradeReportEmails } from "../../services/review-center/gradeEmail.service";
import { generateStudentGradeReportHtml, StudentGradeReportData } from "../../services/review-center/gradePdfGenerator";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

const assessmentService = new AssessmentService();

function getStringParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || "";
}

export const getAssessments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const { schoolYear, subject, search } = req.query;

    const assessments = await assessmentService.getAssessments(
      companyName,
      reviewCenterId,
      {
        schoolYear: typeof schoolYear === "string" ? schoolYear : undefined,
        subject: typeof subject === "string" ? subject : undefined,
        search: typeof search === "string" ? search : undefined,
      }
    );

    return new ApiResponse(
      200,
      { assessments },
      "Assessments retrieved successfully"
    ).send(res);
  }
);

export const getAssessmentById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);

    const assessment = await assessmentService.getAssessmentById(
      id,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      200,
      { assessment },
      "Assessment details retrieved successfully"
    ).send(res);
  }
);

export const createAssessment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const created = await assessmentService.createAssessment(
      req.body,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      201,
      { assessment: created },
      "Assessment created successfully"
    ).send(res);
  }
);

export const updateAssessment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);

    const updated = await assessmentService.updateAssessment(
      id,
      req.body,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      200,
      { assessment: updated },
      "Assessment updated successfully"
    ).send(res);
  }
);

export const deleteAssessment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);

    await assessmentService.deleteAssessment(
      id,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      200,
      {},
      "Assessment deleted successfully"
    ).send(res);
  }
);

export const downloadAssessmentTemplate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);

    const csvContent = await assessmentService.generateAssessmentTemplateCsv(
      id,
      companyName,
      reviewCenterId
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="assessment_${id}_roster_template.csv"`);
    return res.status(200).send(csvContent);
  }
);

export const bulkSaveScores = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);
    const { items } = req.body;

    if (!Array.isArray(items)) {
      throw new ApiError(400, "Items array is required");
    }

    const result = await assessmentService.bulkSaveScores(
      id,
      items,
      companyName,
      reviewCenterId,
      user?.email || user?.name
    );

    return new ApiResponse(
      200,
      result,
      "Scores saved and statistics recalculated successfully"
    ).send(res);
  }
);

export const emailAssessmentGradeReports = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);
    const { candidateIds } = req.body;

    const result = await sendAssessmentGradeReportEmails(
      id,
      candidateIds,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      200,
      result,
      `Grade report emails dispatched: ${result.sentCount} sent, ${result.failedCount} failed`
    ).send(res);
  }
);

export const previewStudentGradeReport = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const id = getStringParam(req.params.id);
    const candidateId = getStringParam(req.params.candidateId);

    const assessment = await assessmentService.getAssessmentById(id, companyName, reviewCenterId);
    
    if (!assessment.scores || assessment.scores.length === 0) {
      throw new ApiError(
        400,
        "No scores have been uploaded or recorded for this assessment yet. Upload scores first to preview or print grade slips."
      );
    }

    // Pick candidate score or first valid score in cohort
    let scoreRecord = candidateId
      ? assessment.scores.find((s: any) => s.candidateId === candidateId)
      : assessment.scores.find((s: any) => s.score !== null) || assessment.scores[0];

    if (!scoreRecord || scoreRecord.score === null) {
      throw new ApiError(
        400,
        "No score has been recorded for this student yet. Record a score first to generate a grade slip."
      );
    }

    const candidate = scoreRecord.candidate;
    if (!candidate) {
      throw new ApiError(404, "Student record not found for this score.");
    }

    const reportData: StudentGradeReportData = {
      companyName: assessment.companyName,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      schoolId: candidate.schoolId || null,
      schoolYear: assessment.schoolYear,
      subject: assessment.subject,
      assessmentTitle: assessment.title,
      customLabel: assessment.customLabel,
      assessmentDate: assessment.assessmentDate
        ? new Date(assessment.assessmentDate).toLocaleDateString("en-PH")
        : null,
      score: scoreRecord.score,
      maxScore: assessment.maxScore,
      percentage: scoreRecord.percentage,
      percentile: scoreRecord.percentile,
      status: scoreRecord.status,
      passingRate: assessment.passingRate,
      meanScore: assessment.meanScore,
      medianScore: assessment.medianScore,
      modeScore: assessment.modeScore,
      remarks: scoreRecord.remarks,
      recordedBy: scoreRecord.recordedBy || user?.name || "Review Center Admin",
    };

    const html = generateStudentGradeReportHtml(reportData);

    if (req.query.format === "html") {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }

    return new ApiResponse(
      200,
      { html, reportData },
      "Grade slip preview generated"
    ).send(res);
  }
);

export const getGradeMatrix = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const { schoolYear, subject } = req.query;

    const matrix = await assessmentService.getGradeMatrix(
      companyName,
      reviewCenterId,
      (schoolYear as string) || "2026-2027",
      typeof subject === "string" ? subject : undefined
    );

    return new ApiResponse(
      200,
      matrix,
      "Grade matrix retrieved successfully"
    ).send(res);
  }
);

export const getCandidateScores = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;
    const candidateId = getStringParam(req.params.candidateId);

    const transcript = await assessmentService.getCandidateScoreTranscript(
      candidateId,
      companyName,
      reviewCenterId
    );

    return new ApiResponse(
      200,
      transcript,
      "Candidate score transcript retrieved successfully"
    ).send(res);
  }
);

// Admin Visibility Handler
export const getAdminReviewCenterAssessments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const reviewCenterId = getStringParam(req.params.id);
    const { schoolYear, subject } = req.query;

    const matrix = await assessmentService.getGradeMatrix(
      "",
      reviewCenterId || undefined,
      (schoolYear as string) || "2026-2027",
      typeof subject === "string" ? subject : undefined
    );

    return new ApiResponse(
      200,
      matrix,
      "Review Center assessments retrieved for admin"
    ).send(res);
  }
);
