import { ShieldCheck, Target, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { StudentAnalyticsResult } from "../types/types";

interface SyllabusReadinessTabProps {
  report: StudentAnalyticsResult;
}

export function SyllabusReadinessTab({ report }: SyllabusReadinessTabProps) {
  const readinessScore = report?.studentInfo?.readinessScore ?? 0;
  const examsCompleted = report?.weeklyGoals?.examsCompleted ?? 0;
  const examsTarget = report?.weeklyGoals?.examsTarget || 1;
  const lessonsCompleted = report?.weeklyGoals?.lessonsCompleted ?? 0;
  const lessonsTarget = report?.weeklyGoals?.lessonsTarget || 1;
  const studyHoursCompleted = report?.weeklyGoals?.studyHoursCompleted ?? 0;
  const studyHoursTarget = report?.weeklyGoals?.studyHoursTarget || 1;
  const masteryList = Array.isArray(report?.metrics?.mastery) ? report.metrics.mastery : [];

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
      {/* Board Readiness Gauge & Weekly Targets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4 min-w-0">
        {/* Gauge Card */}
        <Card className="xl:col-span-5 border border-border/70 rounded-2xl bg-card p-4 sm:p-5 shadow-2xs flex flex-col items-center justify-center text-center gap-2 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
            Predicted Board Exam Readiness
          </h3>

          {/* Circular gauge */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center my-1 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted/30 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  readinessScore >= 75
                    ? "text-emerald-500"
                    : readinessScore >= 60
                    ? "text-amber-500"
                    : "text-rose-500"
                } stroke-current transition-all duration-1000`}
                strokeDasharray={`${readinessScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-2.5xl font-black text-foreground">
                {typeof readinessScore === "number"
                  ? readinessScore % 1 !== 0
                    ? readinessScore.toFixed(1)
                    : readinessScore
                  : readinessScore}%
              </span>
              <span
                className={`text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider ${
                  readinessScore >= 75
                    ? "text-emerald-600 dark:text-emerald-400"
                    : readinessScore >= 60
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {readinessScore >= 75
                  ? "High Probability"
                  : readinessScore >= 60
                  ? "In Training"
                  : "Needs Remediation"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground max-w-xs leading-tight">
            Calculated from exam accuracy, study consistency, and subject proficiency.
          </p>
        </Card>

        {/* Weekly Goal Targets Card */}
        <Card className="xl:col-span-7 border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Target size={14} className="text-primary shrink-0" />
              Weekly Learning Target Goals
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Goal 1: Exams */}
            <div className="p-2.5 sm:p-3 bg-muted/20 border border-border/60 rounded-xl flex flex-col gap-1.5 min-w-0">
              <div className="flex justify-between items-center text-xs font-bold gap-2">
                <span className="text-foreground truncate">Mock Exams Completed</span>
                <span className="text-primary shrink-0">{examsCompleted} / {examsTarget} Exams</span>
              </div>
              <Progress value={Math.min(100, (examsCompleted / examsTarget) * 100)} className="h-1.5" />
            </div>

            {/* Goal 2: Lessons */}
            <div className="p-2.5 sm:p-3 bg-muted/20 border border-border/60 rounded-xl flex flex-col gap-1.5 min-w-0">
              <div className="flex justify-between items-center text-xs font-bold gap-2">
                <span className="text-foreground truncate">Syllabus Lessons Finished</span>
                <span className="text-emerald-500 shrink-0">{lessonsCompleted} / {lessonsTarget} Modules</span>
              </div>
              <Progress value={Math.min(100, (lessonsCompleted / lessonsTarget) * 100)} className="h-1.5" />
            </div>

            {/* Goal 3: Study Time */}
            <div className="p-2.5 sm:p-3 bg-muted/20 border border-border/60 rounded-xl flex flex-col gap-1.5 min-w-0">
              <div className="flex justify-between items-center text-xs font-bold gap-2">
                <span className="text-foreground truncate">Active Study Hours</span>
                <span className="text-amber-500 shrink-0">{studyHoursCompleted} / {studyHoursTarget} Hours</span>
              </div>
              <Progress value={Math.min(100, (studyHoursCompleted / studyHoursTarget) * 100)} className="h-1.5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Syllabus Detailed Table */}
      <Card className="border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between border-b border-border/50 pb-2 flex-wrap gap-2 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
            <BookOpen size={14} className="text-primary shrink-0" />
            Detailed Subject Syllabus Progress & Registered Target Dates
          </h3>
          <Badge variant="outline" className="text-[9px] font-bold shrink-0">
            {Array.isArray(report?.studyPlans) ? report.studyPlans.length : 0} Study Plans Active
          </Badge>
        </div>

        <div className="divide-y divide-border/40">
          {masteryList.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground italic">
              No subject syllabus data available.
            </div>
          ) : (
            masteryList.map((m: any, idx: number) => {
              const plan = Array.isArray(report?.studyPlans) 
                ? report.studyPlans.find((sp) => sp.subject.toLowerCase() === m.subject.toLowerCase() || m.subject.toLowerCase().includes(sp.subject.toLowerCase()))
                : undefined;

              return (
                <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                      m.proficiency >= 75 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {(m.subject || "SB").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{m.subject}</span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                        <span>{m.lessonsDone} of {m.totalLessons} Modules Completed</span>
                        {plan && (
                          <span className="font-semibold text-primary">
                            • Target: {new Date(plan.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex flex-col sm:text-right">
                      <span className="text-xs font-black text-foreground">{m.proficiency}%</span>
                      <span className="text-[8px] text-muted-foreground uppercase font-bold">Proficiency</span>
                    </div>
                    <Badge 
                      variant={m.proficiency >= 75 ? "success" : m.proficiency >= 55 ? "warning" : "default"}
                      className="text-[8px] font-extrabold px-1.5 py-0 shrink-0"
                    >
                      {m.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

