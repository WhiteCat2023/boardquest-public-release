import { BookOpen, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SubjectMetricItem } from "../../types/types";

interface StudentDisciplineProgressCardProps {
  metrics: SubjectMetricItem[];
  onOpenScorecard?: () => void;
}

export function StudentDisciplineProgressCard({
  metrics = [],
  onOpenScorecard,
}: StudentDisciplineProgressCardProps) {
  const items = Array.isArray(metrics) ? metrics : [];

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen size={14} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Discipline Progress</h3>
        </div>
        <span className="text-[10.5px] font-semibold text-muted-foreground">
          {items.length} Licensure Domains
        </span>
      </div>

      {/* Progress Rows List */}
      <div className="space-y-3 sm:space-y-3.5">
        {items.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground italic">
            No discipline metrics available for this candidate.
          </div>
        ) : (
          items.map((subj, idx) => {
            const proficiency = subj.proficiency ?? 0;
            const completion = subj.completion ?? 0;
            const status =
              subj.status ||
              subj.masteryStatus ||
              (proficiency >= 80
                ? "Mastered"
                : proficiency >= 65
                ? "Proficient"
                : proficiency >= 35
                ? "In Training"
                : proficiency > 0
                ? "Needs Focus"
                : "Not Started");

            const isMastered = status === "Mastered" || proficiency >= 80;
            const isProficient = status === "Proficient" || (proficiency >= 65 && !isMastered);
            const isNeedsFocus = status === "Needs Focus" || (proficiency > 0 && proficiency < 60);
            const isNotStarted = status === "Not Started" || (proficiency === 0 && completion === 0);

            return (
              <div
                key={subj.subject || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-2.5 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60"
              >
                {/* Subject Title & D Number */}
                <div className="w-full sm:w-56 shrink-0 flex items-center gap-2">
                  <span className="text-[10.5px] font-extrabold text-muted-foreground shrink-0 w-6">
                    D{idx + 1}:
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground truncate block" title={subj.subject}>
                      {subj.subject}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Syllabus: {completion}% &bull; {subj.points || 0} Pts
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Percentage (Proficiency) */}
                <div className="flex-1 flex items-center gap-3 w-full">
                  <div className="flex-1">
                    <Progress
                      value={proficiency}
                      className={`h-2 rounded-full ${
                        isMastered
                          ? "[&>div]:bg-emerald-500"
                          : isProficient
                          ? "[&>div]:bg-blue-500"
                          : isNeedsFocus
                          ? "[&>div]:bg-rose-500"
                          : isNotStarted
                          ? "[&>div]:bg-muted"
                          : "[&>div]:bg-amber-500"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-foreground w-12 text-right shrink-0 font-mono">
                    {proficiency}%
                  </span>
                </div>

                {/* Status Badge & Evidence Link */}
                <div className="flex items-center gap-2.5 shrink-0 justify-end min-w-[150px]">
                  {isMastered ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <CheckCircle2 size={10} />
                      Mastered
                    </Badge>
                  ) : isProficient ? (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      Proficient
                    </Badge>
                  ) : isNeedsFocus ? (
                    <Badge
                      variant="outline"
                      className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <AlertTriangle size={10} />
                      Needs Focus
                    </Badge>
                  ) : isNotStarted ? (
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-border text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      Not Started
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      In Training
                    </Badge>
                  )}

                  {onOpenScorecard && (
                    <button
                      type="button"
                      onClick={onOpenScorecard}
                      className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>See Evidence</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
