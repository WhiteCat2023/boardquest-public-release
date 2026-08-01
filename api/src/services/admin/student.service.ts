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

export const createStudentSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  location: z.string().optional(),
});

// ============ Type Definitions ============

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

// ============ Student Management Services ============

export class StudentService {
  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Create a new student account
   */
  async createStudent(data: CreateStudentInput) {
    const parsed = createStudentSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { email, password, name, location } = parsed.data;

    const existingStudent = await this.db.user.findUnique({
      where: { email },
    });

    if (existingStudent) {
      throw new ApiError(400, "Email already registered");
    }

    const hashedPass = await hashedPassword(password);

    const newStudent = await this.db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPass,
        name: name.trim(),
        location: location || "Philippines",
        level: 1,
        xp: 0,
        streak: 0,
      },
    });

    return {
      id: newStudent.id,
      email: newStudent.email,
      name: newStudent.name,
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
  async getAllStudents(options?: {
    search?: string;
    level?: string;
    location?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, level, location, skip = 0, take = 50 } = options || {};

    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
      ];
    }

    if (level && level !== "ALL") {
      if (level === "1") where.level = 1;
      else if (level === "2") where.level = 2;
      else if (level === "3") where.level = 3;
      else if (level === "4+") where.level = { gte: 4 };
    }

    if (location && location !== "ALL") {
      where.location = { contains: location, mode: "insensitive" };
    }

    const students = await this.db.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        streak: true,
        location: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await this.db.user.count({ where });

    return {
      data: students,
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
  async getStudentById(studentId: string) {
    if (!studentId || typeof studentId !== "string" || !/^[0-9a-fA-F]{24}$/.test(studentId)) {
      throw new ApiError(404, "Student not found");
    }

    try {
      const student = await this.db.user.findUnique({
        where: { id: studentId },
        include: {
          mastery: true,
          achievements: true,
          examResults: true,
          studyPlans: true,
          lessonCompletions: true,
        },
      });

      if (!student) {
        throw new ApiError(404, "Student not found");
      }
      const { password: _password, ...sanitizedStudent } = student;
      
      return sanitizedStudent;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(404, "Student not found");
    }
  }

  /**
   * Update student profile
   */
  async updateStudent(data: UpdateStudentInput) {
    const parsed = updateStudentSchema.safeParse(data);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
    }

    const { studentId, name, location } = parsed.data;

    const existingStudent = await this.db.user.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new ApiError(404, "Student not found");
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();

    const updatedStudent = await this.db.user.update({
      where: { id: studentId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
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
  async deleteStudent(studentId: string) {
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
  async getStudentStats(studentId: string) {
    const student = await this.db.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
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
  async bulkCreateStudents(students: Array<{
    name: string;
    email: string;
    location?: string;
    program?: string;
    yearLevel?: string;
  }>) {
    if (!Array.isArray(students) || students.length === 0) {
      throw new ApiError(400, "No student entries provided for import.");
    }

    const createdStudents: any[] = [];
    const errors: Array<{ email: string; name: string; error: string }> = [];

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      const name = item.name?.trim();
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
      } catch (err: any) {
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
export {
  createStudyPlanSchema,
  StudyPlanService,
  
  updateSubjectMasterySchema,
  SubjectMasteryService,
  
  recordExamResultSchema,
  ExamResultService,
  
  awardAchievementSchema,
  AchievementService,
  
  recordLessonCompletionSchema,
  LessonCompletionService
};

export type { CreateStudyPlanInput } from "./studyPlan.service";
export type { UpdateSubjectMasteryInput } from "./subjectMastery.service";
export type { RecordExamResultInput } from "./examResult.service";
export type { AwardAchievementInput } from "./achievement.service";
export type { RecordLessonCompletionInput } from "./lessonCompletion.service";
