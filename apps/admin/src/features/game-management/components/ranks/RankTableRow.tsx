import { Edit2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { RankTier } from "../../types/types";
import { getRankIcon } from "./rankIcons";

interface RankTableRowProps {
  rank: RankTier;
  onEditRank: (rank: RankTier) => void;
  onDeleteRank: (rank: RankTier) => void;
  onToggleRankActive: (id: string) => void;
  onInspectStudents: (rank: RankTier) => void;
}

export default function RankTableRow({
  rank,
  onEditRank,
  onDeleteRank,
  onToggleRankActive,
  onInspectStudents,
}: RankTableRowProps) {
  const IconComp = getRankIcon(rank.icon);
  const studentCount = rank.studentCount ?? 0;
  const perksList = Array.isArray(rank.perks) ? rank.perks : [];

  return (
    <tr className="hover:bg-muted/20 transition-colors group">
      {/* Rank Artwork & Title */}
      <td className="py-2.5 px-4 font-medium">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: rank.color || "#3B82F6" }}
          >
            <IconComp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-foreground">
                {rank.title}
              </span>
              {rank.rankId && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border/50"
                  title={`Slug: ${rank.rankId}`}
                >
                  {rank.rankId}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
              {rank.description}
            </div>
          </div>
        </div>
      </td>

      {/* Level Bracket */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold border border-border text-foreground">
          Level {rank.minLevel} {rank.maxLevel ? `– ${rank.maxLevel}` : "+"}
        </span>
      </td>

      {/* Min Required XP */}
      <td className="py-2.5 px-3 font-extrabold text-primary whitespace-nowrap">
        {rank.minXp.toLocaleString()} XP
      </td>

      {/* Perks & Benefits */}
      <td className="py-2.5 px-3">
        {perksList.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap max-w-xs">
            {perksList.slice(0, 2).map((perk, i) => (
              <span
                key={i}
                className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/50 truncate max-w-[130px]"
                title={perk}
              >
                {perk}
              </span>
            ))}
            {perksList.length > 2 && (
              <span
                className="text-[9px] font-bold text-muted-foreground px-1"
                title={perksList.slice(2).join(", ")}
              >
                +{perksList.length - 2} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            No perks set
          </span>
        )}
      </td>

      {/* Enrolled Students */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onInspectStudents(rank)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-accent border border-border transition-all cursor-pointer text-[11px]"
          title="Inspect enrolled students"
        >
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>{studentCount} Students</span>
        </button>
      </td>

      {/* Status Toggle */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Switch
            checked={rank.isActive}
            onCheckedChange={() => onToggleRankActive(rank.id)}
          />
          <span
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${
              rank.isActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {rank.isActive ? "ACTIVE" : "DISABLED"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-2.5 px-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEditRank(rank)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="Edit Rank"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDeleteRank(rank)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg"
            title="Delete Rank"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
