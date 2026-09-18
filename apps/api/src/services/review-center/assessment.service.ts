import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import {
  MEDTECH_SUBJECTS,
  normalizeMedTechSubject,
  calculateMean,
  calculateMedian,
  calculateMode,
  calculatePercentileRanks,
  calculateMedTechGeneralAverage,
} from "../../utils/statsCalculator";
import { getReviewCenterSchoolYears } from "./candidate.service";

export interface CreateAssessmentInput {
  title: string;
  customLabel?: string;
  subject: string;
  schoolYear?: string;
  maxScore?: number;
  passingRate?: number; // e.g. 75
  assessmentDate?: string | Date;
  isPublished?: boolean;
}

export interface UpdateAssessmentInput {
  title?: string;
  customLabel?: string;
  subject?: string;
  schoolYear?: string;
  maxScore?: number;
  passingRate?: number;
  assessmentDate?: string | Date;
  isPublished?: boolean;
}

export interface ScoreInputItem {
  candidateId?: string;
  schoolId?: string;
  email?: string;
  score?: number | null;
  status?: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
  remarks?: string;
}

/**
 * Service to manage review center assessments and student score records with strict multi-tenant isolation.
 */
export class AssessmentService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * List assessments for a review center
   */
  async getAssessments(
    companyName: string,
    reviewCenterId?: string,
    filters?: {
      schoolYear?: string;
      subject?: string;
      search?: string;
    }
  ) {
    const where: any = {
      OR: [
        { companyName },
        ...(reviewCenterId ? [{ reviewCenterId }] : []),
      ],
    };

    if (filters?.schoolYear) where.schoolYear = filters.schoolYear;
    if (filters?.subject) where.subject = normalizeMedTechSubject(filters.subject);
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { customLabel: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const assessments = await (this.db as any).reviewCenterAssessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { scores: true },
        },
      },
    });

    return assessments;
  }

  /**
   * Get a single assessment by ID with strict ownership validation
   */
  async getAssessmentById(
    id: string,
    companyName: string,
    reviewCenterId?: string
  ) {
    const assessment = await (this.db as any).reviewCenterAssessment.findUnique({
      where: { id },
      include: {
        scores: {
          include: {
            candidate: true,
          },
          orderBy: { candidate: { name: "asc" } },
        },
      },
    });

    if (!assessment) {
      throw new ApiError(404, "Assessment not found");
    }

    // Strict Multi-Tenant Check
    const isOwner =
      (!companyName && !reviewCenterId) ||
      assessment.companyName === companyName ||
      (reviewCenterId && assessment.reviewCenterId === reviewCenterId) ||
      (companyName && assessment.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());

    if (!isOwner) {
      throw new ApiError(403, "Access denied to this review center's assessment");
    }

    return assessment;
  }

  /**
   * Create a new assessment
   */
  async createAssessment(
    data: CreateAssessmentInput,
    companyName: string,
    reviewCenterId?: string
  ) {
    if (!data.title?.trim()) {
      throw new ApiError(400, "Assessment title is required");
    }

    const normalizedSubject = normalizeMedTechSubject(data.subject || "Clinical Chemistry");
    const maxScore = data.maxScore && data.maxScore > 0 ? Number(data.maxScore) : 100;
    const passingRate = data.passingRate && data.passingRate > 0 ? Number(data.passingRate) : 75;
    const passingScore = Number(((maxScore * passingRate) / 100).toFixed(2));

    const assessment = await (this.db as any).reviewCenterAssessment.create({
      data: {
        reviewCenterId: reviewCenterId || null,
        companyName,
        title: data.title.trim(),
        customLabel: data.customLabel?.trim() || null,
        subject: normalizedSubject,
        schoolYear: data.schoolYear || "2026-2027",
        maxScore,
        passingRate,
        passingScore,
        assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : null,
        isPublished: Boolean(data.isPublished),
      },
    });

    return assessment;
  }

  /**
   * Update an existing assessment
   */
  async updateAssessment(
    id: string,
    data: UpdateAssessmentInput,
    companyName: string,
    reviewCenterId?: string
  ) {
    const existing = await this.getAssessmentById(id, companyName, reviewCenterId);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.customLabel !== undefined) updateData.customLabel = data.customLabel?.trim() || null;
    if (data.subject !== undefined) updateData.subject = normalizeMedTechSubject(data.subject);
    if (data.schoolYear !== undefined) updateData.schoolYear = data.schoolYear;
    if (data.assessmentDate !== undefined) {
      updateData.assessmentDate = data.assessmentDate ? new Date(data.assessmentDate) : null;
    }
    if (data.isPublished !== undefined) updateData.isPublished = Boolean(data.isPublished);

    if (data.maxScore !== undefined || data.passingRate !== undefined) {
      const maxScore = data.maxScore !== undefined ? Number(data.maxScore) : existing.maxScore;
      const passingRate = data.passingRate !== undefined ? Number(data.passingRate) : existing.passingRate;
      updateData.maxScore = maxScore;
      updateData.passingRate = passingRate;
      updateData.passingScore = Number(((maxScore * passingRate) / 100).toFixed(2));
    }

    const updated = await (this.db as any).reviewCenterAssessment.update({
      where: { id },
      data: updateData,
    });

    // If maxScore or passingRate changed, recalculate scores & stats
    if (data.maxScore !== undefined || data.passingRate !== undefined) {
      await this.recalculateAssessmentStats(id);
    }

    return updated;
  }

  /**
   * Delete an assessment and its scores
   */
  async deleteAssessment(
    id: string,
    companyName: string,
    reviewCenterId?: string
  ) {
    await this.getAssessmentById(id, companyName, reviewCenterId);

    await (this.db as any).reviewCenterScore.deleteMany({
      where: { assessmentId: id },
    });

    await (this.db as any).reviewCenterAssessment.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generate CSV roster template for an assessment with enrolled students
   */
  async generateAssessmentTemplateCsv(
    assessmentId: string,
    companyName: string,
    reviewCenterId?: string
  ) {
    const assessment = await this.getAssessmentById(assessmentId, companyName, reviewCenterId);

    const candidates = await this.db.reviewCenterCandidate.findMany({
      where: {
        OR: [
          { companyName },
          ...(reviewCenterId ? [{ reviewCenterId }] : []),
        ],
        schoolYear: assessment.schoolYear,
        status: { not: "DROPPED" },
      },
      orderBy: { name: "asc" },
    });

    const headers = "Student ID,Full Name,Email,Score,Status,Remarks";
    const rows = candidates.map((cand) => {
      const escapedName = `"${cand.name.replace(/"/g, '""')}"`;
      return `${cand.schoolId || ""},${escapedName},${cand.email},,PRESENT,`;
    });

    return [headers, ...rows].join("\n");
  }

  /**
   * Bulk Save / Upsert Scores with validation and automated statistical recalculation
   */
  async bulkSaveScores(
    assessmentId: string,
    items: ScoreInputItem[],
    companyName: string,
    reviewCenterId?: string,
    recordedBy?: string
  ) {
    const assessment = await this.getAssessmentById(assessmentId, companyName, reviewCenterId);

    // Fetch all candidates for this review center to match
    const candidates = await this.db.reviewCenterCandidate.findMany({
      where: {
        OR: [
          { companyName },
          ...(reviewCenterId ? [{ reviewCenterId }] : []),
        ],
      },
    });

    const candidateMapById = new Map(candidates.map((c) => [c.id, c]));
    const candidateMapByEmail = new Map(candidates.map((c) => [c.email.toLowerCase(), c]));
    const candidateMapBySchoolId = new Map(
      candidates.filter((c) => c.schoolId).map((c) => [c.schoolId!.toLowerCase(), c])
    );

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      
      // Match candidate
      let candidate = item.candidateId ? candidateMapById.get(item.candidateId) : undefined;
      if (!candidate && item.email) {
        candidate = candidateMapByEmail.get(item.email.toLowerCase().trim());
      }
      if (!candidate && item.schoolId) {
        candidate = candidateMapBySchoolId.get(item.schoolId.toLowerCase().trim());
      }

      if (!candidate) {
        errors.push(`Row ${index + 1}: Student not found (${item.email || item.schoolId || "Unknown"})`);
        continue;
      }

      const status = item.status || "PRESENT";
      let score: number | null = null;
      let percentage: number | null = null;

      if (status === "PRESENT") {
        if (item.score !== null && item.score !== undefined && !isNaN(Number(item.score))) {
          const numScore = Number(item.score);
          if (numScore < 0) {
            errors.push(`Row ${index + 1} (${candidate.name}): Score cannot be negative`);
            continue;
          }
          if (numScore > assessment.maxScore) {
            errors.push(
              `Row ${index + 1} (${candidate.name}): Score ${numScore} exceeds max score ${assessment.maxScore}`
            );
            continue;
          }
          score = numScore;
          percentage = Number(((numScore / assessment.maxScore) * 100).toFixed(2));
        } else {
          score = null;
          percentage = null;
        }
      }

      // Check existing score
      const existingScore = await (this.db as any).reviewCenterScore.findUnique({
        where: {
          assessmentId_candidateId: {
            assessmentId,
            candidateId: candidate.id,
          },
        },
      });

      if (existingScore) {
        await (this.db as any).reviewCenterScore.update({
          where: { id: existingScore.id },
          data: {
            score,
            percentage,
            status,
            remarks: item.remarks !== undefined ? item.remarks : existingScore.remarks,
            recordedBy: recordedBy || existingScore.recordedBy,
          },
        });
        updatedCount++;
      } else {
        await (this.db as any).reviewCenterScore.create({
          data: {
            reviewCenterId: reviewCenterId || null,
            companyName,
            assessmentId,
            candidateId: candidate.id,
            score,
            percentage,
            status,
            remarks: item.remarks || null,
            recordedBy: recordedBy || null,
          },
        });
        createdCount++;
      }
    }

    // Recalculate stats for the entire assessment
    const stats = await this.recalculateAssessmentStats(assessmentId);

    return {
      success: true,
      createdCount,
      updatedCount,
      errors,
      stats,
    };
  }

  /**
   * Recalculate Mean, Median, Mode, Percentile Ranks, and Pass/Fail counts for an assessment
   */
  async recalculateAssessmentStats(assessmentId: string) {
    const scores = await (this.db as any).reviewCenterScore.findMany({
      where: { assessmentId },
    });

    const assessment = await (this.db as any).reviewCenterAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) return null;

    // Filter only PRESENT students with a valid numeric score
    const presentScores = scores.filter(
      (s: any) => s.status === "PRESENT" && s.score !== null && !isNaN(s.score)
    );

    const numericScores: number[] = presentScores.map((s: any) => s.score);

    const meanScore = calculateMean(numericScores);
    const medianScore = calculateMedian(numericScores);
    const modeScore = calculateMode(numericScores);
    const highestScore = numericScores.length > 0 ? Math.max(...numericScores) : null;
    const lowestScore = numericScores.length > 0 ? Math.min(...numericScores) : null;

    let passCount = 0;
    let failCount = 0;

    for (const s of presentScores) {
      if (s.score >= assessment.passingScore) {
        passCount++;
      } else {
        failCount++;
      }
    }

    // Compute percentile rank for each candidate
    const rankMap = calculatePercentileRanks(
      presentScores.map((s: any) => ({ candidateId: s.candidateId, score: s.score }))
    );

    // Update individual score records with their percentile
    for (const s of scores) {
      const percentile = s.status === "PRESENT" && s.score !== null
        ? rankMap.get(s.candidateId) || null
        : null;

      await (this.db as any).reviewCenterScore.update({
        where: { id: s.id },
        data: { percentile },
      });
    }

    // Update the assessment record
    const updatedAssessment = await (this.db as any).reviewCenterAssessment.update({
      where: { id: assessmentId },
      data: {
        meanScore,
        medianScore,
        modeScore,
        highestScore,
        lowestScore,
        passCount,
        failCount,
      },
    });

    return updatedAssessment;
  }

  /**
   * Get Grade Matrix (Spreadsheet Grid: Candidates × Assessments)
   */
  async getGradeMatrix(
    companyName: string,
    reviewCenterId?: string,
    schoolYear?: string,
    subject?: string
  ) {
    const assessmentWhere: any = {
      OR: [
        { companyName },
        ...(reviewCenterId ? [{ reviewCenterId }] : []),
      ],
    };
    if (schoolYear && schoolYear !== "ALL") {
      assessmentWhere.schoolYear = schoolYear;
    }
    if (subject) {
      assessmentWhere.subject = normalizeMedTechSubject(subject);
    }

    const candidateWhere: any = {
      OR: [
        { companyName },
        ...(reviewCenterId ? [{ reviewCenterId }] : []),
      ],
      status: { not: "DROPPED" },
    };
    if (schoolYear && schoolYear !== "ALL") {
      candidateWhere.schoolYear = schoolYear;
    }

    const [assessments, candidates, syRecords] = await Promise.all([
      (this.db as any).reviewCenterAssessment.findMany({
        where: assessmentWhere,
        orderBy: { createdAt: "asc" },
        include: {
          scores: true,
        },
      }),
      this.db.reviewCenterCandidate.findMany({
        where: candidateWhere,
        orderBy: { name: "asc" },
      }),
      getReviewCenterSchoolYears(companyName, reviewCenterId),
    ]);

    const schoolYears = syRecords.map((s: any) => s.schoolYear);

    // Build grid structure
    const rows = candidates.map((cand) => {
      const scoresByAssessmentId: Record<string, any> = {};
      let totalPoints = 0;
      let maxPossiblePoints = 0;
      let assessmentsTaken = 0;

      for (const assessment of assessments) {
        const scoreRecord = assessment.scores.find((s: any) => s.candidateId === cand.id);
        if (scoreRecord) {
          scoresByAssessmentId[assessment.id] = {
            id: scoreRecord.id,
            score: scoreRecord.score,
            percentage: scoreRecord.percentage,
            percentile: scoreRecord.percentile,
            status: scoreRecord.status,
            remarks: scoreRecord.remarks,
            emailStatus: scoreRecord.emailStatus,
          };

          if (scoreRecord.status === "PRESENT" && scoreRecord.score !== null) {
            totalPoints += scoreRecord.score;
            maxPossiblePoints += assessment.maxScore;
            assessmentsTaken++;
          }
        } else {
          scoresByAssessmentId[assessment.id] = {
            id: null,
            score: null,
            percentage: null,
            percentile: null,
            status: "PRESENT",
            remarks: null,
            emailStatus: "NOT_SENT",
          };
        }
      }

      const overallPercentage = maxPossiblePoints > 0
        ? Number(((totalPoints / maxPossiblePoints) * 100).toFixed(2))
        : null;

      return {
        candidate: {
          id: cand.id,
          name: cand.name,
          email: cand.email,
          schoolId: cand.schoolId,
          status: cand.status,
        },
        scores: scoresByAssessmentId,
        summary: {
          totalPoints,
          maxPossiblePoints,
          assessmentsTaken,
          overallPercentage,
          isPassing: overallPercentage !== null && overallPercentage >= 75,
        },
      };
    });

    return {
      assessments: assessments.map((a: any) => ({
        id: a.id,
        title: a.title,
        customLabel: a.customLabel,
        subject: a.subject,
        maxScore: a.maxScore,
        passingRate: a.passingRate,
        passingScore: a.passingScore,
        meanScore: a.meanScore,
        medianScore: a.medianScore,
        modeScore: a.modeScore,
        passCount: a.passCount,
        failCount: a.failCount,
        schoolYear: a.schoolYear,
      })),
      candidatesCount: candidates.length,
      rows,
      schoolYears,
    };
  }

  /**
   * Get single candidate score transcript across all MedTech subjects
   */
  async getCandidateScoreTranscript(
    candidateId: string,
    companyName: string,
    reviewCenterId?: string
  ) {
    let candidate = await this.db.reviewCenterCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      candidate = await this.db.reviewCenterCandidate.findFirst({
        where: {
          OR: [
            { studentId: candidateId },
            { email: { equals: candidateId, mode: "insensitive" } },
            { schoolId: candidateId },
          ],
        },
      });
    }

    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    let isOwner = (!companyName && !reviewCenterId);
    if (!isOwner) {
      if (companyName && candidate.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase()) {
        isOwner = true;
      } else if (reviewCenterId) {
        if (candidate.reviewCenterId === reviewCenterId) {
          isOwner = true;
        } else {
          const rc = await this.db.reviewCenter.findUnique({ where: { id: reviewCenterId } });
          if (rc && rc.name.trim().toLowerCase() === candidate.companyName?.trim().toLowerCase()) {
            isOwner = true;
          } else {
            const rep = await this.db.reviewCenterRepresentativeUser.findUnique({ where: { id: reviewCenterId } });
            if (rep && rep.companyName?.trim().toLowerCase() === candidate.companyName?.trim().toLowerCase()) {
              isOwner = true;
            } else if (!companyName) {
              // Admin caller viewing candidate scores from review center
              isOwner = true;
            }
          }
        }
      } else if (!companyName) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      throw new ApiError(403, "Access denied to candidate");
    }

    // Find all candidate records for the same student (by email, schoolId, or studentId) within this review center
    const orConditions: any[] = [{ id: candidate.id }];
    if (candidate.email) {
      orConditions.push({ email: { equals: candidate.email, mode: "insensitive" as const } });
    }
    if (candidate.schoolId) {
      orConditions.push({ schoolId: candidate.schoolId });
    }
    if (candidate.studentId) {
      orConditions.push({ studentId: candidate.studentId });
    }

    const siblingCandidates = await this.db.reviewCenterCandidate.findMany({
      where: {
        AND: [
          { OR: orConditions },
          reviewCenterId
            ? {
                OR: [
                  { reviewCenterId },
                  ...(candidate.companyName
                    ? [{ companyName: { equals: candidate.companyName, mode: "insensitive" as const } }]
                    : []),
                ],
              }
            : candidate.companyName
            ? { companyName: { equals: candidate.companyName, mode: "insensitive" as const } }
            : {},
        ],
      },
      select: {
        id: true,
        schoolYear: true,
        batch: true,
        schoolId: true,
        email: true,
        name: true,
        companyName: true,
      },
    });

    const candidateIds = Array.from(
      new Set([candidate.id, ...siblingCandidates.map((c) => c.id)])
    );

    const scores = await (this.db as any).reviewCenterScore.findMany({
      where: { candidateId: { in: candidateIds } },
      include: {
        assessment: true,
      },
      orderBy: { assessment: { createdAt: "desc" } },
    });

    // Subject breakdown
    const subjectMap: Record<string, { totalScore: number; maxScore: number; count: number; scores: any[] }> = {};
    for (const subj of MEDTECH_SUBJECTS) {
      subjectMap[subj] = { totalScore: 0, maxScore: 0, count: 0, scores: [] };
    }

    for (const s of scores) {
      const subj = normalizeMedTechSubject(s.assessment.subject);
      if (!subjectMap[subj]) {
        subjectMap[subj] = { totalScore: 0, maxScore: 0, count: 0, scores: [] };
      }

      subjectMap[subj].scores.push(s);
      if (s.status === "PRESENT" && s.score !== null) {
        subjectMap[subj].totalScore += s.score;
        subjectMap[subj].maxScore += s.assessment.maxScore;
        subjectMap[subj].count++;
      }
    }

    const subjectAverages = Object.entries(subjectMap).map(([subject, data]) => {
      const avgPct = data.maxScore > 0 ? Number(((data.totalScore / data.maxScore) * 100).toFixed(2)) : null;
      return {
        subject,
        averagePercentage: avgPct,
        assessmentsCount: data.count,
        scores: data.scores,
      };
    });

    // Simulated MedTech General Weighted Average (GWA)
    const validSubjectScores = subjectAverages
      .filter((s) => s.averagePercentage !== null)
      .map((s) => ({ subject: s.subject, score: s.averagePercentage! }));

    const simulation = calculateMedTechGeneralAverage(validSubjectScores);
    const enrichedSimulation = {
      ...simulation,
      generalWeightedAverage: simulation.gwa,
      remarks: simulation.passed
        ? "Official PRC standard met: GWA >= 75.0% and no subject rating below 50%."
        : simulation.conditionFailed
        ? `Condition Rule Failed: Subjects below 50% (${simulation.failedSubjects.join(", ")}).`
        : "General Weighted Average is below the 75.0% licensure passing threshold.",
    };

    const enrichedCandidate = {
      ...candidate,
      schoolId: candidate.schoolId || siblingCandidates.find((s) => s.schoolId)?.schoolId || null,
      email: candidate.email || siblingCandidates.find((s) => s.email)?.email || "",
      enrolledCohorts: Array.from(new Set([candidate.schoolYear, ...siblingCandidates.map((s) => s.schoolYear)].filter(Boolean))),
    };

    return {
      candidate: enrichedCandidate,
      subjectAverages,
      boardExamSimulation: enrichedSimulation,
      scores,
    };
  }
}

export const assessmentService = new AssessmentService();

