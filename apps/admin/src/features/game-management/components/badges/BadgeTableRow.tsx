import { Edit2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { GameBadge } from "../../types/types";
import { getTierMeta, getBadgeIcon } from "./badgeTableUtils";

interface BadgeTableRowProps {
  badge: GameBadge;
  imageError: boolean;
  onImageError: (url?: string | null) => void;
  onEditBadge: (badge: GameBadge) => void;
  onDeleteBadge: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function BadgeTableRow({
  badge,
  imageError,
  onImageError,
  onEditBadge,
  onDeleteBadge,
  onToggleActive,
}: BadgeTableRowProps) {
  const tierMeta = getTierMeta(badge);
  const IconComp = getBadgeIcon(badge.icon || badge.iconName);
  const photoUrl = badge.spriteUrl || badge.imageUrl;
  const hasCustomPhoto = Boolean(photoUrl && !imageError);
  const displayName = badge.name || badge.title;
  const displayXp = badge.xpReward ?? badge.xp ?? 50;

  return (
    <tr className="hover:bg-muted/20 transition-colors group">
      {/* Badge Artwork & Title */}
      <td className="py-2.5 px-4 font-medium">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {hasCustomPhoto ? (
              <div
                className={`w-9 h-9 rounded-xl overflow-hidden border bg-background shadow-2xs flex items-center justify-center ${tierMeta.borderColor}`}
              >
                <img
                  src={photoUrl!}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={() => onImageError(photoUrl)}
                />
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-xl border bg-background/90 shadow-2xs flex items-center justify-center ${tierMeta.color} ${tierMeta.borderColor}`}
              >
                <IconComp className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-bold text-xs ${tierMeta.color}`}>
                {displayName}
              </span>
              {badge.badgeId && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border/50"
                  title={`Slug: ${badge.badgeId}`}
                >
                  {badge.badgeId}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
              {badge.description}
            </div>
          </div>
        </div>
      </td>

      {/* Tier */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <span
          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-background/80 ${tierMeta.color} ${tierMeta.borderColor}`}
        >
          {tierMeta.badgeTag}
        </span>
      </td>

      {/* Category */}
      <td className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold border border-border">
          {badge.category}
        </span>
      </td>

      {/* XP Reward */}
      <td className="py-2.5 px-3 font-extrabold text-primary whitespace-nowrap">
        +{displayXp} XP
      </td>

      {/* Unlock Rule */}
      <td className="py-2.5 px-3">
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/40 border border-border text-foreground truncate max-w-[200px] inline-block"
          title={
            badge.unlockCondition ||
            `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`
          }
        >
          {badge.unlockCondition ||
            `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
        </span>
      </td>

      {/* Unlocked Count */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>{badge.unlockedCount || 0} Students</span>
        </div>
      </td>

      {/* Status Toggle */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Switch
            checked={badge.isActive}
            onCheckedChange={() => onToggleActive(badge.id)}
          />
          <span
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${
              badge.isActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {badge.isActive ? "ACTIVE" : "DISABLED"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-2.5 px-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditBadge(badge)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            title="Edit Badge"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteBadge(badge.id)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg"
            title="Delete Badge"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
