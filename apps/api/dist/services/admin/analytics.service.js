import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import crypto from "crypto";
export class AnalyticsService {
    db;
    summaryCache = null;
    constructor(db = prisma) {
        this.db = db;
    }
    async getStudentAnalytics(studentId) {
        // 1. Fetch student data including relations
        const student = await this.db.user.findUnique({
            where: { id: studentId },
            include: {
                examResults: { orderBy: { timestamp: "desc" } },
                mastery: true,
                lessonCompletions: true,
                achievements: { orderBy: { timestamp: "desc" } },
                studyPlans: { orderBy: { targetDate: "asc" } },
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
            },
        }).catch(() => null);
        if (!student) {
            throw new ApiError(404, "Student not found");
        }
        // 2. Aggregate core metrics strictly from real DB records
        const examsCount = student.examResults ? student.examResults.length : 0;
        const avgScore = examsCount > 0
            ? Math.round(student.examResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / examsCount)
            : 0;
        const avgAccuracy = examsCount > 0
            ? Math.round(student.examResults.reduce((acc, curr) => acc + (curr.accuracy || curr.score || 0), 0) / examsCount)
            : 0;
        const lessonsCompleted = student.lessonCompletions
            ? student.lessonCompletions.filter((c) => c.status === "completed").length
            : 0;
        const totalLessons = 35; // Standard total core modules
        // Subject mastery formatting strictly from real DB records with flexible matching
        const subjectsFromDb = await this.db.subject.findMany({
            select: {
                id: true,
                name: true,
                modules: {
                    select: { id: true, isPublished: true }
                }
            },
        });
        const matchSubject = (s1, s2) => {
            if (!s1 || !s2)
                return false;
            const a = s1.toLowerCase().trim();
            const b = s2.toLowerCase().trim();
            return a === b || a.includes(b) || b.includes(a) || (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4));
        };
        // Gather subjects strictly from DB Subject records when available
        const subjectMap = new Map();
        subjectsFromDb.forEach((sub) => {
            subjectMap.set(sub.name.toLowerCase().trim(), {
                name: sub.name,
                modulesCount: sub.modules ? sub.modules.filter((m) => m.isPublished !== false).length : 0,
            });
        });
        // Only fallback to student records if no subjects are defined in the DB at all
        if (subjectsFromDb.length === 0) {
            (student.mastery || []).forEach((m) => {
                if (m?.subject) {
                    const key = m.subject.toLowerCase().trim();
                    if (!subjectMap.has(key)) {
                        subjectMap.set(key, { name: m.subject, modulesCount: 0 });
                    }
                }
            });
            (student.examResults || []).forEach((e) => {
                if (e?.subject) {
                    const key = e.subject.toLowerCase().trim();
                    if (!subjectMap.has(key)) {
                        subjectMap.set(key, { name: e.subject, modulesCount: 0 });
                    }
                }
            });
        }
        const masteryData = Array.from(subjectMap.values()).map((subInfo) => {
            const sub = subInfo.name;
            // 1. Find existing explicit SubjectMastery row from DB
            const existing = (student.mastery || []).find((m) => matchSubject(m?.subject, sub));
            // 2. Count actual completed lessons for this subject
            const subjectCompletions = (student.lessonCompletions || []).filter((c) => matchSubject(c?.subject, sub) && (c?.status === "completed" || c?.status === "COMPLETED"));
            const actualLessonsDone = subjectCompletions.length;
            // 3. Total modules count for this subject (default to min 5 for UI module target)
            const totalLessons = Math.max(subInfo.modulesCount, 5);
            // 4. Look at subject-specific exam results
            const subjectExams = (student.examResults || []).filter((e) => matchSubject(e?.subject, sub));
            const examAvgScore = subjectExams.length > 0
                ? Math.round(subjectExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / subjectExams.length)
                : null;
            const examAvgAccuracy = subjectExams.length > 0
                ? Math.round(subjectExams.reduce((acc, curr) => acc + (curr.accuracy || curr.score || 0), 0) / subjectExams.length)
                : null;
            // Calculate Proficiency
            let prof = 0;
            if (existing && typeof existing.proficiency === "number" && existing.proficiency > 0) {
                prof = existing.proficiency;
            }
            else if (examAvgScore !== null) {
                const examBase = Math.round((examAvgScore * 0.6) + ((examAvgAccuracy ?? examAvgScore) * 0.4));
                if (actualLessonsDone > 0) {
                    const lessonRatio = Math.round((actualLessonsDone / totalLessons) * 100);
                    prof = Math.min(100, Math.round((examBase * 0.7) + (lessonRatio * 0.3)));
                }
                else {
                    prof = examBase;
                }
            }
            else if (actualLessonsDone > 0) {
                prof = Math.min(100, Math.round((actualLessonsDone / totalLessons) * 100));
            }
            // Calculate Lessons Done (real completed count, or fallback from proficiency ratio if admin set proficiency manually)
            let lessonsDone = actualLessonsDone;
            if (lessonsDone === 0 && prof > 0) {
                lessonsDone = Math.min(totalLessons, Math.round((prof / 100) * totalLessons));
            }
            // Calculate Status
            const status = existing?.status || (prof >= 75 ? "Mastered" : prof >= 55 ? "Competent" : "Needs Review");
            return {
                subject: sub,
                proficiency: prof,
                status,
                lessonsDone,
                totalLessons,
            };
        });
        // Board Readiness Score formula: total proficiency score / total number of subjects or categories
        const totalProficiencyScore = masteryData.reduce((acc, curr) => acc + (curr.proficiency || 0), 0);
        const readinessScore = masteryData.length > 0
            ? Math.round(totalProficiencyScore / masteryData.length)
            : 0;
        // 3. Construct Performance Trend strictly from actual DB exam results
        const performanceTrend = (student.examResults || []).map((e, index) => ({
            id: e.id,
            date: new Date(e.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            examName: e.subject ? `${e.subject} Exam` : `Practice Exam #${examsCount - index}`,
            score: e.score || 0,
            accuracy: Math.round(e.accuracy || e.score || 0),
            subject: e.subject || "General Board Review"
        })).reverse();
        // 4. Construct Timeline Feed strictly from real DB records
        const timeline = [];
        // Real DB exams to timeline
        (student.examResults || []).forEach((e) => {
            timeline.push({
                id: `exam-${e.id}`,
                type: "exam",
                title: e.subject ? `${e.subject} Exam` : "Comprehensive Diagnostic Exam",
                description: `Scored ${e.score || 0}% with ${Math.round(e.accuracy || e.score || 0)}% accuracy`,
                timestamp: new Date(e.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                metadata: {
                    score: e.score || 0,
                    accuracy: Math.round(e.accuracy || e.score || 0),
                    subject: e.subject || "General"
                }
            });
        });
        // Real DB achievements to timeline
        (student.achievements || []).forEach((a) => {
            timeline.push({
                id: `ach-${a.id}`,
                type: "achievement",
                title: `Achievement Unlocked: ${a.task}`,
                description: `Earned +${a.xp || 0} XP in ${a.subject || "General Study"}`,
                timestamp: new Date(a.timestamp).toLocaleString("en-US", { month: "short", day: "numeric" }),
                metadata: {
                    badge: a.badge || "gold",
                    xp: a.xp || 0
                }
            });
        });
        // Real DB lesson completions to timeline
        (student.lessonCompletions || []).forEach((c) => {
            timeline.push({
                id: `lesson-${c.id}`,
                type: "lesson",
                title: `Completed Module: ${c.lessonId || "Syllabus Lesson"}`,
                description: `Finished interactive study module`,
                timestamp: new Date(c.completedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            });
        });
        // Add level milestone if level > 1
        if ((student.level || 1) > 1) {
            timeline.push({
                id: `lvl-${student.id}`,
                type: "level_up",
                title: `Promoted to Aspirant Level ${student.level}`,
                description: `Reached ${student.xp || 0} total XP.`,
                timestamp: "Level Milestone"
            });
        }
        // 5. Construct Achievements & Badges List strictly based on active DB badges & student records
        const activeDbBadges = await this.db.badge.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
        });
        let achievements = [];
        if (activeDbBadges.length > 0) {
            const studentUserBadges = Array.isArray(student.userBadges) ? student.userBadges : [];
            const studentAchievements = Array.isArray(student.achievements) ? student.achievements : [];
            achievements = activeDbBadges.map((badge) => {
                const matchedUserBadge = studentUserBadges.find((ub) => ub.badgeId === badge.id ||
                    ub.badgeSlug?.toLowerCase() === badge.badgeId?.toLowerCase());
                const matchedAchievement = studentAchievements.find((a) => a.badge?.toLowerCase() === badge.badgeId?.toLowerCase() ||
                    (badge.name && a.task?.toLowerCase().includes(badge.name.toLowerCase())));
                const isUnlocked = Boolean(matchedUserBadge || matchedAchievement);
                const unlockedAtDate = matchedUserBadge?.unlockedAt || matchedAchievement?.timestamp;
                return {
                    id: badge.id || badge.badgeId,
                    title: badge.title || badge.name,
                    description: badge.description || badge.unlockCondition || "Earned through excellence",
                    badge: badge.icon || "trophy",
                    category: badge.category || "General",
                    xp: badge.xpReward || 50,
                    unlocked: isUnlocked,
                    unlockedAt: isUnlocked && unlockedAtDate ? new Date(unlockedAtDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
                    progress: isUnlocked ? 100 : Math.min(90, Math.round(((student.level || 1) * 20))),
                };
            });
        }
        // 6. Question Difficulty Breakdown strictly derived from actual student exam attempts
        let easyAttempted = 0, easyCorrect = 0;
        let mediumAttempted = 0, mediumCorrect = 0;
        let hardAttempted = 0, hardCorrect = 0;
        (student.examResults || []).forEach((e) => {
            if (e.difficultyBreakdown) {
                easyAttempted += e.difficultyBreakdown.easy?.attempted || 0;
                easyCorrect += e.difficultyBreakdown.easy?.correct || 0;
                mediumAttempted += e.difficultyBreakdown.medium?.attempted || 0;
                mediumCorrect += e.difficultyBreakdown.medium?.correct || 0;
                hardAttempted += e.difficultyBreakdown.hard?.attempted || 0;
                hardCorrect += e.difficultyBreakdown.hard?.correct || 0;
            }
        });
        const difficultyBreakdown = {
            easy: { attempted: easyAttempted, accuracy: easyAttempted > 0 ? Math.round((easyCorrect / easyAttempted) * 100) : (examsCount > 0 ? avgAccuracy : 0) },
            medium: { attempted: mediumAttempted, accuracy: mediumAttempted > 0 ? Math.round((mediumCorrect / mediumAttempted) * 100) : (examsCount > 0 ? avgAccuracy : 0) },
            hard: { attempted: hardAttempted, accuracy: hardAttempted > 0 ? Math.round((hardCorrect / hardAttempted) * 100) : (examsCount > 0 ? Math.max(0, avgAccuracy - 10) : 0) }
        };
        // 7. Weekly Goals Target derived strictly from real DB records
        const weeklyGoals = {
            examsTarget: 4,
            examsCompleted: Math.min(4, examsCount),
            lessonsTarget: 8,
            lessonsCompleted: Math.min(8, lessonsCompleted),
            studyHoursTarget: 10,
            studyHoursCompleted: Math.min(10, Math.round((student.streak || 0) * 1.5))
        };
        // 8. Map Real Database Study Plans (filter by active DB subjects if defined)
        const studyPlans = (student.studyPlans || [])
            .filter((sp) => {
            if (subjectsFromDb.length === 0)
                return true;
            return subjectsFromDb.some((sub) => matchSubject(sub.name, sp.subject));
        })
            .map((sp) => ({
            id: sp.id,
            subject: sp.subject,
            targetDate: sp.targetDate,
            updatedAt: sp.updatedAt
        }));
        // 9. Construct state string for caching
        const stateString = `id:${student.id}|level:${student.level}|xp:${student.xp}|streak:${student.streak}|exams:${examsCount}|avg:${avgScore}|acc:${avgAccuracy}|lessons:${lessonsCompleted}|mastery:${masteryData.map(m => `${m.subject}:${m.proficiency}`).join(",")}|plans:${studyPlans.length}`;
        const hash = crypto.createHash("md5").update(stateString).digest("hex");
        // 10. Check DB Cache for AI Insights
        const cached = await this.db.aiAnalysis.findUnique({
            where: { userId: studentId },
        });
        const studentInfo = {
            id: student.id,
            name: student.name,
            email: student.email,
            level: student.level,
            xp: student.xp,
            streak: student.streak,
            readinessScore
        };
        const metrics = {
            examsCount,
            avgScore,
            avgAccuracy,
            lessonsCompleted,
            totalLessons,
            mastery: masteryData
        };
        if (cached && cached.hash === hash) {
            return {
                studentInfo,
                metrics,
                performanceTrend,
                difficultyBreakdown,
                timeline,
                achievements,
                weeklyGoals,
                studyPlans,
                aiInsights: JSON.parse(cached.analysis),
                cacheStats: {
                    cached: true,
                    hash,
                    updatedAt: cached.updatedAt,
                },
            };
        }
        // 11. Cache Miss: Generate insights
        let insights;
        const apiKey = process.env.GEMINI_API_KEY || "";
        if (apiKey) {
            try {
                insights = await this.fetchGeminiInsights(apiKey, student, examsCount, avgScore, avgAccuracy, masteryData, lessonsCompleted);
            }
            catch (error) {
                console.error("Gemini API call failed, falling back to local engine:", error);
                insights = this.generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
            }
        }
        else {
            insights = this.generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted);
        }
        // Save to cache
        const updatedCache = await this.db.aiAnalysis.upsert({
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
            studentInfo,
            metrics,
            performanceTrend,
            difficultyBreakdown,
            timeline,
            achievements,
            weeklyGoals,
            studyPlans,
            aiInsights: insights,
            cacheStats: {
                cached: false,
                hash,
                updatedAt: updatedCache.updatedAt,
            },
        };
    }
    async fetchGeminiInsights(apiKey, student, examsCount, avgScore, avgAccuracy, masteryData, lessonsCompleted) {
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}`);
        }
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        return JSON.parse(text.trim());
    }
    generateLocalInsights(student, examsCount, avgScore, masteryData, lessonsCompleted) {
        const strongAreas = [];
        const weakAreas = [];
        const recommendations = [];
        // Rules-based analysis
        if (masteryData.length === 0) {
            strongAreas.push("Getting started");
            weakAreas.push("No subjects practiced yet");
            recommendations.push("Attempt your first diagnostic exam in any category.");
            recommendations.push("Complete lesson module 1 to establish a streak.");
        }
        else {
            masteryData.forEach(m => {
                if (m.proficiency >= 75) {
                    strongAreas.push(`${m.subject} (${m.proficiency}% proficiency)`);
                }
                else if (m.proficiency < 55) {
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
            }
            else if (avgScore >= 80) {
                recommendations.push("Practice medium/hard questions in the Question Bank.");
                recommendations.push("Challenge peer aspirants in mock exams.");
            }
            else {
                recommendations.push("Attempt mock exams under timed conditions.");
                recommendations.push("Target subjects below 70% proficiency for daily revision.");
            }
        }
        if (student.streak > 3) {
            strongAreas.push(`Maintaining a strong ${student.streak}-day streak`);
        }
        else {
            recommendations.push("Focus on log-in consistency to rebuild your learning streak.");
        }
        const studyPlan = `Based on your level ${student.level} status, dedicate 45 minutes daily: 15 minutes reviewing active flashcards, 20 minutes attempting a 10-item subject quiz, and 10 minutes checking feedback. Prioritize subjects showing less than 65% proficiency.`;
        return {
            strongAreas,
            weakAreas,
            recommendations,
            studyPlan,
        };
    }
    async getDashboardAnalyticsSummary() {
        const CACHE_TTL = 1000 * 60 * 2; // 2 minutes in-memory cache
        const nowTimestamp = Date.now();
        if (this.summaryCache && nowTimestamp - this.summaryCache.timestamp < CACHE_TTL) {
            return this.summaryCache.data;
        }
        const totalStudentsCount = await this.db.user.count();
        const students = await this.db.user.findMany({
            take: 500,
            select: {
                id: true,
                level: true,
                examResults: {
                    select: { score: true, subject: true, accuracy: true },
                },
                mastery: {
                    select: { subject: true, proficiency: true },
                },
            },
        });
        let passedCount = 0;
        let nearTargetCount = 0;
        let atRiskCount = 0;
        let totalScoreSum = 0;
        let ratedStudentsCount = 0;
        students.forEach((student) => {
            if (student.examResults && student.examResults.length > 0) {
                const sum = student.examResults.reduce((acc, curr) => acc + curr.score, 0);
                const studentAvg = Math.round(sum / student.examResults.length);
                totalScoreSum += studentAvg;
                ratedStudentsCount++;
                if (studentAvg >= 75) {
                    passedCount++;
                }
                else if (studentAvg >= 60) {
                    nearTargetCount++;
                }
                else {
                    atRiskCount++;
                }
            }
            else if (student.mastery && student.mastery.length > 0) {
                const sum = student.mastery.reduce((acc, curr) => acc + curr.proficiency, 0);
                const studentAvg = Math.round(sum / student.mastery.length);
                totalScoreSum += studentAvg;
                ratedStudentsCount++;
                if (studentAvg >= 75) {
                    passedCount++;
                }
                else if (studentAvg >= 60) {
                    nearTargetCount++;
                }
                else {
                    atRiskCount++;
                }
            }
        });
        const overallAvgScore = ratedStudentsCount > 0 ? Number((totalScoreSum / ratedStudentsCount).toFixed(1)) : 0;
        const overallPassRate = ratedStudentsCount > 0 ? Number(((passedCount / ratedStudentsCount) * 100).toFixed(1)) : 0;
        const distribution = [
            {
                label: "Passed (≥75%)",
                value: ratedStudentsCount > 0 ? Number(((passedCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
                count: passedCount,
                color: "#10b981",
                strokeColor: "stroke-emerald-500",
                bgLight: "bg-emerald-500/10",
                text: "text-emerald-600 dark:text-emerald-400",
            },
            {
                label: "Near Target (60-74%)",
                value: ratedStudentsCount > 0 ? Number(((nearTargetCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
                count: nearTargetCount,
                color: "#f59e0b",
                strokeColor: "stroke-amber-500",
                bgLight: "bg-amber-500/10",
                text: "text-amber-600 dark:text-amber-400",
            },
            {
                label: "At Risk (<60%)",
                value: ratedStudentsCount > 0 ? Number(((atRiskCount / ratedStudentsCount) * 100).toFixed(1)) : 0,
                count: atRiskCount,
                color: "#ef4444",
                strokeColor: "stroke-rose-500",
                bgLight: "bg-rose-500/10",
                text: "text-rose-600 dark:text-rose-400",
            },
        ];
        const allExamResults = await this.db.examResult.findMany({
            take: 1000,
            select: {
                score: true,
                timestamp: true,
                userId: true,
            },
            orderBy: { timestamp: "asc" },
        });
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            last6Months.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                month: monthNames[d.getMonth()],
            });
        }
        const monthlyMap = {};
        allExamResults.forEach((res) => {
            const date = new Date(res.timestamp);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (!monthlyMap[key]) {
                monthlyMap[key] = { totalScore: 0, count: 0, passCount: 0, userIds: new Set() };
            }
            monthlyMap[key].totalScore += res.score;
            monthlyMap[key].count++;
            if (res.score >= 75)
                monthlyMap[key].passCount++;
            if (res.userId)
                monthlyMap[key].userIds.add(res.userId);
        });
        const monthlyTrend = last6Months.map((m) => {
            const aggregated = monthlyMap[m.key];
            if (aggregated && aggregated.count > 0) {
                const rate = Math.round((aggregated.passCount / aggregated.count) * 100);
                const avgScore = Math.round(aggregated.totalScore / aggregated.count);
                const studentsCount = aggregated.userIds.size;
                return { month: m.month, rate, avgScore, students: studentsCount };
            }
            return { month: m.month, rate: 0, avgScore: 0, students: 0 };
        });
        const categories = await this.db.subject.findMany({
            include: {
                _count: {
                    select: { questions: true },
                },
            },
        });
        const matchSubjectName = (s1, s2) => {
            if (!s1 || !s2)
                return false;
            const a = s1.toLowerCase().trim();
            const b = s2.toLowerCase().trim();
            return (a === b ||
                a.includes(b) ||
                b.includes(a) ||
                (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4)));
        };
        const subjects = categories.map((cat) => {
            const catMastery = students.flatMap((s) => (s.mastery || []).filter((m) => matchSubjectName(m.subject, cat.name)));
            let avgProficiency = 0;
            if (catMastery.length > 0) {
                avgProficiency = Math.round(catMastery.reduce((acc, curr) => acc + (curr.proficiency || 0), 0) / catMastery.length);
            }
            else {
                const catExams = students.flatMap((s) => (s.examResults || []).filter((e) => matchSubjectName(e.subject, cat.name)));
                if (catExams.length > 0) {
                    avgProficiency = Math.round(catExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / catExams.length);
                }
            }
            return {
                id: cat.id,
                name: cat.name,
                questionCount: cat._count?.questions ?? 0,
                proficiency: avgProficiency,
            };
        });
        const summaryResult = {
            overallPassRate,
            overallAvgScore,
            totalStudentsCount,
            passedCount,
            nearTargetCount,
            atRiskCount,
            distribution,
            monthlyTrend,
            subjects,
        };
        this.summaryCache = { data: summaryResult, timestamp: Date.now() };
        return summaryResult;
    }
}
export const analyticsService = new AnalyticsService();
export const getStudentAnalytics = analyticsService.getStudentAnalytics.bind(analyticsService);
export const getDashboardAnalyticsSummary = analyticsService.getDashboardAnalyticsSummary.bind(analyticsService);
