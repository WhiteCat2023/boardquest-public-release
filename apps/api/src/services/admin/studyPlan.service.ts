import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

// ============ Validation Schemas ============

export const createStudyPlanSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().min(1, "Subject is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM"),
  goal: z.string().optional().default(""),
  targetQuestions: z.number().int().optional().default(50),
  targetAccuracy: z.number().optional().default(75),
  notes: z.string().optional().default(""),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED"]).optional().default("IN_PROGRESS"),
});

// ============ Type Definitions ============

export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;

// ============ Study Plan Services ============

export class StudyPlanService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Create or update a study plan for a student
   */
  async createStudyPlan(data: CreateStudyPlanInput) {
    const parsed = createStudyPlanSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const {
      studentId,
      subject,
      startDate,
      endDate,
      targetDate,
      priority,
      goal,
      targetQuestions,
      targetAccuracy,
      notes,
      status,
    } = parsed.data;

    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const effectiveStart = startDate ? new Date(startDate) : new Date();
    const effectiveEnd = endDate
      ? new Date(endDate)
      : targetDate
      ? new Date(targetDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const studyPlan = await this.db.studyPlan.upsert({
      where: { userId_subject: { userId: studentId, subject } },
      update: {
        startDate: effectiveStart,
        endDate: effectiveEnd,
        priority: priority ?? "MEDIUM",
        goal: goal ?? "",
        targetQuestions: targetQuestions ?? 50,
        targetAccuracy: targetAccuracy ?? 75,
        notes: notes ?? "",
        status: status ?? "IN_PROGRESS",
      },
      create: {
        userId: studentId,
        subject,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        priority: priority ?? "MEDIUM",
        goal: goal ?? "",
        targetQuestions: targetQuestions ?? 50,
        targetAccuracy: targetAccuracy ?? 75,
        notes: notes ?? "",
        status: status ?? "IN_PROGRESS",
      },
    });

    return studyPlan;
  }

  /**
   * Get all study plans for a student
   */
  async getStudyPlans(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const studyPlans = await this.db.studyPlan.findMany({
      where: { userId: studentId },
    });

    return studyPlans;
  }

  /**
   * Delete a study plan
   */
  async deleteStudyPlan(studentId: string, subject: string) {
    const plan = await this.db.studyPlan.findUnique({
      where: { userId_subject: { userId: studentId, subject } },
    });

    if (!plan) {
      throw new ApiError(404, "Study plan not found");
    }

    await this.db.studyPlan.delete({
      where: { userId_subject: { userId: studentId, subject } },
    });

    return { message: "Study plan deleted successfully" };
  }
}
