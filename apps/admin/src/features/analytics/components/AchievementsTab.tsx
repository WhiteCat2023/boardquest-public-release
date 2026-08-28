import { Award, Flame, Sparkles, Zap, Target, Lock, Crown, Gem, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult } from "../types/types";

interface AchievementsTabProps {
  report: StudentAnalyticsResult;
}

export function AchievementsTab({ report }: AchievementsTabProps) {
  const achievementsList = Array.isArray(report?.achievements) ? report.achievements : [];
  const unlockedCount = achievementsList.filter(a => a?.unlocked).length;

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
      <Card className="border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3.5 sm:gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/50 pb-3 min-w-0">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase truncate">
              <Award size={15} className="text-amber-500 shrink-0" />
              Student Badges & Accomplishments
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Gamified milestones earned through diagnostic drills and streaks.
            </p>
          </div>

          <Badge variant="outline" className="text-[10px] font-extrabold border-amber-500/30 text-amber-600 bg-amber-500/10 self-start sm:self-auto px-2 py-0.5 shrink-0">
            {unlockedCount} / {achievementsList.length} Unlocked
          </Badge>
        </div>

        {/* Achievements Grid */}
        {achievementsList.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground italic">
            No achievement records available for this student.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 min-w-0">
            {achievementsList.map((ach) => (
              <div 
                key={ach.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 min-w-0 ${
                  ach.unlocked 
                    ? "bg-gradient-to-br from-card to-amber-500/10 border-amber-500/30 shadow-2xs" 
                    : "bg-muted/20 border-border/60 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      ach.unlocked ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-muted text-muted-foreground"
                    }`}>
                      {ach.badge === "flame" || ach.badge === "fire" ? <Flame size={16} /> 
                        : ach.badge === "award" || ach.badge === "gold" ? <Award size={16} /> 
                        : ach.badge === "sparkles" || ach.badge === "silver" ? <Sparkles size={16} /> 
                        : ach.badge === "zap" || ach.badge === "lightning" ? <Zap size={16} /> 
                        : ach.badge === "crown" ? <Crown size={16} /> 
                        : ach.badge === "diamond" ? <Gem size={16} /> 
                        : ach.badge === "bronze" ? <Medal size={16} /> 
                        : <Target size={16} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs font-bold text-foreground leading-snug truncate">{ach.title}</h4>
                      <span className="text-[8px] font-extrabold text-muted-foreground uppercase truncate">{ach.category}</span>
                    </div>
                  </div>

                  {ach.unlocked ? (
                    <Badge className="bg-amber-500 text-white text-[8px] font-extrabold shrink-0 px-1.5 py-0">
                      Unlocked
                    </Badge>
                  ) : (
                    <Lock size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{ach.description}</p>

                <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[9px] font-bold">
                  <span className="text-amber-600 dark:text-amber-400">+{ach.xp} XP</span>
                  {ach.unlockedAt ? (
                    <span className="text-muted-foreground">{ach.unlockedAt}</span>
                  ) : (
                    <span className="text-muted-foreground">{ach.progress || 0}% Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

