import React from "react";
import { Check, KeyRound } from "lucide-react";
import { getInitials } from "@/utils/style";
import type { Question } from "@/types/question";

interface QuestionContentBodyProps {
  question: Question;
}

export function QuestionContentBody({ question }: QuestionContentBodyProps) {
  const authorName =
    typeof question?.author === "object"
      ? question?.author?.name
      : question?.author;

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* Question Wording */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Question Statement
        </label>
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-foreground font-semibold text-sm leading-relaxed whitespace-pre-wrap">
          {question.question || question.text}
        </div>
      </div>

      {/* Question Image Attachment */}
      {question.imageUrl && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Question Image Attachment
          </label>
          <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-center justify-center max-h-[320px] overflow-hidden">
            <img
              src={question.imageUrl}
              alt="Question visual"
              className="max-h-[300px] w-auto max-w-full rounded-lg object-contain border border-border"
            />
          </div>
        </div>
      )}

      {/* Answer Choices (for MCQ) */}
      {question.type === "MCQ" && question.choices && (
        <div className="space-y-2.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Answer Choices
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {question.choices.map((choice: string, idx: number) => {
              const isCorrect =
                choice.toLowerCase().trim() ===
                question.correctAnswer.toLowerCase().trim();
              const choiceLetter = String.fromCharCode(65 + idx);
              const choiceImage = (question.choiceImages || [])[idx];

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 rounded-xl border transition-all gap-2 ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 shadow-2xs"
                      : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {choiceLetter}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isCorrect
                          ? "text-emerald-800 dark:text-emerald-300 font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {choice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {choiceImage && (
                      <img
                        src={choiceImage}
                        alt={`Choice ${choiceLetter}`}
                        className="h-10 w-10 object-cover rounded-lg border border-border shrink-0"
                      />
                    )}
                    {isCorrect && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        <Check size={11} className="stroke-[3]" />
                        Correct Answer
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Answer Display (for True/False or Short Answer) */}
      {question.type !== "MCQ" && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Expected Correct Answer
          </label>
          <div className="p-3.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <KeyRound size={14} className="text-emerald-600" />
              <span>{question.correctAnswer}</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
              Key
            </span>
          </div>
        </div>
      )}

      {/* Author Profile and Metadata */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20 shrink-0">
            {getInitials(authorName)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">
              {authorName || "Author"}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground">
              Author Profile
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right text-[10px] font-medium text-muted-foreground">
          <span>Created: </span>
          <span className="font-semibold text-foreground">
            {new Date(question.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(question.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuestionContentBody;
