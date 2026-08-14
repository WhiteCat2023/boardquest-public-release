import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";

// ============ Validation Schemas ============

export const recordLessonCompletionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().min(1, "Subject is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  status: z.enum(["completed", "in-progress", "not-started"]),
});

// ============ Type Definitions ============

export type RecordLessonCompletionInput = z.infer<typeof recordLessonCompletionSchema>;

// ============ Lesson Completion Services ============

export class LessonCompletionService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Record lesson completion
   */
  async recordLessonCompletion(data: RecordLessonCompletionInput) {
    const parsed = recordLessonCompletionSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { studentId, subject, lessonId, status } = parsed.data;

    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const completion = await this.db.lessonCompletion.upsert({
      where: { userId_lessonId: { userId: studentId, lessonId } },
      update: {
        status,
      },
      create: {
        userId: studentId,
        subject,
        lessonId,
        status,
      },
    });

    return completion;
  }

  /**
   * Get lesson completions for a student
   */
  async getLessonCompletions(studentId: string, subject?: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const completions = await this.db.lessonCompletion.findMany({
      where: {
        userId: studentId,
        ...(subject && { subject }),
      },
    });

    return completions;
  }

  /**
   * Get lesson completion progress
   */
  async getLessonCompletionProgress(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const completions = await this.db.lessonCompletion.findMany({
      where: { userId: studentId },
    });

    const grouped = completions.reduce((acc: any, completion: any) => {
      if (!acc[completion.subject]) {
        acc[completion.subject] = { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
      }
      acc[completion.subject].total++;
      if (completion.status === "completed") acc[completion.subject].completed++;
      if (completion.status === "in-progress") acc[completion.subject].inProgress++;
      if (completion.status === "not-started") acc[completion.subject].notStarted++;
      return acc;
    }, {} as Record<string, any>);

    return grouped;
  }
}
