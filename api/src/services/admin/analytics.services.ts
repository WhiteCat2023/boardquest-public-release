import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import crypto from "crypto";

export interface StudentAnalyticsResult {
  studentInfo: {
    id: string;
    name: string;
    email: string;
    level: number;
    xp: number;
    streak: number;
  };
  metrics: {
    examsCount: number;
    avgScore: number;
    avgAccuracy: number;
    lessonsCompleted: number;
    mastery: Array<{
      subject: string;
      proficiency: number;
      status: string;
    }>;
  };
  aiInsights: {
    strongAreas: string[];
    weakAreas: string[];
    recommendations: string[];
    studyPlan: string;
  };
  cacheStats: {
    cached: boolean;
    hash: string;
    updatedAt: Date;
  };
}

export const getStudentAnalytics = async (studentId: string): Promise<StudentAnalyticsResult> => {
  // 1. Fetch student data
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      examResults: true,
      mastery: true,
      lessonCompletions: true,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // 2. Aggregate metrics
  const examsCount = student.examResults.length;
  const avgScore = examsCount > 0 
    ? Math.round(student.examResults.reduce((acc, curr) => acc + curr.score, 0) / examsCount)
    : 0;
  const avgAccuracy = examsCount > 0 
    ? Math.round(student.examResults.reduce((acc, curr) => acc + curr.accuracy, 0) / examsCount)
    : 0;
  const lessonsCompleted = student.lessonCompletions.filter(c => c.status === "completed").length;

  const masteryData = student.mastery.map(m => ({
    subject: m.subject,
    proficiency: m.proficiency,
    status: m.status,
  }));

  // 3. Construct state string for hashing
  const stateString = `id:${student.id}|level:${student.level}|xp:${student.xp}|streak:${student.streak}|exams:${examsCount}|avg:${avgScore}|acc:${avgAccuracy}|lessons:${lessonsCompleted}|mastery:${masteryData.map(m => `${m.subject}:${m.proficiency}`).join(",")}`;
  const hash = crypto.createHash("md5").update(stateString).digest("hex");

  // 4. Check DB Cache
  const cached = await prisma.aiAnalysis.findUnique({
    where: { userId: studentId },
  });

  if (cached && cached.hash === hash) {
    return {
      studentInfo: {
        id: student.id,
        name: student.name,
        email: student.email,
        level: student.level,
        xp: student.xp,
        streak: student.streak,
      },
      metrics: {
        examsCount,
        avgScore,
        avgAccuracy,
        lessonsCompleted,
        mastery: masteryData,
      },
      aiInsights: JSON.parse(cached.analysis),
      cacheStats: {
        cached: true,
        hash,
        updatedAt: cached.updatedAt,
      },
    };
  }

  // 5. Cache Miss: Generate insights (either via Gemini or Fallback Rules Engine)
  let insights;
  const apiKey = process.env.GEMINI_API_KEY || "";

  if (apiKey) {
    try {
      insights = await fetchGeminiInsights(apiKey, student, examsCount, avgScore, avgAccuracy, masteryData, lessonsCompleted);
    } catch (error) {
      console.error("Gemini API call failed, falling back to local engine:", error);
      insights = generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
    }
  } else {
    // No API Key, use rules engine
    insights = generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
  }

  // 6. Save back to cache database
  const updatedCache = await prisma.aiAnalysis.upsert({
    where: { userId: studentId },
    create: {
      userId: studentId,
      analysis: JSON.stringify(insights),
      hash,
    },
    update: {
      analysis: JSON.stringify(insights),
      hash,
    },
  });

  return {
    studentInfo: {
      id: student.id,
      name: student.name,
      email: student.email,
      level: student.level,
      xp: student.xp,
      streak: student.streak,
    },
    metrics: {
      examsCount,
      avgScore,
      avgAccuracy,
      lessonsCompleted,
      mastery: masteryData,
    },
    aiInsights: insights,
    cacheStats: {
      cached: false,
      hash,
      updatedAt: updatedCache.updatedAt,
    },
  };
};

const fetchGeminiInsights = async (
  apiKey: string,
  student: any,
  examsCount: number,
  avgScore: number,
  avgAccuracy: number,
  masteryData: any[],
  lessonsCompleted: number
) => {
  const prompt = `You are an AI learning mentor. Analyze this student performance data for a board exam prep app and return a JSON object with:
  1. strongAreas: array of strings
  2. weakAreas: array of strings
  3. recommendations: array of strings
  4. studyPlan: a paragraph string recommending a daily study plan.
  
  Do not include markdown wrappers (like \`\`\`json) in the response, return only the raw JSON.
  
  Student Data:
  - Name: ${student.name}
  - Level: ${student.level}
  - Streak: ${student.streak} days
  - Exams Taken: ${examsCount}
  - Average Score: ${avgScore}%
  - Average Accuracy: ${avgAccuracy}%
  - Lessons Completed: ${lessonsCompleted}
  - Subject Mastery: ${masteryData.map(m => `${m.subject} (${m.status}, proficiency: ${m.proficiency}%)`).join(', ')}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const json: any = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text.trim());
};

const generateLocalInsights = (
  student: any,
  examsCount: number,
  avgScore: number,
  masteryData: any[],
  lessonsCompleted: number
) => {
  const strongAreas: string[] = [];
  const weakAreas: string[] = [];
  const recommendations: string[] = [];

  // Rules-based analysis
  if (masteryData.length === 0) {
    strongAreas.push("Getting started");
    weakAreas.push("No subjects practiced yet");
    recommendations.push("Attempt your first diagnostic exam in any category.");
    recommendations.push("Complete lesson module 1 to establish a streak.");
  } else {
    masteryData.forEach(m => {
      if (m.proficiency >= 75) {
        strongAreas.push(`${m.subject} (${m.proficiency}% proficiency)`);
      } else if (m.proficiency < 55) {
        weakAreas.push(`${m.subject} (${m.proficiency}% proficiency)`);
      }
    });

    if (strongAreas.length === 0) {
      strongAreas.push("Consistency in study session attendance");
    }

    if (weakAreas.length === 0) {
      weakAreas.push("Exam time management");
    }

    // Generate recommendations based on scores
    if (avgScore < 60) {
      recommendations.push("Review fundamental slides in weak modules before re-testing.");
      recommendations.push("Aim to spend at least 15 minutes reviewing incorrect answers.");
    } else if (avgScore >= 80) {
      recommendations.push("Practice medium/hard questions in the Question Bank.");
      recommendations.push("Challenge peer aspirants in mock exams.");
    } else {
      recommendations.push("Attempt mock exams under timed conditions.");
      recommendations.push("Target subjects below 70% proficiency for daily revision.");
    }
  }

  if (student.streak > 3) {
    strongAreas.push(`Maintaining a strong ${student.streak}-day streak`);
  } else {
    recommendations.push("Focus on log-in consistency to rebuild your learning streak.");
  }

  const studyPlan = `Based on your level ${student.level} status, dedicate 45 minutes daily: 15 minutes reviewing active flashcards, 20 minutes attempting a 10-item subject quiz, and 10 minutes checking feedback. Prioritize subjects showing less than 65% proficiency.`;

  return {
    strongAreas,
    weakAreas,
    recommendations,
    studyPlan,
  };
};
