import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StrengthOrGapItem } from "./aiActionCenterTypes";

interface AiWeaknessesSectionProps {
  primaryGap: StrengthOrGapItem;
  secondaryGap?: StrengthOrGapItem | null;
}

export function AiWeaknessesSection({
  primaryGap,
  secondaryGap,
}: AiWeaknessesSectionProps) {
  return (
    <div className="border border-rose-500/25 bg-rose-500/[0.04] rounded-xl p-3.5 space-y-2.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
          <span className="p-1 rounded-md bg-rose-500/15">
            <AlertTriangle size={13} />
          </span>
          <span className="text-xs font-black uppercase tracking-wider">
            Weaknesses
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
          {primaryGap.completion === 0 &&
          (primaryGap.totalQuestionsAnswered || 0) === 0
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
  );
}

export default AiWeaknessesSection;
