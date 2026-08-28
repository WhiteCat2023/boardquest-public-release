import { ShieldCheck, TrendingUp, Target, BookOpen, Sparkles, TrendingDown, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult } from "../types/types";

interface OverviewTabProps {
  report: StudentAnalyticsResult;
}

export function OverviewTab({ report }: OverviewTabProps) {
  const readinessScore = report?.studentInfo?.readinessScore ?? 0;
  const examsCount = report?.metrics?.examsCount ?? 0;
  const avgScore = report?.metrics?.avgScore ?? 0;
  const avgAccuracy = report?.metrics?.avgAccuracy ?? 0;
  const masteryList = Array.isArray(report?.metrics?.mastery) ? report.metrics.mastery : [];
  const strongAreas = Array.isArray(report?.aiInsights?.strongAreas) ? report.aiInsights.strongAreas : [];
  const weakAreas = Array.isArray(report?.aiInsights?.weakAreas) ? report.aiInsights.weakAreas : [];
  const recommendations = Array.isArray(report?.aiInsights?.recommendations) ? report.aiInsights.recommendations : [];
  const studyPlan = report?.aiInsights?.studyPlan || "";

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
      {/* Standard Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Readiness Score */}
        <Card className="border-border/70 shadow-2xs rounded-xl bg-card p-2.5 sm:p-3 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">Board Readiness</span>
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-1.5 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{readinessScore}%</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">High</span>
          </div>
        </Card>

        {/* Exams count */}
        <Card className="border-border/70 shadow-2xs rounded-xl bg-card p-2.5 sm:p-3 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">Exams Taken</span>
            <TrendingUp size={16} className="text-muted-foreground/70 shrink-0" />
          </div>
          <div className="mt-1 sm:mt-1.5 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-lg sm:text-xl font-black text-foreground">{examsCount}</span>
            <span className="text-[8px] sm:text-[9px] text-muted-foreground font-semibold shrink-0">Completed</span>
          </div>
        </Card>

        {/* Average Score */}
        <Card className="border-border/70 shadow-2xs rounded-xl bg-card p-2.5 sm:p-3 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">Average Score</span>
            <TrendingUp size={16} className={`shrink-0 ${avgScore >= 75 ? "text-emerald-500" : "text-amber-500"}`} />
          </div>
          <div className="mt-1 sm:mt-1.5 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-lg sm:text-xl font-black text-foreground">{avgScore}%</span>
            <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${avgScore >= 75 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
              {avgScore >= 75 ? "Target Met" : "In Progress"}
            </span>
          </div>
        </Card>

        {/* Accuracy */}
        <Card className="border-border/70 shadow-2xs rounded-xl bg-card p-2.5 sm:p-3 min-w-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">Avg Accuracy</span>
            <Target size={16} className={`shrink-0 ${avgAccuracy >= 75 ? "text-emerald-500" : "text-amber-500"}`} />
          </div>
          <div className="mt-1 sm:mt-1.5 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-lg sm:text-xl font-black text-foreground">{avgAccuracy}%</span>
            <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${avgAccuracy >= 75 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
              {avgAccuracy >= 75 ? "Optimal" : "Review"}
            </span>
          </div>
        </Card>
      </div>

      {/* AI Insights & Mastery Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4 items-start min-w-0">
        {/* Left Column: Curriculum Mastery */}
        <Card className="xl:col-span-5 border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary shrink-0" />
              Curriculum Mastery
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">Target: 75%</span>
          </div>

          <div className="flex flex-col gap-3">
            {masteryList.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground italic">
                No curriculum mastery data recorded yet.
              </div>
            ) : (
              masteryList.map((m: any, index: number) => (
                <div key={index} className="flex flex-col gap-1 min-w-0">
                  <div className="flex justify-between items-center text-xs gap-2 min-w-0">
                    <span className="font-bold text-foreground truncate min-w-0">{m.subject}</span>
                    <span className="font-extrabold text-foreground shrink-0">{m.proficiency}%</span>
                  </div>
                  <div className="relative w-full h-2 sm:h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.proficiency >= 75 ? "bg-emerald-500" : m.proficiency >= 55 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${m.proficiency}%` }}
                    />
                    {/* 75% benchmark marker line */}
                    <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-foreground/50 z-10" />
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] gap-2 pt-0.5">
                    <span className="font-semibold text-muted-foreground truncate">
                      {m.lessonsDone} / {m.totalLessons} Modules
                    </span>
                    <Badge 
                      variant={m.proficiency >= 75 ? "success" : m.proficiency >= 55 ? "warning" : "default"}
                      className="text-[8px] font-extrabold px-1.5 py-0 rounded shrink-0"
                    >
                      {m.status || (m.proficiency >= 75 ? "Mastered" : m.proficiency >= 55 ? "Competent" : "Needs Review")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: AI Analytics Panel */}
        <Card className="xl:col-span-7 border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary shrink-0" />
              AI Performance Insights
            </h3>
            <Badge variant="outline" className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20 shrink-0">
              Adaptive AI
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Strong areas */}
            <div className="p-2.5 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl min-w-0">
              <h4 className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="shrink-0" />
                Academic Strengths
              </h4>
              <ul className="text-xs font-medium text-foreground space-y-1.5">
                {strongAreas.length === 0 ? (
                  <li className="text-muted-foreground italic text-[11px]">Collecting baseline strength metrics...</li>
                ) : (
                  strongAreas.map((area: any, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug break-words">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                      <span>{area}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Weak areas */}
            <div className="p-2.5 sm:p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl min-w-0">
              <h4 className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingDown size={12} className="shrink-0" />
                Vulnerability Risks
              </h4>
              <ul className="text-xs font-medium text-foreground space-y-1.5">
                {weakAreas.length === 0 ? (
                  <li className="text-muted-foreground italic text-[11px]">No vulnerability risks detected.</li>
                ) : (
                  weakAreas.map((area: any, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug break-words">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                      <span>{area}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-2.5 sm:p-3 bg-muted/40 border border-border/70 rounded-xl min-w-0">
            <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <ArrowRight size={12} className="text-primary shrink-0" />
              Remedial Recommendations
            </h4>
            <ul className="text-xs font-medium text-foreground space-y-1.5">
              {recommendations.length === 0 ? (
                <li className="text-muted-foreground italic text-[11px]">Keep answering subject exams to receive personalized remediation.</li>
              ) : (
                recommendations.map((rec: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed break-words">
                    <ArrowRight size={11} className="text-primary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Study plan */}
          {studyPlan && (
            <div className="p-2.5 sm:p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col gap-1 min-w-0">
              <h4 className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} className="shrink-0" />
                Personalized Daily Schedule
              </h4>
              <p className="text-xs font-medium text-foreground leading-relaxed break-words">
                {studyPlan}
              </p>
            </div>
          )}

          {/* Student Registered Study Plans */}
          <div className="p-2.5 sm:p-3 bg-card border border-border/70 rounded-xl flex flex-col gap-2 min-w-0">
            <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 truncate">
                <Target size={12} className="text-primary shrink-0" />
                Registered Subject Target Dates
              </span>
              <Badge variant="outline" className="text-[8px] font-bold shrink-0">
                {Array.isArray(report?.studyPlans) ? report.studyPlans.length : 0} Scheduled
              </Badge>
            </h4>

            {Array.isArray(report?.studyPlans) && report.studyPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.studyPlans.map((sp) => {
                  const target = new Date(sp.targetDate);
                  const now = new Date();
                  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
                  const isPast = diffDays < 0;

                  return (
                    <div key={sp.id} className="p-2 sm:p-2.5 bg-muted/30 border border-border/50 rounded-lg flex items-center justify-between gap-2 min-w-0">
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="text-xs font-bold text-foreground truncate">{sp.subject}</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          Target: {target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <Badge 
                        variant={isPast ? "destructive" : diffDays <= 7 ? "warning" : "success"}
                        className="text-[8px] font-extrabold shrink-0"
                      >
                        {isPast ? "Overdue" : `${diffDays} days left`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground italic py-1">
                No subject study plan target dates scheduled for this student yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

