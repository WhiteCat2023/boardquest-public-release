import { ArrowLeft, BookOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import { getCognitiveLevelMapping } from "@/utils/cognitiveLevel";

interface FastReviewQuestionHeaderProps {
  questionId: string;
  subjectName: string;
  topicName?: string;
  difficulty?: string;
  displayStatus: string;
  onBackToTable?: () => void;
}

export default function FastReviewQuestionHeader({
  questionId,
  subjectName,
  topicName,
  difficulty,
  displayStatus,
  onBackToTable,
}: FastReviewQuestionHeaderProps) {
  return (
    <div className="p-3 px-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {onBackToTable && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToTable}
            className="h-6 px-2 text-[11px] font-bold rounded-md bg-card hover:bg-accent border-border text-foreground gap-1 cursor-pointer shadow-2xs mr-0.5"
            title="Return to questions table (Esc)"
          >
            <ArrowLeft size={11} />
            <span>Table</span>
          </Button>
        )}
        <span className="rounded-md bg-card px-2 py-0.5 text-[11px] font-mono font-extrabold tracking-wider text-foreground border border-border shadow-2xs">
          Q-{questionId.slice(-4).toUpperCase()}
        </span>
        <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary flex items-center gap-1">
          <BookOpen size={11} />
          {subjectName}
        </span>
        {topicName && (
          <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Tag size={10} className="text-muted-foreground/60" />
            {topicName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {(() => {
          const cognitiveInfo = getCognitiveLevelMapping(difficulty);
          return (
            <>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${getDifficultyColor(
                  difficulty
                )}`}
              >
                {difficulty}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cognitiveInfo.badgeClass}`}
                title={`Cognitive Focus: ${cognitiveInfo.typicalFocus} (${cognitiveInfo.fullTitle})`}
              >
                {cognitiveInfo.label}
              </span>
            </>
          );
        })()}
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
            displayStatus
          )}`}
        >
          {displayStatus}
        </span>
      </div>
    </div>
  );
}
