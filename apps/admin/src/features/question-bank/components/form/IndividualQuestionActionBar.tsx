import { RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IndividualQuestionActionBarProps {
  isEditMode?: boolean;
  status?: string;
  isSubmitting: boolean;
  isNotOriginalQuestion: boolean;
  isQuotaLocked?: boolean;
  onCancel: () => void;
  onRestoreOriginal: () => void;
  onOpenParaphraser: () => void;
}

export function IndividualQuestionActionBar({
  isEditMode = false,
  status,
  isSubmitting,
  isNotOriginalQuestion,
  isQuotaLocked = false,
  onCancel,
  onRestoreOriginal,
  onOpenParaphraser,
}: IndividualQuestionActionBarProps) {
  const submitLabel = isSubmitting
    ? "Saving..."
    : isQuotaLocked
      ? "Quota Met (Locked)"
      : isEditMode
        ? status === "PENDING_REVISION" || status === "NEEDS_REVISION"
          ? "Update & Resubmit for Review"
          : "Update Question"
        : "Save & Submit Question";

  return (
    <div className="p-3 px-4 border-t border-border flex flex-wrap items-center justify-end gap-2 bg-muted/20">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-3.5 h-8 rounded-lg text-xs"
      >
        Cancel Draft
      </Button>

      {isNotOriginalQuestion && (
        <Button
          type="button"
          variant="outline"
          onClick={onRestoreOriginal}
          className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold px-3.5 h-8 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs animate-in fade-in duration-200"
        >
          <RotateCcw size={13} />
          Use Original Question
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onOpenParaphraser}
        disabled={isSubmitting || isQuotaLocked}
        className="border-primary/40 text-primary hover:bg-primary/10 font-bold px-3.5 h-8 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
      >
        <Sparkles size={13} className="text-primary" />
        AI Paraphrase
      </Button>

      <Button
        type="submit"
        disabled={isSubmitting || isQuotaLocked}
        className={`cursor-pointer font-semibold px-4 h-8 rounded-lg text-xs flex items-center gap-1.5 shadow-xs ${
          isQuotaLocked
            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
        title={
          isQuotaLocked
            ? "Question authoring quota has already been met for this subject."
            : undefined
        }
      >
        {isQuotaLocked && <CheckCircle2 size={13} className="text-emerald-500" />}
        {submitLabel}
      </Button>
    </div>
  );
}

export default IndividualQuestionActionBar;
