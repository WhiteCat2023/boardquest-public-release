import { Sparkles, Heart, Trophy, Zap, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Student } from "../../types/types";

interface StudentAiSummaryKpiStripProps {
  student: Student;
}

export function StudentAiSummaryKpiStrip({ student }: StudentAiSummaryKpiStripProps) {
  const scorecard = student.scorecardSummary;
  const metrics = student.subjectMetrics || [];
  const settings = student.userSettings;

  // Derive metrics
  const totalPoints = scorecard?.totalPoints ?? (student.xp || 0);
  const avgCompletion = scorecard?.avgCompletion ?? (
    metrics.length > 0
      ? Math.round(metrics.reduce((acc, m) => acc + (m.completion || 0), 0) / metrics.length)
      : 0
  );
  const avgProficiency = scorecard?.avgProficiency ?? 74;
  const standingTier = scorecard?.tierStanding ?? (avgProficiency >= 75 ? "Proficient Standing" : "Needs Focus");
  const isAtRisk = avgProficiency < 75 || avgCompletion < 60;
  const totalSubjects = scorecard?.totalSubjects ?? (metrics.length > 0 ? metrics.length : 6);
  const masteredCount = scorecard?.masteredCount ?? metrics.filter((m) => m.status === "Mastered").length;
  const inTrainingCount = Math.max(0, totalSubjects - masteredCount);

  // Find weakest and strongest disciplines
  const sortedByProficiency = [...metrics].sort((a, b) => (a.proficiency || 0) - (b.proficiency || 0));
  const weakest = sortedByProficiency[0] || { subject: "Hematology", proficiency: 48 };
  const strongest = sortedByProficiency[sortedByProficiency.length - 1] || { subject: "Clinical Chemistry", proficiency: 86 };

  // Calculate days remaining to exam
  let daysUntilExam = 42;
  if (settings?.targetExamDate) {
    const diff = new Date(settings.targetExamDate).getTime() - Date.now();
    daysUntilExam = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Generate dynamic AI diagnosis sentence
  const summarySentence = `${student.name || "Student"} is at ${
    isAtRisk ? "high risk of board examination lag" : "favorable licensure readiness"
  } because ${
    weakest.proficiency < 60
      ? `mastery in ${weakest.subject} has dropped to ${weakest.proficiency}%`
      : `curriculum completion is currently at ${avgCompletion}%`
  } and practice activity has slowed over recent study sessions with ${daysUntilExam} days remaining before the PRC Licensure Exam.`;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
      {/* Top Tinted AI Summary Banner */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200">
        <div className="size-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
          <Sparkles size={12} />
        </div>
        <p className="text-[11.5px] sm:text-xs leading-relaxed font-medium">
          <strong className="font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 mr-1.5">
            AI SUMMARY &bull;
          </strong>
          {summarySentence}
        </p>
      </div>

      {/* 6-Item KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-border/60 p-3.5 sm:p-4 gap-y-3 sm:gap-y-0">
        {/* KPI 1: Average Completion */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <Heart size={12} className="text-primary/70 shrink-0" />
            <span>Average Completion</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>{avgCompletion}%</span>
            </div>
            <Progress value={avgCompletion} className="h-1.5 rounded-full" />
          </div>
          <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 truncate">
            <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
            {avgCompletion >= 70 ? "Pacing on track" : "Mean syllabus progress"}
          </span>
        </div>

        {/* KPI 2: Total Earned Points (Replaced Current Focus) */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <Trophy size={12} className="text-primary/70 shrink-0" />
            <span>Total Earned Points</span>
          </div>
          <div className="text-xs sm:text-[13px] font-extrabold text-foreground flex items-baseline gap-1">
            <span className="text-primary font-mono font-black text-sm sm:text-base">
              {totalPoints.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">Pts</span>
          </div>
          <span className="text-[10.5px] text-muted-foreground truncate">
            {scorecard?.disciplinePoints
              ? `${scorecard.disciplinePoints.toLocaleString()} discipline pts`
              : "Academic & Quest Pts"}
          </span>
        </div>

        {/* KPI 3: Aspirant Stats (Replaced Last Activity) */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <Zap size={12} className="text-amber-500 shrink-0" />
            <span>Aspirant Stats</span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs sm:text-[13px] font-extrabold text-foreground truncate">
              {student.streak || 0} {(student.streak || 0) === 1 ? "Day" : "Days"} Streak
            </span>
            <Badge
              variant="outline"
              className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[9.5px] font-extrabold px-1.5 py-0 rounded shrink-0"
            >
              +20% XP
            </Badge>
          </div>
          <span className="text-[10.5px] text-muted-foreground truncate">
            {student.streak >= 7 ? "High streak consistency" : "Daily practice rhythm"}
          </span>
        </div>

        {/* KPI 4: Total XP (Replaced Next Intervention) */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <Sparkles size={12} className="text-purple-500 shrink-0" />
            <span>Total XP</span>
          </div>
          <div className="text-xs sm:text-[13px] font-extrabold text-foreground flex items-baseline gap-1">
            <span className="text-purple-600 dark:text-purple-400 font-mono font-black text-sm sm:text-base">
              {(student.xp || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">XP</span>
          </div>
          <span className="text-[10.5px] text-muted-foreground truncate">
            Level {student.level || 1} Progression
          </span>
        </div>

        {/* KPI 5: Mastered Disciplines */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <Award size={12} className="text-amber-500 shrink-0" />
            <span>Mastered Disciplines</span>
          </div>
          <div className="text-xs sm:text-[13px] font-extrabold text-foreground flex items-baseline gap-1">
            <span className="font-mono font-black text-sm sm:text-base text-foreground">
              {masteredCount}
            </span>
            <span className="text-xs font-bold text-muted-foreground">/ {totalSubjects}</span>
          </div>
          <span className="text-[10.5px] text-muted-foreground truncate">
            {masteredCount >= totalSubjects
              ? "All Disciplines Ready"
              : `${inTrainingCount} Subjects In Training`}
          </span>
        </div>

        {/* KPI 6: Primary Risk */}
        <div className="px-2 sm:px-3 flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
            <AlertTriangle size={12} className="text-rose-500 shrink-0" />
            <span>Primary Risk</span>
          </div>
          <div>
            <Badge
              variant="outline"
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isAtRisk
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
            >
              {isAtRisk ? "Critical" : "Stable"}
            </Badge>
          </div>
          <span className="text-[10.5px] text-muted-foreground truncate" title={weakest.subject}>
            Low {weakest.subject} Mastery
          </span>
        </div>
      </div>
    </div>
  );
}
