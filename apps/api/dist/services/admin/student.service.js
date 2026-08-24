import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { sendStudentCredentialsEmail } from "../mail.service";
import { StudyPlanService, createStudyPlanSchema } from "./studyPlan.service";
import { SubjectMasteryService, updateSubjectMasterySchema } from "./subjectMastery.service";
import { ExamResultService, recordExamResultSchema } from "./examResult.service";
import { AchievementService, awardAchievementSchema } from "./achievement.service";
import { LessonCompletionService, recordLessonCompletionSchema } from "./lessonCompletion.service";
// ============ Validation Schemas ============
export const createStudentSchema = z
    .object({
    email: z.string().email("Invalid email"),
    password: z.string().optional().default(""),
    confirmPassword: z.string().optional().default(""),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    location: z.string().optional(),
})
    .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})
    .refine((data) => Boolean((data.name && data.name.trim().length > 0) ||
    (data.firstName && data.firstName.trim().length > 0) ||
    (data.lastName && data.lastName.trim().length > 0)), {
    message: "First name and last name, or full name, are required",
    path: ["firstName"],
});
export const updateStudentSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    name: z.string().min(1, "Name is required").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    location: z.string().optional(),
});
// ============ Student Management Services ============
export class StudentService {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    /**
     * Helper to resolve firstName, lastName, and fullName
     */
    resolveNameParts(rawName, rawFirst, rawLast) {
        let firstName = rawFirst?.trim() || "";
        let lastName = rawLast?.trim() || "";
        let name = rawName?.trim() || "";
        if (!name && (firstName || lastName)) {
            name = [firstName, lastName].filter(Boolean).join(" ").trim();
        }
        else if (name && !firstName && !lastName) {
            const parts = name.split(" ");
            firstName = parts[0] || "";
            lastName = parts.slice(1).join(" ") || "";
        }
        else if (firstName && lastName && !name) {
            name = `${firstName} ${lastName}`.trim();
        }
        return { name, firstName, lastName };
    }
    /**
     * Create a new student account
     */
    async createStudent(data) {
        const parsed = createStudentSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { email, password, name: rawName, firstName: rawFirst, lastName: rawLast, location } = parsed.data;
        const { name, firstName, lastName } = this.resolveNameParts(rawName, rawFirst, rawLast);
        const existingStudent = await this.db.user.findUnique({
            where: { email },
        });
        if (existingStudent) {
            throw new ApiError(400, "Email already registered");
        }
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase() +
            Math.random().toString(36).substring(2, 6).toUpperCase();
        const tempPassword = password && password.trim().length >= 6
            ? password.trim()
            : `BQ-STU-${randomChars}`;
        const hashedPass = await hashedPassword(tempPassword);
        const newStudent = await this.db.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPass,
                name: name || "Student",
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                location: location || "Philippines",
                level: 1,
                xp: 0,
                streak: 0,
            },
        });
        sendStudentCredentialsEmail({
            toEmail: email.toLowerCase().trim(),
            name: name || "Student",
            password: tempPassword,
            studentId: newStudent.id,
        }).catch((err) => console.error("[StudentService] Email send error:", err));
        return {
            id: newStudent.id,
            email: newStudent.email,
            name: newStudent.name,
            firstName: newStudent.firstName,
            lastName: newStudent.lastName,
            level: newStudent.level,
            xp: newStudent.xp,
            streak: newStudent.streak,
            location: newStudent.location,
            createdAt: newStudent.createdAt,
        };
    }
    /**
     * Get all students with optional filters
     */
    async getAllStudents(options) {
        const { search, level, location, advisorId, skip = 0, take = 50 } = options || {};
        const where = {};
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
            ];
        }
        if (level && level !== "ALL") {
            if (level === "1")
                where.level = 1;
            else if (level === "2")
                where.level = 2;
            else if (level === "3")
                where.level = 3;
            else if (level === "4+")
                where.level = { gte: 4 };
        }
        if (location && location !== "ALL") {
            where.location = { contains: location, mode: "insensitive" };
        }
        if (advisorId) {
            where.guidanceAssignments = {
                some: {
                    advisorId,
                },
            };
        }
        let students = await this.db.user.findMany({
            where,
            skip,
            take,
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                level: true,
                xp: true,
                streak: true,
                location: true,
                createdAt: true,
                achievements: {
                    orderBy: { timestamp: "desc" },
                    take: 5,
                },
                userBadges: {
                    where: {
                        badge: {
                            isActive: true,
                        },
                    },
                    include: {
                        badge: true,
                    },
                    orderBy: { unlockedAt: "desc" },
                },
                guidanceAssignments: {
                    select: {
                        id: true,
                        advisorId: true,
                        status: true,
                        subjectCategory: true,
                        reason: true,
                        advisor: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const total = await this.db.user.count({ where });
        // Ensure deactivated badges are stripped out on backend level
        const sanitizedStudents = students.map((s) => ({
            ...s,
            userBadges: (s.userBadges || []).filter((ub) => !ub.badge || ub.badge.isActive !== false),
        }));
        return {
            data: sanitizedStudents,
            pagination: {
                total,
                skip,
                take,
                pages: Math.ceil(total / take),
            },
        };
    }
    /**
     * Get student profile by ID
     */
    async getStudentById(studentId) {
        if (!studentId || typeof studentId !== "string" || !/^[0-9a-fA-F]{24}$/.test(studentId)) {
            throw new ApiError(404, "Student not found");
        }
        try {
            const student = await this.db.user.findUnique({
                where: { id: studentId },
                include: {
                    mastery: true,
                    achievements: {
                        orderBy: { timestamp: "desc" },
                    },
                    examResults: {
                        orderBy: { timestamp: "desc" },
                    },
                    studyPlans: true,
                    lessonCompletions: true,
                    userBadges: {
                        where: {
                            badge: {
                                isActive: true,
                            },
                        },
                        include: {
                            badge: true,
                        },
                        orderBy: { unlockedAt: "desc" },
                    },
                    guidanceAssignments: {
                        include: {
                            advisor: {
                                select: { id: true, name: true, email: true },
                            },
                        },
                    },
                },
            });
            if (!student) {
                throw new ApiError(404, "Student not found");
            }
            const { password: _password, ...sanitizedStudent } = student;
            // Filter out any deactivated badges on the backend level
            if (sanitizedStudent.userBadges && Array.isArray(sanitizedStudent.userBadges)) {
                sanitizedStudent.userBadges = sanitizedStudent.userBadges.filter((ub) => !ub.badge || ub.badge.isActive !== false);
            }
            return sanitizedStudent;
        }
        catch (err) {
            if (err instanceof ApiError)
                throw err;
            throw new ApiError(404, "Student not found");
        }
    }
    /**
     * Update student profile
     */
    async updateStudent(data) {
        const parsed = updateStudentSchema.safeParse(data);
        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
        }
        const { studentId, name: rawName, firstName: rawFirst, lastName: rawLast, location } = parsed.data;
        const existingStudent = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!existingStudent) {
            throw new ApiError(404, "Student not found");
        }
        const updateData = {};
        if (rawFirst !== undefined)
            updateData.firstName = rawFirst.trim();
        if (rawLast !== undefined)
            updateData.lastName = rawLast.trim();
        if (rawName !== undefined && rawName.trim().length > 0) {
            updateData.name = rawName.trim();
        }
        else if (rawFirst !== undefined || rawLast !== undefined) {
            const effectiveFirst = rawFirst !== undefined ? rawFirst.trim() : existingStudent.firstName || "";
            const effectiveLast = rawLast !== undefined ? rawLast.trim() : existingStudent.lastName || "";
            const combined = [effectiveFirst, effectiveLast].filter(Boolean).join(" ").trim();
            if (combined) {
                updateData.name = combined;
            }
        }
        if (location)
            updateData.location = location.trim();
        const updatedStudent = await this.db.user.update({
            where: { id: studentId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                lastName: true,
                level: true,
                xp: true,
                streak: true,
                location: true,
            },
        });
        return updatedStudent;
    }
    /**
     * Delete student account
     */
    async deleteStudent(studentId) {
        const student = await this.db.user.findUnique({
            where: { id: studentId },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        await this.db.user.delete({
            where: { id: studentId },
        });
        return { message: "Student deleted successfully" };
    }
    /**
     * Get student statistics (level, XP, streak)
     */
    async getStudentStats(studentId) {
        const student = await this.db.user.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                level: true,
                xp: true,
                streak: true,
                createdAt: true,
            },
        });
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        const totalAchievements = await this.db.achievement.count({
            where: { userId: studentId },
        });
        const totalXPEarned = await this.db.achievement.aggregate({
            where: { userId: studentId },
            _sum: {
                xp: true,
            },
        });
        return {
            ...student,
            totalAchievements,
            totalXPEarned: totalXPEarned._sum.xp || 0,
        };
    }
    /**
     * Bulk create / enroll students from CSV
     */
    async bulkCreateStudents(students) {
        if (!Array.isArray(students) || students.length === 0) {
            throw new ApiError(400, "No student entries provided for import.");
        }
        const createdStudents = [];
        const errors = [];
        for (let i = 0; i < students.length; i++) {
            const item = students[i];
            const { name, firstName, lastName } = this.resolveNameParts(item.name, item.firstName, item.lastName);
            const email = item.email?.trim().toLowerCase();
            if (!name || !email) {
                errors.push({ email: email || "unknown", name: name || "unknown", error: "Name and Email are required fields." });
                continue;
            }
            const existing = await this.db.user.findUnique({
                where: { email },
            });
            if (existing) {
                errors.push({ email, name, error: "Email already registered." });
                continue;
            }
            const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
            const tempPassword = `BQ-STU-${randomChars}`;
            try {
                const hash = await hashedPassword(tempPassword);
                const newStudent = await this.db.user.create({
                    data: {
                        email,
                        password: hash,
                        name,
                        firstName: firstName || undefined,
                        lastName: lastName || undefined,
                        location: item.location?.trim() || "Philippines",
                        level: 1,
                        xp: 0,
                        streak: 0,
                    },
                });
                sendStudentCredentialsEmail({
                    toEmail: email,
                    name,
                    password: tempPassword,
                    studentId: newStudent.id,
                }).catch((err) => console.error("[BulkStudentImport] Email send error:", err));
                const { password, ...sanitized } = newStudent;
                createdStudents.push(sanitized);
            }
            catch (err) {
                errors.push({ email, name, error: err.message || "Failed to enroll student" });
            }
        }
        return {
            totalProcessed: students.length,
            createdCount: createdStudents.length,
            skippedCount: errors.length,
            createdStudents,
            errors,
        };
    }
}
// ============ Service Instantiations ============
export const studentService = new StudentService();
export const studyPlanService = new StudyPlanService();
export const subjectMasteryService = new SubjectMasteryService();
export const examResultService = new ExamResultService();
export const achievementService = new AchievementService();
export const lessonCompletionService = new LessonCompletionService();
// ============ Re-exports for Backward Compatibility ============
export const createStudent = studentService.createStudent.bind(studentService);
export const getAllStudents = studentService.getAllStudents.bind(studentService);
export const getStudentById = studentService.getStudentById.bind(studentService);
export const updateStudent = studentService.updateStudent.bind(studentService);
export const deleteStudent = studentService.deleteStudent.bind(studentService);
export const getStudentStats = studentService.getStudentStats.bind(studentService);
export const bulkCreateStudents = studentService.bulkCreateStudents.bind(studentService);
export const createStudyPlan = studyPlanService.createStudyPlan.bind(studyPlanService);
export const getStudyPlans = studyPlanService.getStudyPlans.bind(studyPlanService);
export const deleteStudyPlan = studyPlanService.deleteStudyPlan.bind(studyPlanService);
export const updateSubjectMastery = subjectMasteryService.updateSubjectMastery.bind(subjectMasteryService);
export const getSubjectMastery = subjectMasteryService.getSubjectMastery.bind(subjectMasteryService);
export const recordExamResult = examResultService.recordExamResult.bind(examResultService);
export const getExamResults = examResultService.getExamResults.bind(examResultService);
export const getExamResultStats = examResultService.getExamResultStats.bind(examResultService);
export const awardAchievement = achievementService.awardAchievement.bind(achievementService);
export const getAchievements = achievementService.getAchievements.bind(achievementService);
export const recordLessonCompletion = lessonCompletionService.recordLessonCompletion.bind(lessonCompletionService);
export const getLessonCompletions = lessonCompletionService.getLessonCompletions.bind(lessonCompletionService);
export const getLessonCompletionProgress = lessonCompletionService.getLessonCompletionProgress.bind(lessonCompletionService);
// ============ Re-exports of Schemas and Types ============
export { createStudyPlanSchema, StudyPlanService, updateSubjectMasterySchema, SubjectMasteryService, recordExamResultSchema, ExamResultService, awardAchievementSchema, AchievementService, recordLessonCompletionSchema, LessonCompletionService };
