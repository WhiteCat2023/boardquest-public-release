import React from "react";
import { Tag } from "lucide-react";
import { getDifficultyColor } from "@/utils/style";

interface QuestionMetaStripProps {
  format: string;
  difficulty: string;
  topic?: string | null;
}

export function QuestionMetaStrip({
  format,
  difficulty,
  topic,
}: QuestionMetaStripProps) {
  return (
    <div className="p-3 px-5 border-b border-border bg-card flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Format:
        </span>
        <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded text-[11px] border border-border">
          {format}
        </span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Difficulty:
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyColor(
            difficulty,
          )}`}
        >
          {difficulty}
        </span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Topic:
        </span>
        <span className="font-semibold text-foreground flex items-center gap-1">
          <Tag size={11} className="text-primary/70" />
          {topic || "General"}
        </span>
      </div>
    </div>
  );
}

export default QuestionMetaStrip;
