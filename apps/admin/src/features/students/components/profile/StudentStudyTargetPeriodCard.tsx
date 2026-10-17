import { useState } from "react";
import {
  Target,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  FileText,
  Flag,
  Percent,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

  // Expanded row ID for showing full goal & notes
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "Not Scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDurationInDays = (start?: string | Date | null, end?: string | Date | null) => {
    if (!start || !end) return null;
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return null;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff <= 1 ? "1 day" : `${diff} days`;
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

  const renderPriorityBadge = (priority?: string) => {
    const p = (priority || "MEDIUM").toUpperCase();
    if (p === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <Flame size={10} className="text-rose-500 shrink-0" />
          High
        </span>
      );
    }
    if (p === "LOW") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/25">
          Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        Medium
      </span>
    );
  };

  const renderStatusBadge = (status?: string, isCurrent?: boolean, isPast?: boolean) => {
    const st = (status || "IN_PROGRESS").toUpperCase();
    if (isCurrent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/35">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Target
        </span>
      );
    }
    if (st === "COMPLETED" || isPast) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-muted text-muted-foreground border border-border">
          <CheckCircle2 size={10} className="text-muted-foreground" />
          Completed
        </span>
      );
    }
    if (st === "PLANNED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          Planned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
        In Progress
      </span>
    );
  };

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
        <div>
          {/* <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">
              In-Game Study Targets &amp; Milestones
            </span>
          </div> */}
          
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight mt-0.5">
            Study Target Period &amp; Licensure Objectives
          </h2>
          <p className="text-[11.5px] text-muted-foreground">
            Target review periods, question quotas, accuracy goals, and scheduled discipline milestones configured in BoardQuesters.
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
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/25 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-primary">
              Active Mission Objective (Current Target Period)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeObjective?.priority && renderPriorityBadge(activeObjective.priority)}
            {objectiveDaysRemaining !== null && (
              <Badge
                variant="outline"
                className="bg-primary/15 text-primary border-primary/30 text-[10px] font-extrabold px-2 py-0.5"
              >
                <Clock className="w-3 h-3 mr-1" />
                {objectiveDaysRemaining > 0 ? `${objectiveDaysRemaining} Days Remaining` : "Target Due Today"}
              </Badge>
            )}
          </div>
        </div>

        {activeObjective ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[9.5px] font-bold uppercase text-muted-foreground tracking-wider block">
                  Focus Discipline
                </span>
                <h4 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <span>{activeObjective.subject}</span>
                  {renderStatusBadge(activeObjective.status, true, false)}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Target Period Range */}
                <div className="bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground block">Period</span>
                  <span className="font-bold text-foreground">
                    {formatDate(activeObjective.startDate)} &rarr; {formatDate(activeObjective.endDate || activeObjective.targetDate)}
                  </span>
                </div>

                {/* Target Questions Quota */}
                <div className="bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground block">Question Goal</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {activeObjective.targetQuestions ?? 50} Qs Target
                  </span>
                </div>

                {/* Target Accuracy */}
                <div className="bg-background/80 border border-border px-3 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground block">Target Accuracy</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeObjective.targetAccuracy ?? 75}% Min
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Goal callout if student provided one */}
            {activeObjective.goal && (
              <div className="p-2.5 rounded-lg bg-background/90 border border-border/80 flex items-start gap-2 text-xs">
                <Target size={14} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9.5px] font-extrabold uppercase text-primary tracking-wider">
                    Candidate Milestone Goal
                  </span>
                  <p className="text-foreground font-semibold leading-relaxed">
                    &ldquo;{activeObjective.goal}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Study Notes if student provided one */}
            {activeObjective.notes && (
              <div className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-start gap-2 text-xs">
                <FileText size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">
                    Study Notes &amp; Tactics
                  </span>
                  <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                    {activeObjective.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Target Progress Bar vs Target Accuracy */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <span>Discipline Mastery Progress</span>
                  <span className="text-[10px] text-muted-foreground/70">
                    (Target Threshold: {activeObjective.targetAccuracy ?? 75}%)
                  </span>
                </span>
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
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Scheduled Subject Target Periods ({studyPlans.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">In-Game Curriculum Milestones &amp; Tactical Roadmaps</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-2 text-center">Priority</th>
                  <th className="py-2.5 px-2.5">Schedule Period</th>
                  <th className="py-2.5 px-2.5">Target Quota</th>
                  <th className="py-2.5 px-2.5 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Mastery vs Goal</th>
                  <th className="py-2.5 px-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {studyPlans.map((plan) => {
                  const end = new Date(plan.endDate || plan.targetDate || "");
                  const isPast = !isNaN(end.getTime()) && end.getTime() < now.getTime();
                  const isCurrent = activeObjective?.id === plan.id || activeObjective?.subject === plan.subject;
                  const matchedMetric = subjectMetrics.find((m) => m.subject === plan.subject);
                  const masteryVal = matchedMetric?.proficiency ?? matchedMetric?.mastery ?? 0;
                  const targetAcc = plan.targetAccuracy ?? 75;
                  const targetQs = plan.targetQuestions ?? 50;
                  const duration = getDurationInDays(plan.startDate, plan.endDate || plan.targetDate);
                  const isExpanded = expandedPlanId === (plan.id || plan.subject);
                  const hasDetails = !!(plan.goal || plan.notes);

                  return (
                    <tr
                      key={plan.id || plan.subject}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Subject */}
                      <td className="py-2 px-3 font-bold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">{plan.subject}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-2 px-2 text-center">
                        {renderPriorityBadge(plan.priority)}
                      </td>

                      {/* Period Range & Duration */}
                      <td className="py-2 px-2.5 text-muted-foreground font-medium text-[11px]">
                        <div>
                          <span>{formatDate(plan.startDate)}</span>
                          <span className="mx-1 text-muted-foreground/60">&rarr;</span>
                          <span>{formatDate(plan.endDate || plan.targetDate)}</span>
                        </div>
                        {duration && (
                          <span className="text-[10px] text-muted-foreground/75 font-normal">
                            ({duration})
                          </span>
                        )}
                      </td>

                      {/* Target Commitments (Questions & Accuracy) */}
                      <td className="py-2 px-2.5 text-foreground font-medium text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {targetQs} Qs
                          </span>
                          <span className="text-muted-foreground/50">&bull;</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {targetAcc}% Acc
                          </span>
                        </div>
                        {plan.goal && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[160px] italic">
                            &ldquo;{plan.goal}&rdquo;
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-2.5 text-center">
                        {renderStatusBadge(plan.status, isCurrent, isPast)}
                      </td>

                      {/* Mastery vs Goal */}
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <div className="flex items-center justify-end gap-1">
                          <span className={masteryVal >= targetAcc ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                            {masteryVal}%
                          </span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            / {targetAcc}%
                          </span>
                        </div>
                      </td>

                      {/* Expand / Details Toggle */}
                      <td className="py-2 px-2 text-center">
                        {hasDetails ? (
                          <button
                            type="button"
                            onClick={() => setExpandedPlanId(isExpanded ? null : (plan.id || plan.subject))}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title={isExpanded ? "Hide notes & goal" : "Show notes & goal"}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Detail Box for Selected Subject */}
          {expandedPlanId && (() => {
            const plan = studyPlans.find((p) => (p.id || p.subject) === expandedPlanId);
            if (!plan || (!plan.goal && !plan.notes)) return null;

            return (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase text-primary tracking-wider flex items-center gap-1.5">
                    <Target size={12} />
                    {plan.subject} &mdash; Tactical Blueprint
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedPlanId(null)}
                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {plan.goal && (
                    <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                      <span className="text-[9.5px] font-bold uppercase text-muted-foreground tracking-wider block">
                        Milestone Objective
                      </span>
                      <p className="text-foreground font-medium text-xs leading-relaxed">
                        &ldquo;{plan.goal}&rdquo;
                      </p>
                    </div>
                  )}

                  {plan.notes && (
                    <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                      <span className="text-[9.5px] font-bold uppercase text-muted-foreground tracking-wider block">
                        Candidate Strategy &amp; Notes
                      </span>
                      <p className="text-muted-foreground italic text-xs leading-relaxed">
                        {plan.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </Card>
  );
}
