import {
  Sparkles,
  Brain,
  Target,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Student, SubjectMetricItem } from "../../types/types";

interface StudentAiDiagnosticCardProps {
  student: Student;
  aiInsights?: {
    strongAreas?: string[];
    weakAreas?: string[];
    recommendations?: string[];
    studyPlan?: string;
  };
}

export function StudentAiDiagnosticCard({ student, aiInsights }: StudentAiDiagnosticCardProps) {
  const userSettings = student.userSettings;
  const metrics: SubjectMetricItem[] = student.subjectMetrics || [];
  const scorecard = student.scorecardSummary;

  const avgMastery = scorecard?.avgProficiency ?? 0;
  const avgCompletion = scorecard?.avgCompletion ?? 0;

  // Sort subjects by proficiency
  const sortedSubjects = [...metrics].sort((a, b) => a.proficiency - b.proficiency);
  const weakest = sortedSubjects[0] || null;
  const strongest = sortedSubjects[sortedSubjects.length - 1] || null;

  const accountFocusSubject =
    userSettings?.focusSubject && userSettings.focusSubject !== "none"
      ? userSettings.focusSubject
      : null;

  // Dynamic performance index based on weighted mastery & completion
  const performanceIndex = Math.round(avgMastery * 0.7 + avgCompletion * 0.3);

  // Status tier determination
  const getStatusBadge = () => {
    if (performanceIndex >= 85) {
      return {
        label: "Topnotcher Tier",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: ShieldCheck,
      };
    } else if (performanceIndex >= 75) {
      return {
        label: "Passing Standard",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        icon: CheckCircle2,
      };
    } else if (performanceIndex >= 60) {
      return {
        label: "Borderline Standing",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: AlertTriangle,
      };
    } else {
      return {
        label: "Critical Remediation",
        color: "bg-primary/10 text-primary border-primary/30",
        icon: AlertCircle,
      };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5 relative overflow-hidden">
      {/* Subtle background flair */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-2.5 relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <Brain className="w-3.5 h-3.5" />
            </span>
            <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">
              AI Diagnostic Prescription
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight mt-0.5 flex items-center gap-2">
            <span>Cognitive Licensure Readiness Index</span>
          </h2>
          <p className="text-[11.5px] text-muted-foreground">
            Automated pedagogical diagnostics, identified competency gaps, and remediation strategy from student gameplay telemetry.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full gap-1 w-fit ${statusBadge.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{statusBadge.label}</span>
        </Badge>
      </div>

      {/* Core Diagnostic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 relative z-10">
        {/* Readiness Index */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
            Overall Readiness Index
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {performanceIndex}%
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              / 100% Benchmark
            </span>
          </div>
          <Progress value={performanceIndex} className="h-1.5 rounded-full" />
          <span className="text-[10px] text-muted-foreground block pt-0.5">
            Calculated from 70% weighted accuracy and 30% curriculum syllabus completion.
          </span>
        </div>

        {/* Priority Subject Remediation */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
            Primary Focus Need
          </span>
          <h4 className="text-sm font-bold text-primary truncate">
            {weakest?.subject || "Clinical Chemistry"}
          </h4>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px]">Proficiency:</span>
            <span className="font-bold font-mono text-primary text-xs">
              {weakest?.proficiency || 0}%
            </span>
            <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 font-extrabold uppercase text-primary border-primary/20">
              Needs Focus
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground block pt-0.5">
            Lowest recorded competency area requiring targeted question drilling.
          </span>
        </div>

        {/* Highest Anchor Subject */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
            Strongest Anchor Discipline
          </span>
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {strongest?.subject || "Hematology"}
          </h4>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px]">Proficiency:</span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
              {strongest?.proficiency || 0}%
            </span>
            <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 font-extrabold uppercase text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              High Competency
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground block pt-0.5">
            Demonstrates consistent scoring stability across chapter challenges.
          </span>
        </div>
      </div>

      {/* Clinical Remediation Advice Card */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-2.5 relative z-10 text-xs">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Lightbulb className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-bold text-xs text-foreground">
            Prescribed Educational Intervention
          </h4>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            {weakest
              ? `Prioritize evaluation review sessions on ${weakest.subject}. We advise scheduling structured guidance or assigning supplementary question modules to lift proficiency from ${weakest.proficiency}% to the mandatory 75% PRC licensure passing benchmark before ${student.name}'s scheduled target exam.`
              : "Candidate maintains balanced performance across registered licensure disciplines. Continue daily question practice and simulated full-paper mock exams."}
          </p>
        </div>
      </div>

      {/* AI Insights: Confirmed Strengths & Vulnerability Risks */}
      {aiInsights &&
        ((aiInsights.strongAreas && aiInsights.strongAreas.length > 0) ||
          (aiInsights.weakAreas && aiInsights.weakAreas.length > 0) ||
          (aiInsights.recommendations && aiInsights.recommendations.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-4 border-t border-border">
            {aiInsights.strongAreas && aiInsights.strongAreas.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  AI Confirmed Strengths
                </span>
                <ul className="text-xs space-y-1.5 text-foreground">
                  {aiInsights.strongAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span className="leading-snug">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiInsights.weakAreas && aiInsights.weakAreas.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  AI Identified Gaps
                </span>
                <ul className="text-xs space-y-1.5 text-foreground">
                  {aiInsights.weakAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <span className="leading-snug">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </Card>
  );
}
