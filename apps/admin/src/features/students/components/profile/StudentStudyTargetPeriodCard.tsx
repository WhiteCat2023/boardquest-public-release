import { useState } from "react";
import {
  Target,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Student, StudyPlanItem, SubjectMetricItem } from "../../types/types";

interface StudentStudyTargetPeriodCardProps {
  student: Student;
}

export function StudentStudyTargetPeriodCard({ student }: StudentStudyTargetPeriodCardProps) {
  const userSettings = student.userSettings;
  const activeObjective = student.activeObjective;
  const studyPlans: StudyPlanItem[] = student.studyPlans || [];
  const subjectMetrics: SubjectMetricItem[] = student.subjectMetrics || [];

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "Not Scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate Target Board Exam Date countdown
  const now = new Date();
  let examDaysRemaining: number | null = null;
  if (userSettings?.targetExamDate) {
    const examDate = new Date(userSettings.targetExamDate);
    examDaysRemaining = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Active Objective countdown
  const objectiveDaysRemaining = activeObjective?.daysRemaining ?? null;

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">
              In-Game Study Targets
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight mt-0.5">
            Study Target Period & Licensure Objectives
          </h2>
          <p className="text-[11.5px] text-muted-foreground">
            Target review periods, daily study quotas, and scheduled board milestones configured in BoardQuesters.
          </p>
        </div>

        {userSettings?.targetBatch && (
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit self-start sm:self-auto"
          >
            {userSettings.targetBatch}
          </Badge>
        )}
      </div>

      {/* Target Parameters Strip: 3 Mini KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Target Exam Date */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[9.5px] font-bold uppercase tracking-wider">Target Board Exam</span>
            <CalendarIcon className="w-3 h-3 text-primary" />
          </div>
          <p className="font-bold text-xs sm:text-sm text-foreground">
            {formatDate(userSettings?.targetExamDate)}
          </p>
          {examDaysRemaining !== null ? (
            <span
              className={`inline-block text-[9.5px] font-extrabold px-2 py-0.2 rounded-full ${
                examDaysRemaining > 0
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-red-500/10 text-red-600 border border-red-500/20"
              }`}
            >
              {examDaysRemaining > 0 ? `${examDaysRemaining} Days to Exam` : "Exam Period Passed"}
            </span>
          ) : (
            <span className="text-[9.5px] text-muted-foreground italic">Target date not set in game</span>
          )}
        </div>

        {/* 2. Daily Study Target Quota */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[9.5px] font-bold uppercase tracking-wider">Daily Target Quota</span>
            <Clock className="w-3 h-3 text-indigo-500" />
          </div>
          <p className="font-bold text-xs sm:text-sm text-foreground">
            {userSettings?.dailyQuota || 50} <span className="text-[11px] font-normal text-muted-foreground">Qs / Day</span>
          </p>
          <span className="inline-block text-[9.5px] font-semibold text-muted-foreground">
            Daily practice commitment
          </span>
        </div>

        {/* 3. In-Game Focus Discipline */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[9.5px] font-bold uppercase tracking-wider">Focus Subject</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
          <p className="font-bold text-xs sm:text-sm text-foreground truncate" title={userSettings?.focusSubject || "None Selected"}>
            {userSettings?.focusSubject && userSettings.focusSubject !== "none"
              ? userSettings.focusSubject
              : "Autonomous Review"}
          </p>
          <span className="inline-block text-[9.5px] font-semibold text-muted-foreground">
            Current priority track
          </span>
        </div>
      </div>

      {/* Active Mission Objective Milestone (Current Target Period) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">
              Active Mission Objective (Current Target Period)
            </span>
          </div>

          {objectiveDaysRemaining !== null && (
            <Badge
              variant="outline"
              className="bg-primary/15 text-primary border-primary/30 text-[10.5px] font-extrabold px-2.5 py-0.5"
            >
              <Clock className="w-3 h-3 mr-1" />
              {objectiveDaysRemaining > 0 ? `${objectiveDaysRemaining} Days Remaining` : "Target Due Today"}
            </Badge>
          )}
        </div>

        {activeObjective ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                  Focus Discipline
                </span>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {activeObjective.subject}
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-background/80 border border-border px-3 py-1.5 rounded-xl">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground block">Period</span>
                  <span className="font-bold text-foreground">
                    {formatDate(activeObjective.startDate)} &rarr; {formatDate(activeObjective.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Discipline Mastery Level</span>
                <span className="font-bold text-primary font-mono">{activeObjective.mastery}%</span>
              </div>
              <Progress value={activeObjective.mastery} className="h-2 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground space-y-1">
            <Target className="w-6 h-6 mx-auto opacity-40" />
            <p className="text-xs font-semibold">No active subject milestone scheduled</p>
            <p className="text-[11px]">The student has not scheduled an active target period in the game yet.</p>
          </div>
        )}
      </div>

      {/* Complete Study Target Periods Milestones Schedule Table */}
      {studyPlans.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Scheduled Subject Target Periods ({studyPlans.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">In-Game Curriculum Milestones</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-2.5">Target Period Range</th>
                  <th className="py-2 px-2.5 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Mastery Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {studyPlans.map((plan) => {
                  const end = new Date(plan.endDate || plan.targetDate || "");
                  const isPast = end.getTime() < now.getTime();
                  const isCurrent = activeObjective?.id === plan.id || activeObjective?.subject === plan.subject;
                  const matchedMetric = subjectMetrics.find((m) => m.subject === plan.subject);
                  const masteryVal = matchedMetric?.proficiency ?? matchedMetric?.mastery ?? 0;

                  return (
                    <tr key={plan.id || plan.subject} className="hover:bg-muted/20 transition-colors">
                      <td className="py-1.5 px-3 font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{plan.subject}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 text-muted-foreground font-medium text-[11.5px]">
                        {formatDate(plan.startDate)} &rarr; {formatDate(plan.endDate || plan.targetDate)}
                      </td>
                      <td className="py-1.5 px-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                            isCurrent
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : isPast
                              ? "bg-muted text-muted-foreground border border-border"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {isCurrent ? "Active Target" : isPast ? "Completed Period" : "Upcoming Period"}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-foreground">
                        <span className={masteryVal >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                          {masteryVal}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
