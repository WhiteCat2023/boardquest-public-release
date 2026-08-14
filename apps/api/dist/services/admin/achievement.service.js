import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
// ============ Validation Schemas ============
export const awardAchievementSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    task: z.string().min(1, "Task is required"),
    type: z.enum(["quest", "exam"], "Type must be 'quest' or 'exam'"),
    badge: z.string().optional(),
    xp: z.number().min(0, "XP must be positive"),
    confidenceLevel: z.enum(["Shaky", "Steady", "Unyielding"]).optional(),
    accuracy: z.number().min(0).max(100, "Accuracy must be 0-100").optional(),
    questMode: z.enum(["learning", "test"]).optional(),
    subject: z.string().optional(),
});
// ============ Achievement Services ============
export class AchievementService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    /**
     * Award an achievement to a student
     */
    async awardAchievement(data) {
        const parsed = awardAchievementSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { studentId, task, type, badge, xp, confidenceLevel, accuracy, questMode, subject } = parsed.data;
        const student = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        const achievement = await this.db.achievement.create({
            data: {
                userId: studentId,
                task,
                type,
                badge: badge || null,
                xp,
                confidenceLevel: confidenceLevel || null,
                accuracy: accuracy || null,
                questMode: questMode || null,
                subject: subject || null,
            },
        });
        // Update student XP
        await this.db.user.update({
            where: { id: studentId },
            data: {
                xp: {
                    increment: xp,
                },
            },
        });
        return achievement;
    }
    /**
     * Get achievements for a student
     */
    async getAchievements(studentId) {
        const student = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        const achievements = await this.db.achievement.findMany({
            where: { userId: studentId },
            orderBy: { timestamp: "desc" },
        });
        return achievements;
    }
}
