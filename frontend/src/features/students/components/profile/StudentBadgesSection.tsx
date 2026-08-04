import { Badge } from "@/components/ui/badge";
import type { StudentBadge } from "@/utils/badgeUtils";

interface StudentBadgesSectionProps {
  badges: StudentBadge[];
}

export function StudentBadgesSection({ badges }: StudentBadgesSectionProps) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3">
        Gamification Badges Showcase
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const IconComp = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                badge.unlocked
                  ? `${badge.bgColor} ${badge.borderColor} shadow-xs hover:-translate-y-0.5`
                  : "bg-muted/40 border-border opacity-50 grayscale"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl border bg-card shadow-2xs ${badge.color} ${badge.borderColor}`}>
                  <IconComp size={18} className="stroke-[2.2]" />
                </div>

                <Badge
                  variant="outline"
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? "bg-card text-foreground border-border"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </div>

              <div>
                <h4 className={`text-xs font-bold ${badge.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                  {badge.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
