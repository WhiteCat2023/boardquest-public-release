import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Check,
  CheckCircle2,
  HelpCircle,
  FileText,
} from "lucide-react";
import type { ExtractedQuestionItem } from "./extractedTypes";
import ExtractedQuestionMetadataEditor from "./ExtractedQuestionMetadataEditor";
import ExtractedQuestionChoicesEditor from "./ExtractedQuestionChoicesEditor";

interface ExtractedQuestionDetailPanelProps {
  index: number;
  question: ExtractedQuestionItem;
  choices: string[];
  onFieldChange: (field: keyof ExtractedQuestionItem, value: any) => void;
  onTypeChange: (newType: string) => void;
  onChoicesChange: (newChoices: string[], newCorrectAnswer?: string) => void;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export default function ExtractedQuestionDetailPanel({
  index,
  question,
  choices,
  onFieldChange,
  onTypeChange,
  onChoicesChange,
  onToggleExpand,
  onDelete,
}: ExtractedQuestionDetailPanelProps) {
  const currentType = question.type || "MCQ";
  const currentDifficulty = question.difficulty || "MEDIUM";
  const currentTopic = question.topic || "";
  const currentCorrectAnswer = question.correctAnswer || "";

  return (
    <TableRow className="bg-muted/20 border-b border-border hover:bg-muted/20">
      <TableCell colSpan={7} className="p-0">
        <div className="p-4 sm:p-5 bg-card/80 border-y border-border/80 space-y-4 animate-in slide-in-from-top-1 duration-150 font-sans">
          {/* Accordion Header Ribbon */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <FileText size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground tracking-tight">
                  Edit Question #{index + 1}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Make any corrections below before uploading. Edits are immediately saved to the queue.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} />
              <span>Auto-saved</span>
            </div>
          </div>

          {/* 1. Question Prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <span>Question Wording / Stem</span>
              <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={question.question}
              onChange={(e) => onFieldChange("question", e.target.value)}
              placeholder="Enter the question text or clinical problem stem..."
              rows={3}
              className="text-xs resize-y bg-background font-medium leading-relaxed"
            />
          </div>

          {/* 2. Metadata Grid: Type, Difficulty, Topic */}
          <ExtractedQuestionMetadataEditor
            type={currentType}
            difficulty={currentDifficulty}
            topic={currentTopic}
            onTypeChange={onTypeChange}
            onDifficultyChange={(val) => onFieldChange("difficulty", val)}
            onTopicChange={(val) => onFieldChange("topic", val)}
          />

          {/* 3. Choices & Answer Key Configuration */}
          <ExtractedQuestionChoicesEditor
            index={index}
            type={currentType}
            choices={choices}
            correctAnswer={currentCorrectAnswer}
            onCorrectAnswerChange={(val) => onFieldChange("correctAnswer", val)}
            onChoicesChange={onChoicesChange}
          />

          {/* 4. Feedback / Explanation */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-border/60">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={12} className="text-muted-foreground/70" />
              <span>Explanation / Rationale (Optional)</span>
            </label>
            <Textarea
              value={question.feedback || ""}
              onChange={(e) => onFieldChange("feedback", e.target.value)}
              placeholder="Explain why this answer is correct (shown to students during rationale review)..."
              rows={2}
              className="text-xs resize-y bg-background font-medium"
            />
          </div>

          {/* 5. Accordion Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer gap-1.5 font-semibold"
            >
              <Trash2 size={13} />
              <span>Delete Question</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onToggleExpand}
              className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-1.5 rounded-xl shadow-xs"
            >
              <Check size={14} />
              <span>Done Editing</span>
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
