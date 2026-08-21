import { PrismaClient, GuidanceStatus } from "@prisma/client";
import { hashedPassword } from "../utils/hash";

export interface DemoStudentData {
  id: string;
  email: string;
  password: string; // Plaintext to be hashed during seeding
  name: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  level: number;
  xp: number;
  streak: number;
  location: string;
  createdAt: Date;
  mastery: Array<{
    subject: string;
    proficiency: number;
    minScore: number;
    status: string;
  }>;
  examResults: Array<{
    score: number;
    total: number;
    accuracy: number;
    subject: string;
    timestamp: Date;
  }>;
  achievements: Array<{
    task: string;
    type: "quest" | "exam";
    badge?: string;
    xp: number;
    confidenceLevel?: "Shaky" | "Steady" | "Unyielding";
    accuracy?: number;
    questMode?: "learning" | "test";
    subject?: string;
    timestamp: Date;
  }>;
  userBadges: Array<{
    badgeSlug: string;
    subject?: string;
    questMode?: string;
    accuracy?: number;
    confidenceLevel?: string;
    xpEarned: number;
    unlockedAt: Date;
  }>;
  studyPlans: Array<{
    subject: string;
    targetDate: Date;
  }>;
  lessonCompletions: Array<{
    subject: string;
    lessonId: string;
    status: string;
  }>;
  guidanceAssignments?: Array<{
    advisorId: string;
    assignedById: string;
    status: GuidanceStatus;
    subjectCategory: string;
    reason: string;
    guidanceNotes?: string;
    resolutionNotes?: string;
    createdAt: Date;
  }>;
}

