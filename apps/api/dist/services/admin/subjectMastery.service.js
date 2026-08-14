import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
// ============ Validation Schemas ============
export const updateSubjectMasterySchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    subject: z.string().min(1, "Subject is required"),
    proficiency: z.number().min(0).max(100, "Proficiency must be between 0-100"),
    minScore: z.number().min(0).optional(),
    status: z.enum(["In Training", "Mastered", "Review"]).optional(),
});
// ============ Subject Mastery Services ============
export class SubjectMasteryService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    /**
     * Update subject mastery for a student
     */
    async updateSubjectMastery(data) {
        const parsed = updateSubjectMasterySchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { studentId, subject, proficiency, minScore, status } = parsed.data;
        const student = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        const mastery = await this.db.subjectMastery.upsert({
            where: { userId_subject: { userId: studentId, subject } },
            update: {
                proficiency: proficiency || undefined,
                minScore: minScore || undefined,
                status: status || undefined,
            },
            create: {
                userId: studentId,
                subject,
                proficiency,
                minScore: minScore || 0,
                status: status || "In Training",
            },
        });
        return mastery;
    }
    /**
     * Get subject mastery for a student
     */
    async getSubjectMastery(studentId) {
        const student = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        const mastery = await this.db.subjectMastery.findMany({
            where: { userId: studentId },
        });
        return mastery;
    }
}
