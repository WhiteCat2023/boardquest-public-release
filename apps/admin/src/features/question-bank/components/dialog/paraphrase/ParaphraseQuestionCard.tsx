import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Loader2,
  Wand2,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ParaphrasedItemState } from "./paraphraseTypes";
import ParaphraseVariantsAccordion from "./ParaphraseVariantsAccordion";

interface ParaphraseQuestionCardProps {
  item: ParaphrasedItemState;
  index: number;
  isBulkLoading: boolean;
  isAccordionOpen: boolean;
  onToggleAccordion: () => void;
  onSingleReParaphrase: (id: string) => void;
  onRevertSingle: (id: string) => void;
  onManualEdit: (id: string, newText: string) => void;
  onSelectAlternative: (id: string, altText: string) => void;
}

export default function ParaphraseQuestionCard({
  item,
  index,
  isBulkLoading,
  isAccordionOpen,
  onToggleAccordion,
  onSingleReParaphrase,
  onRevertSingle,
  onManualEdit,
  onSelectAlternative,
}: ParaphraseQuestionCardProps) {
  const isItemLoading = item.status === "loading";
  const isDifferent = item.current.trim() !== item.original.trim();

  return (
    <div
      className={`rounded-xl border transition-all p-3 sm:p-3.5 bg-card shadow-2xs ${
        isDifferent ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
      }`}
    >
      {/* Question Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-foreground text-[10.5px] font-bold">
            {index + 1}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-medium bg-muted/40 border-border/80 px-2 py-0 rounded-md text-foreground"
          >
            {item.topic}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[9.5px] font-bold px-1.5 py-0 rounded-md ${
              item.difficulty === "HARD"
                ? "border-destructive/30 text-destructive bg-destructive/10"
                : item.difficulty === "MEDIUM"
                ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            }`}
          >
            {item.difficulty}
          </Badge>
        </div>

        {/* Actions & Status on Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Status indicator */}
          {isItemLoading ? (
            <span className="flex items-center gap-1 text-[10.5px] font-semibold text-primary animate-pulse">
              <Loader2 size={11} className="animate-spin" />
              Generating...
            </span>
          ) : isDifferent ? (
            <span className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={11} /> Paraphrased
            </span>
          ) : (
            <span className="text-[10.5px] font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full border border-border/50">
              Original Wording
            </span>
          )}

          {/* Single Item Buttons */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSingleReParaphrase(item.id)}
              disabled={isItemLoading || isBulkLoading}
              title="Generate a new paraphrased variant for this question"
              className="h-6.5 px-2 text-[11px] font-semibold gap-1 text-primary border-primary/25 bg-primary/5 hover:bg-primary/15 cursor-pointer disabled:opacity-50 rounded-lg shadow-2xs"
            >
              <Wand2
                size={11}
                className={isItemLoading ? "animate-spin" : ""}
              />
              Re-paraphrase
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRevertSingle(item.id)}
              disabled={isItemLoading || isBulkLoading || !isDifferent}
              title="Revert back to the original question stem"
              className="h-6.5 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer disabled:opacity-30 rounded-lg gap-1"
            >
              <Undo2 size={11} />
              Revert
            </Button>
          </div>
        </div>
      </div>

      {/* Side-by-side Comparative View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Left Column: Original Stem */}
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/30 border border-border/70">
          <span className="text-[9.5px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
            <HelpCircle size={10} /> Original Stem
          </span>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed select-text mt-0.5">
            {item.original}
          </p>
        </div>

        {/* Right Column: Paraphrased Stem (Editable) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold tracking-wider text-primary flex items-center gap-1">
              <Sparkles size={10} /> Paraphrased Stem
            </span>
            {isDifferent && (
              <span className="text-[9.5px] text-muted-foreground">
                (Editable)
              </span>
            )}
          </div>

          <textarea
            value={item.current}
            onChange={(e) => onManualEdit(item.id, e.target.value)}
            disabled={isItemLoading}
            rows={2}
            className={`w-full text-xs font-medium leading-relaxed rounded-lg p-2.5 border transition-all resize-none focus:outline-none focus:ring-1 focus:ring-primary ${
              isDifferent
                ? "bg-card border-primary/35 text-foreground shadow-2xs"
                : "bg-muted/20 border-border text-foreground/80"
            }`}
            placeholder="Paraphrased question stem..."
          />
        </div>
      </div>

      {/* Quick Variants Accordion */}
      {!isItemLoading && (
        <ParaphraseVariantsAccordion
          alternatives={item.alternatives}
          currentText={item.current}
          isOpen={isAccordionOpen}
          onToggle={onToggleAccordion}
          onSelectVariant={(altText) => onSelectAlternative(item.id, altText)}
        />
      )}
    </div>
  );
}
