import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";
import { CHOICE_LETTERS } from "./extractedTypes";

interface ExtractedQuestionChoicesEditorProps {
  index: number;
  type: string;
  choices: string[];
  correctAnswer: string;
  onCorrectAnswerChange: (newAnswer: string) => void;
  onChoicesChange: (newChoices: string[], newCorrectAnswer?: string) => void;
}

export default function ExtractedQuestionChoicesEditor({
  index,
  type,
  choices,
  correctAnswer,
  onCorrectAnswerChange,
  onChoicesChange,
}: ExtractedQuestionChoicesEditorProps) {
  const isMcq = type === "MCQ" || !type;
  const isTrueFalse = type === "TRUE_FALSE";
  const isShortAnswer = type === "SHORT_ANSWER";

  const handleChoiceTextChange = (cIdx: number, newText: string) => {
    const oldText = choices[cIdx];
    const nextChoices = [...choices];
    nextChoices[cIdx] = newText;

    // Keep correct answer in sync if this was the selected choice
    const nextCorrectAnswer =
      correctAnswer === oldText ? newText : correctAnswer;

    onChoicesChange(nextChoices, nextCorrectAnswer);
  };

  const handleAddChoice = () => {
    if (choices.length >= 8) return;
    const newLetter =
      CHOICE_LETTERS[choices.length] || `Option ${choices.length + 1}`;
    const nextChoices = [...choices, `Choice ${newLetter}`];
    onChoicesChange(nextChoices);
  };

  const handleRemoveChoice = (cIdx: number) => {
    if (choices.length <= 2) return;
    const removedText = choices[cIdx];
    const nextChoices = choices.filter((_, i) => i !== cIdx);

    // If removed choice was the correct answer, fallback to first choice
    let nextCorrect = correctAnswer;
    if (correctAnswer === removedText) {
      nextCorrect = nextChoices[0] || "";
    }

    onChoicesChange(nextChoices, nextCorrect);
  };

  return (
    <div className="space-y-2 pt-1 border-t border-border/60">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <span>Choices &amp; Answer Key</span>
          <span className="text-[10px] font-normal text-muted-foreground">
            {isMcq
              ? "(Select the radio button to set as correct answer)"
              : "(Specify the correct answer)"}
          </span>
        </label>

        {isMcq && choices.length < 8 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddChoice}
            className="h-6 px-2 text-[11px] font-bold text-primary hover:bg-primary/10 cursor-pointer gap-1"
          >
            <Plus size={12} />
            <span>Add Option</span>
          </Button>
        )}
      </div>

      {/* MCQ Choices List */}
      {isMcq && (
        <div className="space-y-2">
          {choices.map((choice, cIdx) => {
            const isCorrect = correctAnswer === choice;
            const letter = CHOICE_LETTERS[cIdx] || `${cIdx + 1}`;

            return (
              <div
                key={cIdx}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-primary/5 border-primary/40 shadow-xs"
                    : "bg-background border-border"
                }`}
              >
                {/* Radio Button for Correct Answer */}
                <label
                  className="flex items-center gap-1.5 cursor-pointer shrink-0 pl-1"
                  title="Set as correct answer"
                >
                  <input
                    type="radio"
                    name={`correct-choice-${index}`}
                    checked={isCorrect}
                    onChange={() => onCorrectAnswerChange(choice)}
                    className="size-4 text-primary accent-primary cursor-pointer"
                  />
                  <span
                    className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isCorrect
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </span>
                </label>

                {/* Choice Text Input */}
                <Input
                  value={choice}
                  onChange={(e) => handleChoiceTextChange(cIdx, e.target.value)}
                  placeholder={`Option ${letter} text...`}
                  className="h-8 text-xs bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                />

                {/* Delete Choice Button */}
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChoice(cIdx)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete choice"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* True / False Selection */}
      {isTrueFalse && (
        <div className="flex items-center gap-3 pt-1">
          {["True", "False"].map((opt) => {
            const isCorrect =
              correctAnswer.toLowerCase() === opt.toLowerCase();
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onCorrectAnswerChange(opt)}
                className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isCorrect
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {isCorrect && <Check size={14} className="stroke-[3]" />}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Short Answer Input */}
      {isShortAnswer && (
        <div className="pt-1">
          <Input
            value={correctAnswer}
            onChange={(e) => onCorrectAnswerChange(e.target.value)}
            placeholder="Type the exact accepted answer key..."
            className="h-9 text-xs bg-background"
          />
        </div>
      )}
    </div>
  );
}
