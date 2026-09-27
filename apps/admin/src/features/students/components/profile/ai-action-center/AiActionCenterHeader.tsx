import { Sparkles } from "lucide-react";

export function AiActionCenterHeader() {
  return (
    <div className="bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/10 dark:from-purple-500/25 dark:via-pink-500/20 dark:to-primary/20 p-4 border-b border-border/80 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-extrabold text-foreground">
              AI Insights
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
              Mentor v2
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Gaps, Strengths &amp; Improvement Plan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold shadow-2xs">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Agent Live</span>
      </div>
    </div>
  );
}

export default AiActionCenterHeader;
