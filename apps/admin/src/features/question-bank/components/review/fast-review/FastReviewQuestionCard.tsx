import { Sparkles } from "lucide-react";
import type { Question } from "@/types/question";
import { extractQuestionDisplayData } from "./fastReviewTypes";
import FastReviewQuestionHeader from "./FastReviewQuestionHeader";
import FastReviewChoicesSection from "./FastReviewChoicesSection";
import FastReviewActionBar from "./FastReviewActionBar";

interface FastReviewQuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  isApproving: boolean;
  onBackToTable?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
  onApprove: () => void;
}

export default function FastReviewQuestionCard({
  question,
  currentIndex,
  totalQuestions,
  isApproving,
  onBackToTable,
  onPrev,
  onNext,
  onEdit,
  onApprove,
}: FastReviewQuestionCardProps) {
  const {
    questionContent,
    subjectName,
    topicName,
    imageUrl,
    choiceImages,
    choicesList,
    correctAnswer,
    rationale,
    displayStatus,
  } = extractQuestionDisplayData(question);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Question Card Header */}
      <FastReviewQuestionHeader
        questionId={question.id}
        subjectName={subjectName}
        topicName={topicName}
        difficulty={question.difficulty}
        displayStatus={displayStatus}
        onBackToTable={onBackToTable}
      />

      {/* Question Stem, Media, Choices, and Rationale */}
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Stem */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Question Stem
          </span>
          <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed whitespace-pre-wrap">
            {questionContent}
          </p>
        </div>

        {/* Question Image Attachment */}
        {imageUrl && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Question Image Attachment
            </span>
            <div className="p-2 bg-muted/20 border border-border rounded-xl flex items-center justify-center max-h-[280px] overflow-hidden">
              <img
                src={imageUrl}
                alt="Question attachment"
                className="max-h-[260px] w-auto max-w-full rounded-lg object-contain border border-border"
              />
            </div>
          </div>
        )}

        {/* Choices / Options */}
        <FastReviewChoicesSection
          choicesList={choicesList}
          choiceImages={choiceImages}
          correctAnswer={correctAnswer}
        />

        {/* Rationale / Explanation */}
        {rationale && (
          <div className="mt-2 p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Medical Rationale &amp; Explanation
              </span>
            </div>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {rationale}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <FastReviewActionBar
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        isApproving={isApproving}
        questionStatus={question.status}
        onPrev={onPrev}
        onNext={onNext}
        onEdit={onEdit}
        onApprove={onApprove}
      />
    </div>
  );
}
