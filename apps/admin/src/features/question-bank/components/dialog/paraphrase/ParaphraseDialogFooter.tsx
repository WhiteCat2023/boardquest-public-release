import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParaphraseDialogFooterProps {
  changedCount: number;
  isSaving: boolean;
  isBulkLoading: boolean;
  hasApplyToForm: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function ParaphraseDialogFooter({
  changedCount,
  isSaving,
  isBulkLoading,
  hasApplyToForm,
  onClose,
  onApply,
}: ParaphraseDialogFooterProps) {
  return (
    <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-border bg-card flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        {changedCount > 0 ? (
          <span className="text-foreground font-semibold flex items-center gap-1.5">
            <CheckCircle2
              size={13}
              className="text-emerald-600 dark:text-emerald-400"
            />
            {hasApplyToForm
              ? "Question paraphrased and ready to apply to form"
              : `${changedCount} question${
                  changedCount !== 1 ? "s" : ""
                } will be updated`}
          </span>
        ) : (
          <span>All questions currently match original wording.</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSaving}
          className="text-xs h-8 px-3.5 rounded-xl border-border cursor-pointer font-semibold"
        >
          Cancel
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onApply}
          disabled={isSaving || isBulkLoading || changedCount === 0}
          className="text-xs h-8 px-4 rounded-xl gap-1.5 font-bold shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Saving...
            </>
          ) : hasApplyToForm ? (
            <>
              <Sparkles size={12} />
              Apply to Question
            </>
          ) : (
            <>
              <Sparkles size={12} />
              Apply & Save ({changedCount})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
