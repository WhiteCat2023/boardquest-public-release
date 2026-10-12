import { TrendingUp, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StrengthOrGapItem } from "./aiActionCenterTypes";

interface AiStrengthsSectionProps {
  primaryStrength: StrengthOrGapItem | null;
  streak: number;
  hasAcademicStrength?: boolean;
  academicStrengthRationale?: string;
}

export function AiStrengthsSection({
  primaryStrength,
  streak,
  hasAcademicStrength = false,
  academicStrengthRationale,
}: AiStrengthsSectionProps) {
  return (
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
          {hasAcademicStrength ? "Anchor Disciplines" : "Study Habits"}
        </Badge>
      </div>

      {/* Primary Academic Strength or Dynamic Baseline Card */}
      {hasAcademicStrength && primaryStrength ? (
        <div className="bg-card/80 border border-emerald-500/20 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                size={13}
                className="text-emerald-600 dark:text-emerald-400 shrink-0"
              />
              <span className="text-xs font-bold text-foreground">
                {primaryStrength.subject}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {primaryStrength.proficiency}% Proficiency
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {primaryStrength.dynamicRationale || academicStrengthRationale}
          </p>

          {/* Sub-metrics */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
              Completion: {primaryStrength.completion}%
            </span>
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Status: {primaryStrength.status || "In Training"}
            </span>
            {primaryStrength.weight && (
              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                {primaryStrength.weight}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card/80 border border-emerald-500/20 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles
                size={13}
                className="text-emerald-600 dark:text-emerald-400 shrink-0"
              />
              <span className="text-xs font-bold text-foreground">
                Diagnostic Baseline In Progress
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Awaiting Drills
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {academicStrengthRationale ||
              "Candidate is in the baseline diagnostic phase. Academic anchor disciplines will populate dynamically once practice drills or simulated mock exams are completed."}
          </p>

          {/* Sub-metrics */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
              Awaiting Diagnostic Data
            </span>
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Status: Calibration
            </span>
          </div>
        </div>
      )}

      {/* Secondary Habit Strength / Consistency */}
      <div className="flex items-center justify-between text-[11px] bg-card/50 border border-border/60 rounded-lg px-2.5 py-2">
        <div className="flex items-center gap-2">
          <Flame size={13} className="text-amber-500 shrink-0" />
          <span className="font-semibold text-foreground">
            Study Habit Consistency
          </span>
        </div>
        <span className="font-bold text-amber-600 dark:text-amber-400">
          {streak}-Day Active Streak
        </span>
      </div>
    </div>
  );
}

export default AiStrengthsSection;
