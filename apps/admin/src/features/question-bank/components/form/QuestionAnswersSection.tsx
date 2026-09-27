import React from "react";
import { HelpCircle } from "lucide-react";
import MultipleChoiceInput from "../MCQInput";
import TrueOrFalseInput from "../TOFInput";
import ShortAnswerInput from "../ShortAnswerInput";
import type { QuestionFormat } from "./QuestionFormatSelector";

interface QuestionAnswersSectionProps {
  format: QuestionFormat;
  // MCQ props
  mcqChoices: string[];
  mcqChoiceImages: string[];
  mcqCorrectIndex: number;
  onMcqChoiceChange: (index: number, val: string) => void;
  onChoiceImageChange: (index: number, imgUrl: string) => void;
  onSetMcqCorrectIndex: (index: number) => void;
  onAddMcqChoice: () => void;
  onRemoveMcqChoice: (index: number) => void;
  // TF props
  tfCorrect: "True" | "False";
  onTfCorrectChange: (val: "True" | "False") => void;
  // Short Answer props
  saCorrectAnswer: string;
  onSaCorrectAnswerChange: (val: string) => void;
}

export function QuestionAnswersSection({
  format,
  mcqChoices,
  mcqChoiceImages,
  mcqCorrectIndex,
  onMcqChoiceChange,
  onChoiceImageChange,
  onSetMcqCorrectIndex,
  onAddMcqChoice,
  onRemoveMcqChoice,
  tfCorrect,
  onTfCorrectChange,
  saCorrectAnswer,
  onSaCorrectAnswerChange,
}: QuestionAnswersSectionProps) {
  return (
    <div className="border border-border/80 rounded-lg bg-muted/20 overflow-hidden">
      <div className="p-2.5 px-3.5 border-b border-border bg-muted/40 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
        <div className="flex items-center gap-1.5">
          <HelpCircle size={13} className="text-primary" />
          <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
            Options & Correct Key
          </span>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
          Toggle selection to set answer key
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        {format === "MCQ" ? (
          <MultipleChoiceInput
            mcqChoices={mcqChoices}
            mcqChoiceImages={mcqChoiceImages}
            mcqCorrectIndex={mcqCorrectIndex}
            handleChange={onMcqChoiceChange}
            handleImageChange={onChoiceImageChange}
            setMcqCorrectIndex={onSetMcqCorrectIndex}
            handleAddChoice={onAddMcqChoice}
            handleRemoveChoice={onRemoveMcqChoice}
          />
        ) : format === "TRUE_FALSE" ? (
          <TrueOrFalseInput
            tfCorrect={tfCorrect}
            setTfCorrect={onTfCorrectChange}
          />
        ) : (
          <ShortAnswerInput
            saCorrectAnswer={saCorrectAnswer}
            setSaCorrectAnswer={onSaCorrectAnswerChange}
          />
        )}
      </div>
    </div>
  );
}

export default QuestionAnswersSection;
