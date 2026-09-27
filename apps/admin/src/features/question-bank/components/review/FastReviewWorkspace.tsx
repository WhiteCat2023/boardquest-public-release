import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import QuestionCommentsPanel from "../QuestionCommentsPanel";
import FastReviewShortcutsModal from "./FastReviewShortcutsModal";
import {
  type FastReviewWorkspaceProps,
  useFastReviewNavigation,
  FastReviewEmptyState,
  FastReviewQuestionCard,
} from "./fast-review";

export type { FastReviewWorkspaceProps };

export default function FastReviewWorkspace({
  questions,
  isLoading,
  onRefresh,
  selectedAuthor,
  initialQuestionId,
  onBackToTable,
}: FastReviewWorkspaceProps) {
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const {
    currentIndex,
    activeQuestion,
    totalQuestions,
    isApproving,
    handleNext,
    handlePrev,
    handleApprove,
    handleEdit,
  } = useFastReviewNavigation({
    questions,
    initialQuestionId,
    onRefresh,
    onBackToTable,
    onOpenShortcuts: () => setIsShortcutsOpen(true),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-2xl">
        <Spinner size="lg" variant="default" />
        <p className="text-xs font-semibold text-muted-foreground">
          Loading pending questions for review...
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !activeQuestion) {
    return (
      <FastReviewEmptyState
        selectedAuthor={selectedAuthor}
        onBackToTable={onBackToTable}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 font-sans w-full animate-in fade-in duration-200">
      {/* ── Main Split View Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ── Left Column: Question Details & Inspection (7 Cols) ── */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <FastReviewQuestionCard
            question={activeQuestion}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            isApproving={isApproving}
            onBackToTable={onBackToTable}
            onPrev={handlePrev}
            onNext={handleNext}
            onEdit={handleEdit}
            onApprove={handleApprove}
          />
        </div>

        {/* ── Right Column: Integrated Comments & Discussion Panel (5 Cols) ── */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <QuestionCommentsPanel
            questionId={activeQuestion.id}
            questionStatus={activeQuestion.status}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <FastReviewShortcutsModal
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </div>
  );
}
