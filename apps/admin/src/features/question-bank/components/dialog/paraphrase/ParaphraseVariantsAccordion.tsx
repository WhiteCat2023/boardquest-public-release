import { Layers, ChevronDown, CheckCircle2 } from "lucide-react";

interface ParaphraseVariantsAccordionProps {
  alternatives: string[];
  currentText: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectVariant: (altText: string) => void;
}

export default function ParaphraseVariantsAccordion({
  alternatives,
  currentText,
  isOpen,
  onToggle,
  onSelectVariant,
}: ParaphraseVariantsAccordionProps) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-border/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-1 px-1.5 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Layers
            size={11}
            className="text-primary group-hover:scale-110 transition-transform"
          />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            Quick Variants ({alternatives.length})
          </span>
          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
            — {isOpen ? "Click to collapse" : "Click to view full variant options"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          <span className="text-[10px]">{isOpen ? "Hide" : "Expand"}</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Accordion Expandable Content */}
      {isOpen && (
        <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {alternatives.map((alt, altIdx) => {
            const isCurrent = alt.trim() === currentText.trim();
            return (
              <div
                key={altIdx}
                onClick={() => onSelectVariant(alt)}
                className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-primary/10 border-primary/40 text-foreground ring-1 ring-primary/20 shadow-2xs font-medium"
                    : "bg-muted/30 border-border/70 hover:bg-muted/70 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold shrink-0 mt-0.5 ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    Variant {altIdx + 1}
                  </span>
                  <p className="text-xs leading-relaxed select-text font-normal">
                    {alt}
                  </p>
                </div>

                <div className="shrink-0 flex items-center pt-0.5">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      <CheckCircle2 size={11} /> Selected
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-semibold text-muted-foreground hover:text-primary flex items-center gap-1">
                      Use This
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
