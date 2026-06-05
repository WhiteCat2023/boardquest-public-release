import { z } from "zod";
import { ApiError } from "../../utils/apiError";
import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";

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

export const createStudyPlanSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().min(1, "Subject is required"),
  targetDate: z.string().datetime("Invalid date format"),
});

export const updateSubjectMasterySchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().min(1, "Subject is required"),
  proficiency: z.number().min(0).max(100, "Proficiency must be between 0-100"),
  minScore: z.number().min(0).optional(),
  status: z.enum(["In Training", "Mastered", "Review"]).optional(),
});

export const recordExamResultSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  score: z.number().min(0, "Score must be positive"),
  total: z.number().min(1, "Total must be at least 1"),
  subject: z.string().optional(),
}).refine((data) => data.score <= data.total, {
  message: "Score cannot exceed total",
  path: ["score"],
});

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

export const recordLessonCompletionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().min(1, "Subject is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  status: z.enum(["completed", "in-progress", "not-started"]),
});

// ============ Type Definitions ============

type CreateStudentInput = z.infer<typeof createStudentSchema>;
type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
type UpdateSubjectMasteryInput = z.infer<typeof updateSubjectMasterySchema>;
type RecordExamResultInput = z.infer<typeof recordExamResultSchema>;
type AwardAchievementInput = z.infer<typeof awardAchievementSchema>;
type RecordLessonCompletionInput = z.infer<typeof recordLessonCompletionSchema>;

// ============ Student Management Services ============

/**
 * Create a new student account
 */
export const createStudent = async (data: CreateStudentInput) => {
  const parsed = createStudentSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { email, password, name, location } = parsed.data;

  const existingStudent = await prisma.user.findUnique({
    where: { email },
  });

  if (existingStudent) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPass = await hashedPassword(password);

  const newStudent = await prisma.user.create({
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
};

/**
 * Get all students with optional filters
 */
export const getAllStudents = async (skip: number = 0, take: number = 10) => {
  const students = await prisma.user.findMany({
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
  });

  const total = await prisma.user.count();

  return {
    data: students,
    pagination: {
      total,
      skip,
      take,
      pages: Math.ceil(total / take),
    },
  };
};

/**
 * Get student profile by ID
 */
export const getStudentById = async (studentId: string) => {
  const student = await prisma.user.findUnique({
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

  return student;
};

/**
 * Update student profile
 */
export const updateStudent = async (data: UpdateStudentInput) => {
  const parsed = updateStudentSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, name, location } = parsed.data;

  const existingStudent = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!existingStudent) {
    throw new ApiError(404, "Student not found");
  }

  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (location) updateData.location = location.trim();

  const updatedStudent = await prisma.user.update({
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
};

/**
 * Delete student account
 */
export const deleteStudent = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  await prisma.user.delete({
    where: { id: studentId },
  });

  return { message: "Student deleted successfully" };
};

/**
 * Get student statistics (level, XP, streak)
 */
export const getStudentStats = async (studentId: string) => {
  const student = await prisma.user.findUnique({
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

  const totalAchievements = await prisma.achievement.count({
    where: { userId: studentId },
  });

  const totalXPEarned = await prisma.achievement.aggregate({
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
};

// ============ Study Plan Services ============

/**
 * Create or update a study plan for a student
 */
export const createStudyPlan = async (data: CreateStudyPlanInput) => {
  const parsed = createStudyPlanSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, subject, targetDate } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const studyPlan = await prisma.studyPlan.upsert({
    where: { userId_subject: { userId: studentId, subject } },
    update: {
      targetDate: new Date(targetDate),
    },
    create: {
      userId: studentId,
      subject,
      targetDate: new Date(targetDate),
    },
  });

  return studyPlan;
};

/**
 * Get all study plans for a student
 */
export const getStudyPlans = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const studyPlans = await prisma.studyPlan.findMany({
    where: { userId: studentId },
  });

  return studyPlans;
};

/**
 * Delete a study plan
 */
export const deleteStudyPlan = async (studentId: string, subject: string) => {
  const plan = await prisma.studyPlan.findUnique({
    where: { userId_subject: { userId: studentId, subject } },
  });

  if (!plan) {
    throw new ApiError(404, "Study plan not found");
  }

  await prisma.studyPlan.delete({
    where: { userId_subject: { userId: studentId, subject } },
  });

  return { message: "Study plan deleted successfully" };
};

// ============ Subject Mastery Services ============

/**
 * Update subject mastery for a student
 */
export const updateSubjectMastery = async (data: UpdateSubjectMasteryInput) => {
  const parsed = updateSubjectMasterySchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, subject, proficiency, minScore, status } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const mastery = await prisma.subjectMastery.upsert({
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
};

/**
 * Get subject mastery for a student
 */
export const getSubjectMastery = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const mastery = await prisma.subjectMastery.findMany({
    where: { userId: studentId },
  });

  return mastery;
};

// ============ Exam Result Services ============

/**
 * Record an exam result for a student
 */
export const recordExamResult = async (data: RecordExamResultInput) => {
  const parsed = recordExamResultSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, score, total, subject } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const accuracy = (score / total) * 100;

  const examResult = await prisma.examResult.create({
    data: {
      userId: studentId,
      score,
      total,
      accuracy,
      subject: subject || "General",
    },
  });

  return examResult;
};

/**
 * Get exam results for a student
 */
export const getExamResults = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const results = await prisma.examResult.findMany({
    where: { userId: studentId },
    orderBy: { timestamp: "desc" },
  });

  return results;
};

/**
 * Get exam result statistics for a student
 */
export const getExamResultStats = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const results = await prisma.examResult.findMany({
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
};

// ============ Achievement Services ============

/**
 * Award an achievement to a student
 */
export const awardAchievement = async (data: AwardAchievementInput) => {
  const parsed = awardAchievementSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, task, type, badge, xp, confidenceLevel, accuracy, questMode, subject } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const achievement = await prisma.achievement.create({
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
  await prisma.user.update({
    where: { id: studentId },
    data: {
      xp: {
        increment: xp,
      },
    },
  });

  return achievement;
};

/**
 * Get achievements for a student
 */
export const getAchievements = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const achievements = await prisma.achievement.findMany({
    where: { userId: studentId },
    orderBy: { timestamp: "desc" },
  });

  return achievements;
};

// ============ Lesson Completion Services ============

/**
 * Record lesson completion
 */
export const recordLessonCompletion = async (data: RecordLessonCompletionInput) => {
  const parsed = recordLessonCompletionSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new ApiError(400, "Validation failed", [JSON.stringify(errors)]);
  }

  const { studentId, subject, lessonId, status } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const completion = await prisma.lessonCompletion.upsert({
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
};

/**
 * Get lesson completions for a student
 */
export const getLessonCompletions = async (studentId: string, subject?: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const completions = await prisma.lessonCompletion.findMany({
    where: {
      userId: studentId,
      ...(subject && { subject }),
    },
  });

  return completions;
};

/**
 * Get lesson completion progress
 */
export const getLessonCompletionProgress = async (studentId: string) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const completions = await prisma.lessonCompletion.findMany({
    where: { userId: studentId },
  });

  const grouped = completions.reduce((acc, completion) => {
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
};
