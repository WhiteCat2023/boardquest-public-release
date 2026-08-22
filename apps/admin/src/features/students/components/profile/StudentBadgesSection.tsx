import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import type { StudentBadge } from "@/utils/badgeUtils";

interface StudentBadgesSectionProps {
  badges: StudentBadge[];
}

export function StudentBadgesSection({ badges = [] }: StudentBadgesSectionProps) {
  const [imageErrorIds, setImageErrorIds] = useState<Record<string, boolean>>({});

  const handleImageError = (badgeId: string) => {
    setImageErrorIds((prev) => ({ ...prev, [badgeId]: true }));
  };

  if (!badges || badges.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3">
          Earned Gamification Badges
        </h3>
        <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-semibold">
            No gamification badges earned yet by this student.
          </p>
          <p className="text-[10.5px] text-muted-foreground/75 mt-1">
            Badges will automatically appear here as the student achieves evaluation milestones and maintains study streaks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Earned Gamification Badges ({badges.length})
        </h3>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Active Student Achievements
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const IconComp = badge.icon;
          const hasCustomPhoto = Boolean(
            badge.spriteUrl && !imageErrorIds[badge.id]
          );

          return (
            <div
              key={badge.id || badge.badgeId}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${badge.bgColor} ${badge.borderColor} shadow-xs hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between gap-2">
                {/* Artwork / Icon */}
                <div className="relative shrink-0">
                  {hasCustomPhoto ? (
                    <div
                      className={`w-10 h-10 rounded-xl overflow-hidden border bg-card shadow-2xs flex items-center justify-center p-0.5 ${badge.borderColor}`}
                    >
                      <img
                        src={badge.spriteUrl!}
                        alt={badge.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => handleImageError(badge.id)}
                      />
                    </div>
                  ) : (
                    <div
                      className={`p-2.5 rounded-xl border bg-card shadow-2xs ${badge.color} ${badge.borderColor}`}
                    >
                      <IconComp size={18} className="stroke-[2.2]" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-card text-foreground border-border shadow-2xs"
                  >
                    EARNED
                  </Badge>

                  {badge.xpReward && (
                    <span className="text-[9.5px] font-extrabold text-primary flex items-center gap-0.5">
                      <Zap size={9} className="fill-primary text-primary" />
                      +{badge.xpReward} XP
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-foreground">
                    {badge.name || badge.title}
                  </h4>
                  {badge.category && (
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-muted-foreground/80 bg-background/60 px-1.5 py-0.5 rounded border border-border/60">
                      {badge.category}
                    </span>
                  )}
                </div>

                <p className="text-[10.5px] text-muted-foreground leading-relaxed line-clamp-2">
                  {badge.description}
                </p>

                {badge.unlockCondition && (
                  <div className="pt-1.5 border-t border-border/50 text-[9.5px] text-muted-foreground/90 font-medium">
                    <span className="font-semibold text-foreground/80">Requirement:</span>{" "}
                    {badge.unlockCondition}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
