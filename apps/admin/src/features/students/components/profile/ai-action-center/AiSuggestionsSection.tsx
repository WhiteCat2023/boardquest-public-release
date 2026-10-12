import { Lightbulb, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StrengthOrGapItem } from "./aiActionCenterTypes";

interface AiSuggestionsSectionProps {
  primaryGap: StrengthOrGapItem;
  dailyQuota: number;
  daysRemaining: number;
  targetBatch: string;
  onAssignGuidance?: () => void;
}

export function AiSuggestionsSection({
  primaryGap,
  dailyQuota,
  daysRemaining,
  targetBatch,
  onAssignGuidance,
}: AiSuggestionsSectionProps) {
  const isUnstarted =
    primaryGap.completion === 0 &&
    (primaryGap.totalQuestionsAnswered || 0) === 0;

  const primaryGapKeyword = primaryGap.subject.split(" ")[0];

  return (
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

      {/* Suggestion 1: Targeted Diagnostic Drill or Remediation */}
      <div className="bg-card/80 border border-primary/20 rounded-lg p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-foreground">
            1. {isUnstarted ? `Prescribe Diagnostic Drill in ${primaryGapKeyword}` : `Prescribe Targeted Remediation in ${primaryGapKeyword}`}
          </span>
          <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
            {isUnstarted ? "+25% Pass Lift" : "+20% Pass Lift"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isUnstarted
            ? `Assign an initial 15-minute diagnostic drill (15–20 high-yield questions) to establish baseline mastery and uncover conceptual misconceptions in ${primaryGap.subject}.`
            : `Assign a targeted remediation drill with clinical rationales to boost question accuracy from ${primaryGap.proficiency}% toward the 75% benchmark in ${primaryGap.subject}.`}
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
          Maintain {dailyQuota} questions/day quota pace for the {targetBatch}.
          Allocate 60% of daily volume to lagging discipline ({primaryGap.subject}) to
          achieve 90%+ syllabus completion.
        </p>
      </div>

      {/* Suggestion 3: Rationale Review & Cognitive Feedback */}
      <div className="bg-card/80 border border-border/80 rounded-lg p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-foreground">
            3. Cognitive Error &amp; Rationale Review
          </span>
          <span className="text-[9.5px] font-semibold text-muted-foreground">
            10–15 min/session
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Require student review of detailed explanation rationales on incorrect HOTS
          and LOTS items in {primaryGap.subject} to eliminate recurrent clinical misconceptions.
        </p>
      </div>
    </div>
  );
}

export default AiSuggestionsSection;
