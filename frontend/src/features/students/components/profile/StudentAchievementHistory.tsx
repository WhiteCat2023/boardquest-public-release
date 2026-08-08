import { useState } from "react";
import { Sparkles, Award, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Achievement } from "../../types/types";

interface StudentAchievementHistoryProps {
  achievements?: Achievement[];
  studentName: string;
  formatDate: (dateStr?: string) => string;
}

export function StudentAchievementHistory({
  achievements = [],
  studentName,
  formatDate,
}: StudentAchievementHistoryProps) {
  const [achievementPage, setAchievementPage] = useState(1);
  const ACHIEVEMENTS_PER_PAGE = 10;

  const totalAchievements = achievements.length;
  const totalAchievementPages = Math.ceil(totalAchievements / ACHIEVEMENTS_PER_PAGE) || 1;

  const paginatedAchievements = achievements.slice(
    (achievementPage - 1) * ACHIEVEMENTS_PER_PAGE,
    achievementPage * ACHIEVEMENTS_PER_PAGE
  );

  return (
    <div className="pt-6 border-t border-border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500" size={18} />
          <h3 className="text-sm font-bold text-foreground">
            Earned Student Achievement History
          </h3>
        </div>
        <Badge variant="secondary" className="text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          {totalAchievements} Recorded
        </Badge>
      </div>

      {paginatedAchievements.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedAchievements.map((ach) => (
              <div
                key={ach.id || ach.timestamp}
                className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 transition-all flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-snug">
                        {ach.task}
                      </h4>
                      {ach.subject && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {ach.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                  >
                    <Zap size={10} className="fill-amber-500 text-amber-500" />
                    +{ach.xp} XP
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[10px]">
                  <div className="flex items-center gap-2">
                    {ach.type && (
                      <Badge variant="outline" className="text-[9px] font-extrabold uppercase px-1.5 py-0 bg-card border-border">
                        {ach.type}
                      </Badge>
                    )}
                    {ach.accuracy !== undefined && ach.accuracy !== null && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {ach.accuracy}% Accuracy
                      </span>
                    )}
                    {ach.confidenceLevel && (
                      <span className="font-medium text-muted-foreground">
                        &bull; {ach.confidenceLevel}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {formatDate(ach.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Bar */}
          {totalAchievementPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-medium">
                Showing{" "}
                <strong className="text-foreground">
                  {(achievementPage - 1) * ACHIEVEMENTS_PER_PAGE + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground">
                  {Math.min(achievementPage * ACHIEVEMENTS_PER_PAGE, totalAchievements)}
                </strong>{" "}
                of <strong className="text-foreground">{totalAchievements}</strong> achievements
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={achievementPage === 1}
                  onClick={() => setAchievementPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 text-xs gap-1 rounded-xl px-3"
                >
                  <ChevronLeft size={14} />
                  Previous
                </Button>

                <div className="flex items-center gap-1 text-xs font-bold px-2">
                  <span>{achievementPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalAchievementPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={achievementPage >= totalAchievementPages}
                  onClick={() => setAchievementPage((prev) => Math.min(totalAchievementPages, prev + 1))}
                  className="h-8 text-xs gap-1 rounded-xl px-3"
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-semibold">
            No individual achievement records logged yet for this student.
          </p>
          <p className="text-[10px] text-muted-foreground/75 mt-1">
            Achievements are automatically recorded as {studentName} completes evaluation quests and board licensure exams.
          </p>
        </div>
      )}
    </div>
  );
}
