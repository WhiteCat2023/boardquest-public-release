import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as candidateService from "../../services/review-center/candidate.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const getMyReviewCenterSchoolYears = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const schoolYears = await candidateService.getReviewCenterSchoolYears(
      companyName,
      reviewCenterId,
    );

    return new ApiResponse(
      200,
      { schoolYears },
      "School years retrieved successfully",
    ).send(res);
  },
);

export const createMyReviewCenterSchoolYear = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { schoolYear } = req.body;

    if (!schoolYear) {
      throw new ApiError(400, "School Year is required.");
    }

    const companyName = user?.companyName!;
    const reviewCenterId = user?.reviewCenterId!;

    const created = await candidateService.createReviewCenterSchoolYear(
      companyName,
      schoolYear,
      reviewCenterId,
    );

    return new ApiResponse(
      201,
      { schoolYear: created },
      "School year created successfully in database",
    ).send(res);
  },
);

export const deleteMyReviewCenterSchoolYear = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { schoolYear } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    await candidateService.deleteReviewCenterSchoolYear(
      schoolYear as string,
      companyName,
      reviewCenterId,
    );

    return new ApiResponse(
      200,
      {},
      "School year removed successfully",
    ).send(res);
  },
);

export const getMyReviewCenterCandidates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const { search, schoolYear, batch, status } = req.query as Record<
      string,
      string
    >;

    const result = await candidateService.getReviewCenterCandidates(
      companyName,
      reviewCenterId,
      { search, schoolYear, batch, status },
    );

    return new ApiResponse(
      200,
      result,
      "Enrolled candidates retrieved successfully",
    ).send(res);
  },
);

export const enrollMyReviewCenterCandidate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { name, email, schoolId, schoolYear, batch, status } = req.body;

    if (!name || !email) {
      throw new ApiError(400, "Name and email are required.");
    }
    if (!schoolYear) {
      throw new ApiError(400, "School Year is required.");
    }

    const companyName = user?.companyName || "Review Center Partner";
    const reviewCenterId = user?.reviewCenterId;

    const candidate = await candidateService.enrollCandidate({
      name,
      email,
      schoolId,
      schoolYear,
      batch,
      status,
      companyName,
      reviewCenterId,
    });

    return new ApiResponse(
      201,
      { candidate },
      "Candidate enrolled successfully into review center cohort",
    ).send(res);
  },
);

export const bulkEnrollMyReviewCenterCandidates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { schoolYear, batch, students } = req.body;

    if (!schoolYear) {
      throw new ApiError(400, "School Year is required.");
    }
    if (!Array.isArray(students) || students.length === 0) {
      throw new ApiError(400, "Please provide at least one student to enroll.");
    }

    const companyName = user?.companyName || "Review Center Partner";
    const reviewCenterId = user?.reviewCenterId;

    const result = await candidateService.bulkEnrollCandidates({
      schoolYear,
      batch: batch || "Batch 1",
      students,
      companyName,
      reviewCenterId,
    });

    return new ApiResponse(
      201,
      result,
      `Successfully enrolled ${result.enrolledCount} student(s) into School Year ${schoolYear}.`,
    ).send(res);
  },
);

export const updateMyReviewCenterCandidate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    const candidate = await candidateService.updateCandidate(
      id as string,
      req.body,
      companyName,
      reviewCenterId,
    );

    return new ApiResponse(
      200,
      { candidate },
      "Candidate information updated successfully",
    ).send(res);
  },
);

export const deleteMyReviewCenterCandidate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const { id } = req.params;
    const companyName = user?.companyName;
    const reviewCenterId = user?.reviewCenterId;

    await candidateService.deleteCandidate(
      id as string,
      companyName,
      reviewCenterId,
    );

    return new ApiResponse(
      200,
      {},
      "Candidate record removed successfully",
    ).send(res);
  },
);
