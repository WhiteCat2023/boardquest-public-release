import { Eye } from "lucide-react";
import type { RankTier } from "../../types/types";
import { getRankIconComponent } from "./rankEditorConstants";

interface RankLivePreviewCardProps {
  title: string;
  description: string;
  minLevel: number;
  maxLevel: number | null;
  isUncapped: boolean;
  calculatedMinXp: number;
  icon: string;
  color: string;
  isActive: boolean;
  rank?: RankTier | null;
}

export default function RankLivePreviewCard({
  title,
  description,
  minLevel,
  maxLevel,
  isUncapped,
  calculatedMinXp,
  icon,
  color,
  isActive,
  rank,
}: RankLivePreviewCardProps) {
  const SelectedIconComp = getRankIconComponent(icon);

  return (
    <div className="rounded-2xl p-5 border border-border/80 bg-background/60 backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Live Aspirant Card Preview
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isActive
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md relative group shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 24px -4px ${color}40`,
            }}
          >
            <SelectedIconComp className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground tracking-tight">
              {title || "Untitled Rank Tier"}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
              {description || "No description provided yet."}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/80">
                Level {minLevel} {isUncapped ? "+" : `– ${maxLevel ?? ""}`}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {calculatedMinXp.toLocaleString()} Min XP
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
          <div className="text-[11px] text-muted-foreground">
            Enrolled Students
          </div>
          <div className="text-lg font-extrabold text-foreground mt-0.5">
            {(rank?.studentCount ?? 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
