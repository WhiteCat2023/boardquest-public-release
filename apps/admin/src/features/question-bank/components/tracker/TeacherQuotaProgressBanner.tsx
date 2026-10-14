import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Hourglass,
  Layers,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useMyEncodingProgress } from "../../api/useEncodingTracker";

export function TeacherQuotaProgressBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading } = useMyEncodingProgress();

  if (isLoading || !data || data.goals.length === 0) {
    return null;
  }

  const { overall, goals, schoolYear } = data;
  const isGoalMet = overall.remainingCount === 0;

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/70 p-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Main Banner Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-foreground">
                  Question Authoring Goal
                </span>
                {isGoalMet ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Target Completed (Locked)
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {overall.remainingCount} questions remaining
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                You have authored{" "}
                <span className="font-semibold text-foreground">
                  {overall.totalEncoded}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {overall.totalTarget}
                </span>{" "}
                assigned questions across {goals.length} subject(s).
                {isGoalMet && (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    New question creation is locked.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Progress Bar & Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end gap-1 w-32 sm:w-40">
              <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground font-medium">
                <span>Overall Progress</span>
                <span className="font-semibold text-foreground">
                  {overall.progressPercentage}%
                </span>
              </div>
              <Progress
                value={overall.progressPercentage}
                className="h-1.5 w-full [&>div]:bg-primary"
              />
            </div>

            {goals.length > 1 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium p-1"
              >
                <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Breakdown per Subject */}
        {isExpanded && goals.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-border/40 mt-1">
            {goals.map((g) => {
              const deadline = g.deadline ? new Date(g.deadline) : null;
              return (
                <div
                  key={g.subject.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-card/60 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[130px]">
                      {g.subject.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {g.encodedCount} / {g.targetCount}
                    </span>
                  </div>

                  <Progress
                    value={g.progressPercentage}
                    className={`h-1.5 ${
                      g.status === "COMPLETED"
                        ? "[&>div]:bg-emerald-500"
                        : g.status === "OVERDUE"
                        ? "[&>div]:bg-rose-500"
                        : "[&>div]:bg-amber-500"
                    }`}
                  />

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {g.remainingCount > 0
                        ? `${g.remainingCount} left`
                        : "✓ Complete"}
                    </span>
                    {deadline && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Calendar className="w-2.5 h-2.5" />
                        Due {deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
