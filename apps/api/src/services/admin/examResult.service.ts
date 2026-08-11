import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

// ============ Validation Schemas ============

export const recordExamResultSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  score: z.number().min(0, "Score must be positive"),
  total: z.number().min(1, "Total must be at least 1"),
  subject: z.string().optional(),
}).refine((data) => data.score <= data.total, {
  message: "Score cannot exceed total",
  path: ["score"],
});

// ============ Type Definitions ============

export type RecordExamResultInput = z.infer<typeof recordExamResultSchema>;

// ============ Exam Result Services ============

export class ExamResultService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Record an exam result for a student
   */
  async recordExamResult(data: RecordExamResultInput) {
    const parsed = recordExamResultSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { studentId, score, total, subject } = parsed.data;

    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const accuracy = (score / total) * 100;

    const examResult = await this.db.examResult.create({
      data: {
        userId: studentId,
        score,
        total,
        accuracy,
        subject: subject || "General",
      },
    });

    return examResult;
  }

  /**
   * Get exam results for a student
   */
  async getExamResults(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const results = await this.db.examResult.findMany({
      where: { userId: studentId },
      orderBy: { timestamp: "desc" },
    });

    return results;
  }

  /**
   * Get exam result statistics for a student
   */
  async getExamResultStats(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const results = await this.db.examResult.findMany({
      where: { userId: studentId },
    });

    if (results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        averageAccuracy: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const scores = results.map((r) => r.score);
    const accuracies = results.map((r) => r.accuracy);

    return {
      totalAttempts: results.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      averageAccuracy: Math.round((accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
    };
  }
}
