import React from "react";
import { Tag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/utils/style";
import type { Question } from "@/types/question";

interface QuestionCardHeaderProps {
  question: Question;
  showComments: boolean;
  onToggleComments: () => void;
  commentsCount: number;
}

export function QuestionCardHeader({
  question,
  showComments,
  onToggleComments,
  commentsCount,
}: QuestionCardHeaderProps) {
  return (
    <div className="p-3.5 px-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/30">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-card px-2.5 py-1 text-[11px] font-mono font-extrabold tracking-wider text-foreground border border-border shadow-2xs flex items-center gap-1">
          Q-{question.id.slice(-6).toUpperCase()}
        </span>
        <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide border border-indigo-500/20 flex items-center gap-1">
          <Tag size={12} />
          {question.category?.name || "Subject Category"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(
            question.status,
          )}`}
        >
          {question.status}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleComments}
          className={`cursor-pointer font-semibold px-3 py-1 rounded-lg h-7.5 text-xs flex items-center gap-1.5 transition-all ${
            showComments
              ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <MessageSquare size={13} />
          <span>Comments</span>
          {commentsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                showComments
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {commentsCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export default QuestionCardHeader;
