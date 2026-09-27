import { RefreshCw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParaphraseTone } from "./paraphraseTypes";

interface ParaphraseToolbarProps {
  tone: ParaphraseTone;
  onToneChange: (tone: ParaphraseTone) => void;
  onReParaphraseAll: () => void;
  onRevertAll: () => void;
  isBulkLoading: boolean;
  isAllReverted: boolean;
}

export default function ParaphraseToolbar({
  tone,
  onToneChange,
  onReParaphraseAll,
  onRevertAll,
  isBulkLoading,
  isAllReverted,
}: ParaphraseToolbarProps) {
  return (
    <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-muted/40 border-b border-border/70 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
      {/* Tone Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Style:
        </span>
        <select
          value={tone}
          onChange={(e) => onToneChange(e.target.value as ParaphraseTone)}
          disabled={isBulkLoading}
          className="bg-background text-foreground text-xs font-semibold rounded-lg px-2.5 py-1 border border-border shadow-2xs focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-50 h-7.5"
        >
          <option value="BOARD_EXAM">Board Exam Standard (Formal)</option>
          <option value="SCENARIO">Clinical Scenario (Case-based)</option>
          <option value="CONCISE">Concise & Direct (Streamlined)</option>
          <option value="SIMPLIFIED">Clear Syntax (Active Voice)</option>
        </select>
      </div>

      {/* Global Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReParaphraseAll}
          disabled={isBulkLoading}
          className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-border bg-background hover:bg-muted/70 shadow-2xs cursor-pointer"
        >
          <RefreshCw
            size={11}
            className={isBulkLoading ? "animate-spin" : ""}
          />
          Re-paraphrase All
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRevertAll}
          disabled={isBulkLoading || isAllReverted}
          className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer disabled:opacity-40 gap-1"
        >
          <Undo2 size={11} />
          Revert All
        </Button>
      </div>
    </div>
  );
}
