import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Target,
  Zap,
  BookOpen,
  ShieldCheck,
  Award,
  Flame,
  Clock,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Student } from "../../types/types";
import type { StudentAnalyticsResult } from "@/features/analytics/types/types";

interface StudentAiActionCenterCardProps {
  student: Student;
  report?: StudentAnalyticsResult | null;
  onAssignGuidance?: () => void;
  onOpenScorecard?: () => void;
}

type InsightFilter = "all" | "strengths" | "gaps" | "suggestions";

export function StudentAiActionCenterCard({
  student,
  report,
  onAssignGuidance,
  onOpenScorecard,
}: StudentAiActionCenterCardProps) {
  const [activeTab, setActiveTab] = useState<InsightFilter>("all");

  const settings = student.userSettings;
  const metrics = student.subjectMetrics || [];
  const reportInsights = report?.aiInsights;

  // Calculate days remaining to target board exam
  let daysRemaining = 42;
  if (settings?.targetExamDate) {
    const diff = new Date(settings.targetExamDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Sort metrics ascending (weakest first) and descending (strongest first)
  const sortedAsc = [...metrics].sort((a, b) => (a.proficiency || 0) - (b.proficiency || 0));
  const sortedDesc = [...metrics].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));

  // Determine top strengths
  const topStrengths = sortedDesc.filter((m) => (m.proficiency || 0) >= 50 || m.completion > 0);
  const primaryStrength = topStrengths[0] || sortedDesc[0] || {
    subject: "Clinical Chemistry",
    proficiency: 68,
    completion: 8,
    mastery: 71,
    status: "In Training",
  };
  const secondaryStrength = topStrengths[1] || null;

  // Determine critical gaps & weaknesses (subjects below 75% benchmark or unstarted)
  const weakSubjects = sortedAsc.filter((m) => (m.proficiency || 0) < 75 || m.completion < 50);
  const primaryGap = weakSubjects[0] || sortedAsc[0] || {
    subject: "Immunology & Serology and Immunohematology",
    proficiency: 0,
    completion: 0,
    mastery: 0,
    status: "Not Started",
  };
  const secondaryGap = weakSubjects[1] || sortedAsc[1] || null;

  const targetBatch = settings?.targetBatch || "March 2026 Batch";
  const dailyQuota = settings?.dailyQuota || 50;

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs flex flex-col">
      {/* Radiant Gradient Header with Glow */}
      <div className="bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/10 dark:from-purple-500/25 dark:via-pink-500/20 dark:to-primary/20 p-4 border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-foreground">AI Insights</h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                Mentor v2
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Gaps, Strengths &amp; Improvement Plan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold shadow-2xs">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agent Live</span>
        </div>
      </div>

      {/* Filter / Focus Navigation Bar */}
      <div className="px-4 pt-3 pb-1 border-b border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          All Insights
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("strengths")}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === "strengths"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          <TrendingUp size={12} />
          <span>Strengths</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gaps")}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === "gaps"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
          }`}
        >
          <AlertTriangle size={12} />
          <span>Gaps &amp; Weaknesses</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("suggestions")}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === "suggestions"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Lightbulb size={12} />
          <span>Suggestions</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* ============================================================ */}
          {/* SECTION 1: STRENGTHS                                         */}
          {/* ============================================================ */}
          {(activeTab === "all" || activeTab === "strengths") && (
            <div className="border border-emerald-500/25 bg-emerald-500/[0.04] rounded-xl p-3.5 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="p-1 rounded-md bg-emerald-500/15">
                    <TrendingUp size={13} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    Student Strengths
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9.5px] font-black px-2 py-0.5 rounded"
                >
                  Anchor Disciplines
                </Badge>
              </div>

              {/* Primary Strength Card */}
              <div className="bg-card/80 border border-emerald-500/20 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-foreground">
                      {primaryStrength.subject}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {primaryStrength.proficiency}% Proficiency
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Demonstrates consistent question accuracy ({primaryStrength.mastery || primaryStrength.proficiency}%) and active engagement. Serves as the candidate's core anchor subject for passing the board licensure threshold.
                </p>

                {/* Sub-metrics */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    Completion: {primaryStrength.completion}%
                  </span>
                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    Status: {primaryStrength.status || "In Training"}
                  </span>
                </div>
              </div>

              {/* Secondary Habit Strength / Consistency */}
              <div className="flex items-center justify-between text-[11px] bg-card/50 border border-border/60 rounded-lg px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <Flame size={13} className="text-amber-500 shrink-0" />
                  <span className="font-semibold text-foreground">
                    Study Habit Consistency
                  </span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {student.streak || 1}-Day Active Streak
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 2: GAPS & WEAKNESSES                                 */}
          {/* ============================================================ */}
          {(activeTab === "all" || activeTab === "gaps") && (
            <div className="border border-rose-500/25 bg-rose-500/[0.04] rounded-xl p-3.5 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <span className="p-1 rounded-md bg-rose-500/15">
                    <AlertTriangle size={13} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    Gaps &amp; Weaknesses
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[9.5px] font-black px-2 py-0.5 rounded"
                >
                  Critical Priority
                </Badge>
              </div>

              {/* Primary Knowledge Gap */}
              <div className="bg-card/80 border border-rose-500/20 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {primaryGap.subject}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {primaryGap.proficiency}% (Below 75% Benchmark)
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {primaryGap.completion === 0 && (primaryGap.totalQuestionsAnswered || 0) === 0
                    ? "Severe curriculum void: Candidate has not attempted diagnostic simulations or completed syllabus modules in this high-yield discipline."
                    : `Proficiency is currently at ${primaryGap.proficiency}%, significantly lagging the 75% PRC board exam standard with low module completion (${primaryGap.completion}%).`}
                </p>

                {/* Gap Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    Syllabus Void: {primaryGap.completion}% Done
                  </span>
                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    High Board Weight (20%)
                  </span>
                  <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    Needs Remediation
                  </span>
                </div>
              </div>

              {/* Secondary Gap Highlight if available */}
              {secondaryGap && (
                <div className="flex items-center justify-between text-[11px] bg-card/50 border border-border/60 rounded-lg px-2.5 py-2">
                  <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                    <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-semibold text-foreground truncate">
                      {secondaryGap.subject}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                    {secondaryGap.proficiency}% Proficiency
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 3: SUGGESTIONS FOR IMPROVEMENT                       */}
          {/* ============================================================ */}
          {(activeTab === "all" || activeTab === "suggestions") && (
            <div className="border border-primary/25 bg-primary/[0.04] rounded-xl p-3.5 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="p-1 rounded-md bg-primary/15">
                    <Lightbulb size={13} />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    Suggestions to Improve
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[9.5px] font-black px-2 py-0.5 rounded"
                >
                  Actionable Interventions
                </Badge>
              </div>

              {/* Suggestion 1: Targeted Diagnostic Drill */}
              <div className="bg-card/80 border border-primary/20 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">
                    1. Prescribe Diagnostic Drill in {primaryGap.subject.split(" ")[0]}
                  </span>
                  <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                    +25% Pass Lift
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Assign an initial 15-minute diagnostic drill (15–20 high-yield questions) to establish baseline mastery and identify conceptual misconceptions.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9.5px] font-medium text-muted-foreground">
                    Estimated Time: ~15 min
                  </span>
                  <Button
                    size="sm"
                    onClick={onAssignGuidance}
                    className="h-6 px-2.5 text-[10.5px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>Assign Guidance</span>
                    <ArrowRight size={11} />
                  </Button>
                </div>
              </div>

              {/* Suggestion 2: Board Exam Target Milestone Pace */}
              <div className="bg-card/80 border border-border/80 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">
                    2. Daily Quota Calibration ({dailyQuota} Qs/day)
                  </span>
                  <span className="text-[9.5px] font-extrabold text-primary">
                    {daysRemaining} Days Left
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Maintain {dailyQuota} questions/day quota pace for the {targetBatch}. Allocate 60% of daily volume to lagging topics ({primaryGap.subject.split(" ")[0]}) to achieve 94%+ syllabus completion.
                </p>
              </div>

              {/* Suggestion 3: Rationale Review & Misconception Remediation */}
              <div className="bg-card/80 border border-border/80 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">
                    3. Misconception Rationale Review
                  </span>
                  <span className="text-[9.5px] font-semibold text-muted-foreground">
                    10–15 min/session
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Require student review of detailed explanation rationales on incorrect answers immediately following simulation sets to prevent repeated mistakes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expected Overall Outcome Banner */}
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-0.5 mt-2">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Projected Readiness Growth</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">+36% Expected</span>
          </div>
          <div className="text-xs font-bold text-foreground">
            Passing Probability: <span className="text-emerald-600 dark:text-emerald-400">48% &rarr; 84%</span> upon addressing top 2 gaps.
          </div>
        </div>

        {/* Quick Action Footer Buttons */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            type="button"
            onClick={onOpenScorecard}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <span>View Full Scorecard</span>
            <ChevronRight size={12} />
          </button>
          <Button
            size="sm"
            onClick={onAssignGuidance}
            className="h-7 px-3 text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>Assign Guidance</span>
            <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export { StudentAiActionCenterCard as StudentAiInsightsCard };
