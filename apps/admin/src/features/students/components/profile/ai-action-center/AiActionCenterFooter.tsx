import { ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiActionCenterFooterProps {
  onAssignGuidance?: () => void;
  onOpenScorecard?: () => void;
}

export function AiActionCenterFooter({
  onAssignGuidance,
  onOpenScorecard,
}: AiActionCenterFooterProps) {
  return (
    <>
      {/* Expected Overall Outcome Banner */}
      <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-0.5 mt-2">
        <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Projected Readiness Growth</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">
            +36% Expected
          </span>
        </div>
        <div className="text-xs font-bold text-foreground">
          Passing Probability:{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            48% &rarr; 84%
          </span>{" "}
          upon addressing top 2 gaps.
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
    </>
  );
}

export default AiActionCenterFooter;
