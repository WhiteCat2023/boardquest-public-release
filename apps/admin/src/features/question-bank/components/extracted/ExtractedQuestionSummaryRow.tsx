import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { getDifficultyColor } from "@/utils/style";
import type { ExtractedQuestionItem } from "./extractedTypes";

interface ExtractedQuestionSummaryRowProps {
  index: number;
  question: ExtractedQuestionItem;
  choices: string[];
  isExpanded: boolean;
  isDuplicate?: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export default function ExtractedQuestionSummaryRow({
  index,
  question,
  choices,
  isExpanded,
  isDuplicate,
  onToggleExpand,
  onDelete,
}: ExtractedQuestionSummaryRowProps) {
  const currentType = question.type || "MCQ";
  const currentDifficulty = question.difficulty || "MEDIUM";
  const currentTopic = question.topic || "General";
  const currentCorrectAnswer = question.correctAnswer || "";
  const choicesDisplay = choices.join(" | ");

  return (
    <TableRow
      className={`transition-colors cursor-pointer select-none ${
        isExpanded
          ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
          : isDuplicate
            ? "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500"
            : "hover:bg-muted/40"
      }`}
      onClick={onToggleExpand}
    >
      <TableCell className="hidden lg:table-cell pl-4 text-center font-bold text-xs text-muted-foreground">
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] border border-border">
          #{index + 1}
        </span>
      </TableCell>

      {/* Question Wording Column */}
      <TableCell>
        <div className="flex flex-col gap-1 max-w-[420px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed"
              title={question.question}
            >
              {question.question || "Untitled Question"}
            </span>
            {isDuplicate && (
              <span className="shrink-0 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                Duplicate (Skipped)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {choicesDisplay && (
              <span
                className="text-[11px] text-muted-foreground truncate max-w-[250px]"
                title={choicesDisplay}
              >
                Choices: {choicesDisplay}
              </span>
            )}
            <span className="lg:hidden rounded bg-muted border border-border px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
              {currentDifficulty}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Topic Column */}
      <TableCell className="hidden lg:table-cell">
        <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
          <Tag size={10} className="text-muted-foreground/60" />
          {currentTopic}
        </span>
      </TableCell>

      {/* Type Column */}
      <TableCell className="hidden lg:table-cell">
        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {currentType}
        </span>
      </TableCell>

      {/* Difficulty Column */}
      <TableCell className="hidden lg:table-cell">
        <span
          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyColor(
            currentDifficulty
          )}`}
        >
          {currentDifficulty}
        </span>
      </TableCell>

      {/* Answer Key Column */}
      <TableCell className="hidden lg:table-cell">
        <span
          className="text-xs font-medium text-foreground bg-primary/5 px-2 py-1 rounded-md border border-primary/10 inline-block truncate max-w-[240px]"
          title={currentCorrectAnswer}
        >
          {currentCorrectAnswer || "N/A"}
        </span>
      </TableCell>

      {/* Actions Column */}
      <TableCell
        className="text-right pr-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5">
          {/* Accordion Expand / Edit Button */}
          <Button
            type="button"
            variant={isExpanded ? "default" : "outline"}
            size="sm"
            onClick={onToggleExpand}
            className={`h-7 px-2.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
              isExpanded
                ? "bg-primary text-primary-foreground"
                : "text-foreground border-border hover:bg-muted hover:text-primary"
            }`}
            title={
              isExpanded
                ? "Collapse Question Info"
                : "Edit & View Question Info"
            }
          >
            <Pencil
              size={12}
              className={
                isExpanded ? "text-primary-foreground" : "text-primary"
              }
            />
            <span>{isExpanded ? "Done" : "Edit"}</span>
            {isExpanded ? (
              <ChevronUp size={13} className="ml-0.5 opacity-80" />
            ) : (
              <ChevronDown size={13} className="ml-0.5 opacity-60" />
            )}
          </Button>

          {/* Delete Row Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer rounded-lg"
            title="Remove Question"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
