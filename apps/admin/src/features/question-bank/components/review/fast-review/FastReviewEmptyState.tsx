import { FileCheck2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FastReviewEmptyStateProps {
  selectedAuthor?: any;
  onBackToTable?: () => void;
}

export default function FastReviewEmptyState({
  selectedAuthor,
  onBackToTable,
}: FastReviewEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border border-border rounded-2xl font-sans">
      <div className="p-3.5 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 animate-in zoom-in-50">
        <FileCheck2 size={32} />
      </div>
      <h3 className="text-base font-bold text-foreground">
        All Questions Reviewed!
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        {selectedAuthor
          ? `There are no remaining pending questions for ${selectedAuthor.name}.`
          : "The review queue for the selected criteria is completely clear."}
      </p>
      {onBackToTable && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToTable}
          className="mt-4 gap-1.5 cursor-pointer text-xs"
        >
          <ArrowLeft size={13} />
          Back to Table
        </Button>
      )}
    </div>
  );
}
