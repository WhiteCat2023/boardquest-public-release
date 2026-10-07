import { ArrowLeft, ArrowRight, Edit3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QuestionStatus } from "@/types/question";

interface FastReviewActionBarProps {
  currentIndex: number;
  totalQuestions: number;
  isApproving: boolean;
  questionStatus?: string;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
  onApprove: () => void;
}

export default function FastReviewActionBar({
  currentIndex,
  totalQuestions,
  isApproving,
  questionStatus,
  onPrev,
  onNext,
  onEdit,
  onApprove,
}: FastReviewActionBarProps) {
  const isApproved = questionStatus === QuestionStatus.APPROVED;

  return (
    <div className="p-3 px-4 border-t border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2.5">
      {/* Previous / Next buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-foreground gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <ArrowLeft size={13} />
          <span>Previous</span>
          <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
            K
          </kbd>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1}
          className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-foreground gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <span>Next</span>
          <ArrowRight size={13} />
          <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
            J
          </kbd>
        </Button>
      </div>

      {/* Edit and Approve Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer shadow-2xs"
        >
          <Edit3 size={13} />
          <span>Edit</span>
          <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
            E
          </kbd>
        </Button>

        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={onApprove}
          disabled={isApproving || isApproved}
          className="h-8 px-4 rounded-lg text-xs font-bold gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
        >
          {isApproving ? (
            <Spinner size="xs" variant="current" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          <span>Approve &amp; Next</span>
          <kbd className="hidden sm:inline-block px-1.5 bg-emerald-700/80 text-white text-[9px] font-mono rounded">
            A
          </kbd>
        </Button>
      </div>
    </div>
  );
}