export const demoStudents: DemoStudentData[] = [
  // 1. Maria Angela Santos - Top Clinical Chemistry Aspirant
  {
    id: "65f1a1000000000000000001",
    email: "maria.santos@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Maria Angela Santos",
    firstName: "Maria Angela",
    lastName: "Santos",
    verified: true,
    level: 8,
    xp: 7450,
    streak: 14,
    location: "Manila, Metro Manila",
    createdAt: new Date("2026-01-10T08:00:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 95, minScore: 85, status: "Mastered" },
      { subject: "Microbiology", proficiency: 88, minScore: 80, status: "Mastered" },
      { subject: "Hematology", proficiency: 84, minScore: 75, status: "Competent" },
      { subject: "Clinical Microscopy & Parasitology", proficiency: 80, minScore: 70, status: "Competent" },
      { subject: "Immunology & Serology and Immunohematology", proficiency: 78, minScore: 70, status: "Competent" },
      { subject: "Histopathology and Medtech Laws", proficiency: 82, minScore: 75, status: "Competent" },
    ],
    examResults: [
      { score: 48, total: 50, accuracy: 96.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-18T10:30:00Z") },
      { score: 45, total: 50, accuracy: 90.0, subject: "Microbiology", timestamp: new Date("2026-02-15T14:15:00Z") },
      { score: 94, total: 100, accuracy: 94.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-10T09:00:00Z") },
      { score: 42, total: 50, accuracy: 84.0, subject: "Hematology", timestamp: new Date("2026-02-05T11:00:00Z") },
    ],
    achievements: [
      { task: "Mastered Clinical Chemistry", type: "exam", badge: "gold", xp: 200, confidenceLevel: "Unyielding", accuracy: 96.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-18T10:30:00Z") },
      { task: "Achieved 14-Day Study Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Unyielding", timestamp: new Date("2026-02-17T08:00:00Z") },
      { task: "Swift Solver on Microbiology Quiz", type: "exam", badge: "speed", xp: 250, confidenceLevel: "Steady", accuracy: 90.0, subject: "Microbiology", timestamp: new Date("2026-02-15T14:15:00Z") },
      { task: "High Accuracy in Evaluation Tests", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Steady", accuracy: 88.0, timestamp: new Date("2026-01-25T16:00:00Z") },
      { task: "Completed First Diagnostic Evaluation", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-10T09:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "gold", subject: "Clinical Chemistry", questMode: "test", accuracy: 96.0, confidenceLevel: "Unyielding", xpEarned: 200, unlockedAt: new Date("2026-02-18T10:30:00Z") },
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-02-17T08:00:00Z") },
      { badgeSlug: "speed", subject: "Microbiology", questMode: "test", accuracy: 90.0, confidenceLevel: "Steady", xpEarned: 250, unlockedAt: new Date("2026-02-15T14:15:00Z") },
      { badgeSlug: "silver", xpEarned: 150, unlockedAt: new Date("2026-01-25T16:00:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-10T09:00:00Z") },
    ],
    studyPlans: [
      { subject: "Clinical Chemistry", targetDate: new Date("2026-03-15T00:00:00Z") },
      { subject: "Microbiology", targetDate: new Date("2026-03-30T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "completed" },
      { subject: "Clinical Chemistry", lessonId: "cc-2", status: "completed" },
      { subject: "Microbiology", lessonId: "mb-1", status: "completed" },
    ],
  },

  // 2. Juan Carlos Dela Cruz - Solid Performer in Hematology
  {
    id: "65f1a1000000000000000002",
    email: "juan.delacruz@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Juan Carlos Dela Cruz",
    firstName: "Juan Carlos",
    lastName: "Dela Cruz",
    verified: true,
    level: 6,
    xp: 5200,
    streak: 8,
    location: "Quezon City, Metro Manila",
    createdAt: new Date("2026-01-12T09:00:00Z"),
    mastery: [
      { subject: "Hematology", proficiency: 86, minScore: 75, status: "Mastered" },
      { subject: "Clinical Chemistry", proficiency: 80, minScore: 70, status: "Competent" },
      { subject: "Microbiology", proficiency: 76, minScore: 70, status: "Competent" },
      { subject: "Clinical Microscopy & Parasitology", proficiency: 74, minScore: 65, status: "In Training" },
      { subject: "Immunology & Serology and Immunohematology", proficiency: 70, minScore: 65, status: "In Training" },
    ],
    examResults: [
      { score: 44, total: 50, accuracy: 88.0, subject: "Hematology", timestamp: new Date("2026-02-16T11:00:00Z") },
      { score: 40, total: 50, accuracy: 80.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-12T15:00:00Z") },
      { score: 38, total: 50, accuracy: 76.0, subject: "Microbiology", timestamp: new Date("2026-02-08T10:00:00Z") },
    ],
    achievements: [
      { task: "Maintained 7-Day Study Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Steady", timestamp: new Date("2026-02-15T08:00:00Z") },
      { task: "Achieved >=85% in Hematology Evaluation", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Steady", accuracy: 88.0, subject: "Hematology", timestamp: new Date("2026-02-16T11:00:00Z") },
      { task: "Completed Initial Diagnostic Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-12T10:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-02-15T08:00:00Z") },
      { badgeSlug: "silver", subject: "Hematology", questMode: "test", accuracy: 88.0, confidenceLevel: "Steady", xpEarned: 150, unlockedAt: new Date("2026-02-16T11:00:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-12T10:00:00Z") },
    ],
    studyPlans: [
      { subject: "Hematology", targetDate: new Date("2026-03-20T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Hematology", lessonId: "hema-1", status: "completed" },
      { subject: "Hematology", lessonId: "hema-2", status: "completed" },
    ],
  },

  // 3. Bea Nicole Reyes - Elite Top Scholar (Conquered Boss Slayer)
  {
    id: "65f1a1000000000000000003",
    email: "bea.reyes@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Bea Nicole Reyes",
    firstName: "Bea Nicole",
    lastName: "Reyes",
    verified: true,
    level: 10,
    xp: 9850,
    streak: 28,
    location: "Cebu City, Cebu",
    createdAt: new Date("2026-01-05T07:30:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 98, minScore: 90, status: "Mastered" },
      { subject: "Microbiology", proficiency: 96, minScore: 88, status: "Mastered" },
      { subject: "Hematology", proficiency: 95, minScore: 88, status: "Mastered" },
      { subject: "Clinical Microscopy & Parasitology", proficiency: 94, minScore: 85, status: "Mastered" },
      { subject: "Immunology & Serology and Immunohematology", proficiency: 92, minScore: 85, status: "Mastered" },
      { subject: "Histopathology and Medtech Laws", proficiency: 95, minScore: 88, status: "Mastered" },
    ],
    examResults: [
      { score: 98, total: 100, accuracy: 98.0, subject: "Comprehensive Mock Board", timestamp: new Date("2026-02-19T14:00:00Z") },
      { score: 50, total: 50, accuracy: 100.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-17T09:30:00Z") },
      { score: 49, total: 50, accuracy: 98.0, subject: "Microbiology", timestamp: new Date("2026-02-14T11:00:00Z") },
      { score: 48, total: 50, accuracy: 96.0, subject: "Hematology", timestamp: new Date("2026-02-10T16:00:00Z") },
    ],
    achievements: [
      { task: "Boss Slayer - Conquered Major Mock Board Exam", type: "exam", badge: "boss-slayer", xp: 500, confidenceLevel: "Unyielding", accuracy: 98.0, subject: "Comprehensive Mock Board", timestamp: new Date("2026-02-19T14:00:00Z") },
      { task: "100% Perfect Score in Quest Arena", type: "exam", badge: "gold", xp: 200, confidenceLevel: "Unyielding", accuracy: 100.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-17T09:30:00Z") },
      { task: "Speed Master Precision Solver", type: "exam", badge: "speed", xp: 250, confidenceLevel: "Unyielding", accuracy: 98.0, subject: "Microbiology", timestamp: new Date("2026-02-14T11:00:00Z") },
      { task: "28-Day Active Study Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Unyielding", timestamp: new Date("2026-02-18T08:00:00Z") },
      { task: "High Distinction Evaluation", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Unyielding", accuracy: 96.0, timestamp: new Date("2026-01-20T10:00:00Z") },
      { task: "Completed First Evaluation Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Unyielding", timestamp: new Date("2026-01-05T08:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "boss-slayer", subject: "Comprehensive Mock Board", questMode: "boss", accuracy: 98.0, confidenceLevel: "Unyielding", xpEarned: 500, unlockedAt: new Date("2026-02-19T14:00:00Z") },
      { badgeSlug: "gold", subject: "Clinical Chemistry", questMode: "test", accuracy: 100.0, confidenceLevel: "Unyielding", xpEarned: 200, unlockedAt: new Date("2026-02-17T09:30:00Z") },
      { badgeSlug: "speed", subject: "Microbiology", questMode: "test", accuracy: 98.0, confidenceLevel: "Unyielding", xpEarned: 250, unlockedAt: new Date("2026-02-14T11:00:00Z") },
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-02-02T08:00:00Z") },
      { badgeSlug: "silver", xpEarned: 150, unlockedAt: new Date("2026-01-20T10:00:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-05T08:00:00Z") },
    ],
    studyPlans: [
      { subject: "Comprehensive Mock Board", targetDate: new Date("2026-03-31T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "completed" },
      { subject: "Clinical Chemistry", lessonId: "cc-2", status: "completed" },
      { subject: "Microbiology", lessonId: "mb-1", status: "completed" },
      { subject: "Hematology", lessonId: "hema-1", status: "completed" },
    ],
  },

  // 4. Mark Anthony Tan - Needs Guidance in Immunology
  {
    id: "65f1a1000000000000000004",
    email: "mark.tan@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Mark Anthony Tan",
    firstName: "Mark Anthony",
    lastName: "Tan",
    verified: true,
    level: 4,
    xp: 3100,
    streak: 4,
    location: "Davao City, Davao del Sur",
    createdAt: new Date("2026-01-18T10:00:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 72, minScore: 60, status: "Competent" },
      { subject: "Microbiology", proficiency: 68, minScore: 60, status: "In Training" },
      { subject: "Immunology & Serology and Immunohematology", proficiency: 54, minScore: 50, status: "In Training" },
    ],
    examResults: [
      { score: 36, total: 50, accuracy: 72.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-14T09:00:00Z") },
      { score: 27, total: 50, accuracy: 54.0, subject: "Immunology & Serology and Immunohematology", timestamp: new Date("2026-02-11T13:00:00Z") },
      { score: 34, total: 50, accuracy: 68.0, subject: "Microbiology", timestamp: new Date("2026-02-06T15:30:00Z") },
    ],
    achievements: [
      { task: "Completed Initial Diagnostic Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-18T11:00:00Z") },
      { task: "Achieved 70%+ in Clinical Chemistry", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Shaky", accuracy: 72.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-14T09:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-18T11:00:00Z") },
      { badgeSlug: "silver", xpEarned: 150, unlockedAt: new Date("2026-02-14T09:00:00Z") },
    ],
    studyPlans: [
      { subject: "Immunology & Serology and Immunohematology", targetDate: new Date("2026-03-10T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "completed" },
      { subject: "Immunology & Serology and Immunohematology", lessonId: "immuno-1", status: "in-progress" },
    ],
    guidanceAssignments: [
      {
        advisorId: "507f1f77bcf86cd799439012", // Teacher User Two
        assignedById: "507f1f77bcf86cd799439011", // Dean User One
        status: GuidanceStatus.IN_PROGRESS,
        subjectCategory: "Immunology & Serology and Immunohematology",
        reason: "Low diagnostic accuracy (<60%) in antibody detection and serological titers.",
        guidanceNotes: "Scheduled review session covering agglutination reactions and blood bank protocols.",
        createdAt: new Date("2026-02-12T08:00:00Z"),
      },
    ],
  },

  // 5. Alyssa Mae Garcia - Strong Microbiology & Parasitology
  {
    id: "65f1a1000000000000000005",
    email: "alyssa.garcia@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Alyssa Mae Garcia",
    firstName: "Alyssa Mae",
    lastName: "Garcia",
    verified: true,
    level: 7,
    xp: 6350,
    streak: 11,
    location: "Iloilo City, Iloilo",
    createdAt: new Date("2026-01-08T08:30:00Z"),
    mastery: [
      { subject: "Microbiology", proficiency: 92, minScore: 85, status: "Mastered" },
      { subject: "Clinical Microscopy & Parasitology", proficiency: 88, minScore: 80, status: "Mastered" },
      { subject: "Hematology", proficiency: 81, minScore: 75, status: "Competent" },
      { subject: "Clinical Chemistry", proficiency: 79, minScore: 70, status: "Competent" },
    ],
    examResults: [
      { score: 46, total: 50, accuracy: 92.0, subject: "Microbiology", timestamp: new Date("2026-02-17T11:00:00Z") },
      { score: 44, total: 50, accuracy: 88.0, subject: "Clinical Microscopy & Parasitology", timestamp: new Date("2026-02-13T14:30:00Z") },
      { score: 41, total: 50, accuracy: 82.0, subject: "Hematology", timestamp: new Date("2026-02-09T16:00:00Z") },
    ],
    achievements: [
      { task: "Achieved Master Accuracy in Microbiology", type: "exam", badge: "gold", xp: 200, confidenceLevel: "Unyielding", accuracy: 92.0, subject: "Microbiology", timestamp: new Date("2026-02-17T11:00:00Z") },
      { task: "10-Day Continuous Study Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Steady", timestamp: new Date("2026-02-16T08:00:00Z") },
      { task: "Passed Diagnostic Parasitology", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Steady", accuracy: 88.0, timestamp: new Date("2026-02-13T14:30:00Z") },
      { task: "Enrolled and Passed Orientation Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-08T09:30:00Z") },
    ],
    userBadges: [
      { badgeSlug: "gold", subject: "Microbiology", questMode: "test", accuracy: 92.0, confidenceLevel: "Unyielding", xpEarned: 200, unlockedAt: new Date("2026-02-17T11:00:00Z") },
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-02-16T08:00:00Z") },
      { badgeSlug: "silver", xpEarned: 150, unlockedAt: new Date("2026-02-13T14:30:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-08T09:30:00Z") },
    ],
    studyPlans: [
      { subject: "Microbiology", targetDate: new Date("2026-03-25T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Microbiology", lessonId: "mb-1", status: "completed" },
      { subject: "Microbiology", lessonId: "mb-2", status: "completed" },
      { subject: "Clinical Microscopy & Parasitology", lessonId: "cm-1", status: "completed" },
    ],
  },

  // 6. Christian Gabriel Bautista - Developing Mid-Level Aspirant
  {
    id: "65f1a1000000000000000006",
    email: "christian.bautista@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Christian Gabriel Bautista",
    firstName: "Christian Gabriel",
    lastName: "Bautista",
    verified: true,
    level: 3,
    xp: 2200,
    streak: 3,
    location: "Baguio City, Benguet",
    createdAt: new Date("2026-01-22T11:00:00Z"),
    mastery: [
      { subject: "Hematology", proficiency: 68, minScore: 60, status: "In Training" },
      { subject: "Clinical Chemistry", proficiency: 64, minScore: 55, status: "In Training" },
      { subject: "Histopathology and Medtech Laws", proficiency: 60, minScore: 50, status: "In Training" },
    ],
    examResults: [
      { score: 34, total: 50, accuracy: 68.0, subject: "Hematology", timestamp: new Date("2026-02-15T15:00:00Z") },
      { score: 32, total: 50, accuracy: 64.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-10T10:00:00Z") },
    ],
    achievements: [
      { task: "Enrolled in BoardQuest Academy", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-22T12:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-22T12:00:00Z") },
    ],
    studyPlans: [
      { subject: "Hematology", targetDate: new Date("2026-04-01T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Hematology", lessonId: "hema-1", status: "completed" },
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "in-progress" },
    ],
  },

  // 7. Patricia Louise Mendoza - Consistent Medtech Laws & Histopath Scholar
  {
    id: "65f1a1000000000000000007",
    email: "patricia.mendoza@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Patricia Louise Mendoza",
    firstName: "Patricia Louise",
    lastName: "Mendoza",
    verified: true,
    level: 5,
    xp: 4550,
    streak: 9,
    location: "Angeles City, Pampanga",
    createdAt: new Date("2026-01-14T09:00:00Z"),
    mastery: [
      { subject: "Histopathology and Medtech Laws", proficiency: 85, minScore: 75, status: "Mastered" },
      { subject: "Clinical Chemistry", proficiency: 78, minScore: 70, status: "Competent" },
      { subject: "Microbiology", proficiency: 75, minScore: 70, status: "Competent" },
      { subject: "Hematology", proficiency: 72, minScore: 65, status: "In Training" },
    ],
    examResults: [
      { score: 43, total: 50, accuracy: 86.0, subject: "Histopathology and Medtech Laws", timestamp: new Date("2026-02-18T13:00:00Z") },
      { score: 39, total: 50, accuracy: 78.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-11T11:00:00Z") },
      { score: 37, total: 50, accuracy: 74.0, subject: "Microbiology", timestamp: new Date("2026-02-07T16:00:00Z") },
    ],
    achievements: [
      { task: "Maintained 7-Day Continuous Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Steady", timestamp: new Date("2026-02-16T08:00:00Z") },
      { task: "Scored >=85% in Medtech Ethics & Laws", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Steady", accuracy: 86.0, subject: "Histopathology and Medtech Laws", timestamp: new Date("2026-02-18T13:00:00Z") },
      { task: "Completed First Diagnostic Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-14T10:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-02-16T08:00:00Z") },
      { badgeSlug: "silver", subject: "Histopathology and Medtech Laws", questMode: "test", accuracy: 86.0, confidenceLevel: "Steady", xpEarned: 150, unlockedAt: new Date("2026-02-18T13:00:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-14T10:00:00Z") },
    ],
    studyPlans: [
      { subject: "Histopathology and Medtech Laws", targetDate: new Date("2026-03-18T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Histopathology and Medtech Laws", lessonId: "histo-1", status: "completed" },
      { subject: "Histopathology and Medtech Laws", lessonId: "histo-2", status: "completed" },
    ],
  },

  // 8. Joshua Daniel Aquino - Active Guidance Case for Diagnostic Chemistry
  {
    id: "65f1a1000000000000000008",
    email: "joshua.aquino@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Joshua Daniel Aquino",
    firstName: "Joshua Daniel",
    lastName: "Aquino",
    verified: true,
    level: 2,
    xp: 1350,
    streak: 1,
    location: "Cagayan de Oro, Misamis Oriental",
    createdAt: new Date("2026-02-01T10:00:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 48, minScore: 45, status: "In Training" },
      { subject: "Hematology", proficiency: 52, minScore: 50, status: "In Training" },
    ],
    examResults: [
      { score: 24, total: 50, accuracy: 48.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-16T14:00:00Z") },
      { score: 26, total: 50, accuracy: 52.0, subject: "Hematology", timestamp: new Date("2026-02-10T10:00:00Z") },
    ],
    achievements: [
      { task: "Enrolled in BoardQuest Student Portal", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Shaky", timestamp: new Date("2026-02-01T11:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-02-01T11:00:00Z") },
    ],
    studyPlans: [
      { subject: "Clinical Chemistry", targetDate: new Date("2026-03-12T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "in-progress" },
    ],
    guidanceAssignments: [
      {
        advisorId: "507f1f77bcf86cd799439013", // Team Lead User One
        assignedById: "507f1f77bcf86cd799439011", // Dean User One
        status: GuidanceStatus.PENDING,
        subjectCategory: "Clinical Chemistry",
        reason: "Struggling with electrolyte calculations and enzymatic kinetics questions (<50% accuracy).",
        guidanceNotes: "Need 1-on-1 advisor counseling and personalized remedial problem sets.",
        createdAt: new Date("2026-02-17T09:00:00Z"),
      },
    ],
  },

  // 9. Sofia Isabel Ramos - High Rank Achiever (Multi-Subject Mastery)
  {
    id: "65f1a1000000000000000009",
    email: "sofia.ramos@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Sofia Isabel Ramos",
    firstName: "Sofia Isabel",
    lastName: "Ramos",
    verified: true,
    level: 9,
    xp: 8850,
    streak: 21,
    location: "Zamboanga City, Zamboanga del Sur",
    createdAt: new Date("2026-01-06T08:00:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 94, minScore: 88, status: "Mastered" },
      { subject: "Microbiology", proficiency: 93, minScore: 85, status: "Mastered" },
      { subject: "Hematology", proficiency: 91, minScore: 85, status: "Mastered" },
      { subject: "Immunology & Serology and Immunohematology", proficiency: 90, minScore: 82, status: "Mastered" },
      { subject: "Clinical Microscopy & Parasitology", proficiency: 89, minScore: 80, status: "Mastered" },
      { subject: "Histopathology and Medtech Laws", proficiency: 92, minScore: 85, status: "Mastered" },
    ],
    examResults: [
      { score: 96, total: 100, accuracy: 96.0, subject: "Comprehensive Mock Board", timestamp: new Date("2026-02-18T15:30:00Z") },
      { score: 48, total: 50, accuracy: 96.0, subject: "Microbiology", timestamp: new Date("2026-02-15T10:00:00Z") },
      { score: 47, total: 50, accuracy: 94.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-12T14:00:00Z") },
    ],
    achievements: [
      { task: "Boss Slayer - Subject Mock Board Champion", type: "exam", badge: "boss-slayer", xp: 500, confidenceLevel: "Unyielding", accuracy: 96.0, subject: "Comprehensive Mock Board", timestamp: new Date("2026-02-18T15:30:00Z") },
      { task: "Achieved Master Grade in Clinical Evaluations", type: "exam", badge: "gold", xp: 200, confidenceLevel: "Unyielding", accuracy: 96.0, subject: "Microbiology", timestamp: new Date("2026-02-15T10:00:00Z") },
      { task: "Maintained 21-Day Active Learning Streak", type: "quest", badge: "streak-7", xp: 300, confidenceLevel: "Unyielding", timestamp: new Date("2026-02-17T08:00:00Z") },
      { task: "Swift Solver Speed Milestone", type: "exam", badge: "speed", xp: 250, confidenceLevel: "Unyielding", accuracy: 94.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-12T14:00:00Z") },
      { task: "High Distinction Honors", type: "exam", badge: "silver", xp: 150, confidenceLevel: "Steady", accuracy: 90.0, timestamp: new Date("2026-01-22T11:00:00Z") },
      { task: "Completed Initial Evaluation Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Steady", timestamp: new Date("2026-01-06T09:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "boss-slayer", subject: "Comprehensive Mock Board", questMode: "boss", accuracy: 96.0, confidenceLevel: "Unyielding", xpEarned: 500, unlockedAt: new Date("2026-02-18T15:30:00Z") },
      { badgeSlug: "gold", subject: "Microbiology", questMode: "test", accuracy: 96.0, confidenceLevel: "Unyielding", xpEarned: 200, unlockedAt: new Date("2026-02-15T10:00:00Z") },
      { badgeSlug: "streak-7", xpEarned: 300, unlockedAt: new Date("2026-01-27T08:00:00Z") },
      { badgeSlug: "speed", subject: "Clinical Chemistry", questMode: "test", accuracy: 94.0, confidenceLevel: "Unyielding", xpEarned: 250, unlockedAt: new Date("2026-02-12T14:00:00Z") },
      { badgeSlug: "silver", xpEarned: 150, unlockedAt: new Date("2026-01-22T11:00:00Z") },
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-01-06T09:00:00Z") },
    ],
    studyPlans: [
      { subject: "Comprehensive Mock Board", targetDate: new Date("2026-03-28T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "completed" },
      { subject: "Microbiology", lessonId: "mb-1", status: "completed" },
      { subject: "Hematology", lessonId: "hema-1", status: "completed" },
    ],
  },

  // 10. Rafael Miguel Gonzales - Fresh Enrollee
  {
    id: "65f1a1000000000000000010",
    email: "rafael.gonzales@student.boardquest.edu",
    password: "StudentPassword123!",
    name: "Rafael Miguel Gonzales",
    firstName: "Rafael Miguel",
    lastName: "Gonzales",
    verified: true,
    level: 1,
    xp: 450,
    streak: 0,
    location: "Bacoor, Cavite",
    createdAt: new Date("2026-02-15T14:00:00Z"),
    mastery: [
      { subject: "Clinical Chemistry", proficiency: 40, minScore: 35, status: "In Training" },
      { subject: "Hematology", proficiency: 42, minScore: 35, status: "In Training" },
    ],
    examResults: [
      { score: 20, total: 50, accuracy: 40.0, subject: "Clinical Chemistry", timestamp: new Date("2026-02-16T10:00:00Z") },
    ],
    achievements: [
      { task: "Completed Initial Onboarding Diagnostic Quest", type: "quest", badge: "bronze", xp: 100, confidenceLevel: "Shaky", timestamp: new Date("2026-02-15T15:00:00Z") },
    ],
    userBadges: [
      { badgeSlug: "bronze", xpEarned: 100, unlockedAt: new Date("2026-02-15T15:00:00Z") },
    ],
    studyPlans: [
      { subject: "Clinical Chemistry", targetDate: new Date("2026-04-15T00:00:00Z") },
    ],
    lessonCompletions: [
      { subject: "Clinical Chemistry", lessonId: "cc-1", status: "not-started" },
    ],
  },
];

export async function seedStudents(prismaClient: PrismaClient) {
  console.log("Seeding students and gamification progress...");
  for (const student of demoStudents) {
    try {
      const hashedPass = await hashedPassword(student.password);

      await prismaClient.user.upsert({
        where: { id: student.id },
        update: {
          email: student.email,
          name: student.name,
          firstName: student.firstName,
          lastName: student.lastName,
          verified: student.verified,
          level: student.level,
          xp: student.xp,
          streak: student.streak,
          location: student.location,
        },
        create: {
          id: student.id,
          email: student.email,
          password: hashedPass,
          name: student.name,
          firstName: student.firstName,
          lastName: student.lastName,
          verified: student.verified,
          level: student.level,
          xp: student.xp,
          streak: student.streak,
          location: student.location,
          createdAt: student.createdAt,
        },
      });

      // Seed Subject Mastery
      for (const m of student.mastery) {
        await prismaClient.subjectMastery.upsert({
          where: {
            userId_subject: {
              userId: student.id,
              subject: m.subject,
            },
          },
          update: {
            proficiency: m.proficiency,
            minScore: m.minScore,
            status: m.status,
          },
          create: {
            userId: student.id,
            subject: m.subject,
            proficiency: m.proficiency,
            minScore: m.minScore,
            status: m.status,
          },
        }).catch((e: any) => console.warn(`SubjectMastery seed note for ${student.email}: ${e.message}`));
      }

      // Seed Exam Results
      const existingExamCount = await prismaClient.examResult.count({
        where: { userId: student.id },
      });
      if (existingExamCount === 0) {
        for (const ex of student.examResults) {
          await prismaClient.examResult.create({
            data: {
              userId: student.id,
              score: ex.score,
              total: ex.total,
              accuracy: ex.accuracy,
              subject: ex.subject,
              timestamp: ex.timestamp,
            },
          }).catch((e: any) => console.warn(`ExamResult seed note for ${student.email}: ${e.message}`));
        }
      }

      // Seed Achievements
      const existingAchCount = await prismaClient.achievement.count({
        where: { userId: student.id },
      });
      if (existingAchCount === 0) {
        for (const ach of student.achievements) {
          await prismaClient.achievement.create({
            data: {
              userId: student.id,
              task: ach.task,
              type: ach.type,
              badge: ach.badge,
              xp: ach.xp,
              confidenceLevel: ach.confidenceLevel,
              accuracy: ach.accuracy,
              questMode: ach.questMode,
              subject: ach.subject,
              timestamp: ach.timestamp,
            },
          }).catch((e: any) => console.warn(`Achievement seed note for ${student.email}: ${e.message}`));
        }
      }

      // Seed UserBadges
      for (const ub of student.userBadges) {
        const badge = await prismaClient.badge.findFirst({
          where: {
            OR: [
              { badgeId: ub.badgeSlug },
              { badgeId: ub.badgeSlug.toLowerCase() },
            ],
          },
        });
        if (badge) {
          const existingUserBadge = await prismaClient.userBadge.findFirst({
            where: {
              userId: student.id,
              badgeSlug: badge.badgeId,
              subject: ub.subject || null,
            },
          });
          if (!existingUserBadge) {
            await prismaClient.userBadge.create({
              data: {
                userId: student.id,
                badgeId: badge.id,
                badgeSlug: badge.badgeId,
                subject: ub.subject || null,
                questMode: ub.questMode,
                accuracy: ub.accuracy,
                confidenceLevel: ub.confidenceLevel,
                xpEarned: ub.xpEarned || badge.xpReward,
                unlockedAt: ub.unlockedAt,
              },
            }).catch((e: any) => console.warn(`UserBadge seed note for ${student.email}: ${e.message}`));
          }
        }
      }

      // Seed Study Plans
      for (const sp of student.studyPlans) {
        await prismaClient.studyPlan.upsert({
          where: {
            userId_subject: {
              userId: student.id,
              subject: sp.subject,
            },
          },
          update: {
            targetDate: sp.targetDate,
          },
          create: {
            userId: student.id,
            subject: sp.subject,
            targetDate: sp.targetDate,
          },
        }).catch((e: any) => console.warn(`StudyPlan seed note for ${student.email}: ${e.message}`));
      }

      // Seed Lesson Completions
      for (const lc of student.lessonCompletions) {
        await prismaClient.lessonCompletion.upsert({
          where: {
            userId_lessonId: {
              userId: student.id,
              lessonId: lc.lessonId,
            },
          },
          update: {
            status: lc.status,
          },
          create: {
            userId: student.id,
            subject: lc.subject,
            lessonId: lc.lessonId,
            status: lc.status,
          },
        }).catch((e: any) => console.warn(`LessonCompletion seed note for ${student.email}: ${e.message}`));
      }

      // Seed Guidance Assignments if any
      if (student.guidanceAssignments && student.guidanceAssignments.length > 0) {
        for (const ga of student.guidanceAssignments) {
          const existingGa = await prismaClient.guidanceAssignment.findFirst({
            where: {
              studentId: student.id,
              advisorId: ga.advisorId,
              subjectCategory: ga.subjectCategory,
            },
          });
          if (!existingGa) {
            await prismaClient.guidanceAssignment.create({
              data: {
                studentId: student.id,
                advisorId: ga.advisorId,
                assignedById: ga.assignedById,
                status: ga.status,
                subjectCategory: ga.subjectCategory,
                reason: ga.reason,
                guidanceNotes: ga.guidanceNotes || "",
                resolutionNotes: ga.resolutionNotes || "",
                createdAt: ga.createdAt,
              },
            }).catch((e: any) => console.warn(`GuidanceAssignment seed note for ${student.email}: ${e.message}`));
          }
        }
      }
    } catch (err: any) {
      console.warn(`Student seed error for ${student.email}:`, err?.message || err);
    }
  }
  console.log("Students seeded successfully!");
}
