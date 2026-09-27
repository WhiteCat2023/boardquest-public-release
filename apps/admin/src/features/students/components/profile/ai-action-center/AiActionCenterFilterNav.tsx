import type { InsightFilter } from "./aiActionCenterTypes";

interface AiActionCenterFilterNavProps {
  activeTab: InsightFilter;
  onTabChange: (tab: InsightFilter) => void;
}

export function AiActionCenterFilterNav({
  activeTab,
  onTabChange,
}: AiActionCenterFilterNavProps) {
  return (
    <div className="px-4 pt-3 pb-1 border-b border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
      <button
        type="button"
        onClick={() => onTabChange("all")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
          activeTab === "all"
            ? "bg-foreground text-background shadow-xs"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        }`}
      >
        Insights
      </button>
      <button
        type="button"
        onClick={() => onTabChange("strengths")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
          activeTab === "strengths"
            ? "bg-emerald-600 text-white shadow-xs"
            : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10"
        }`}
      >
        <span>Strengths</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange("gaps")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
          activeTab === "gaps"
            ? "bg-rose-600 text-white shadow-xs"
            : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
        }`}
      >
        <span>Weaknesses</span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange("suggestions")}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
          activeTab === "suggestions"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        }`}
      >
        <span>Suggestions</span>
      </button>
    </div>
  );
}

export default AiActionCenterFilterNav;
