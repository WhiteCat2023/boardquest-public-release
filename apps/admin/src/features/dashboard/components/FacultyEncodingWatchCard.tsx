import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Hourglass,
  Clock,
  CalendarClock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEncodingTrackerOverview } from "@/features/question-bank/api/useEncodingTracker";
import type { FacultyTrackItem } from "@/features/question-bank/types/encodingTracker.types";

interface FacultyEncodingWatchCardProps {
  onNudgeClick?: (item: FacultyTrackItem) => void;
  limit?: number;
}

export function FacultyEncodingWatchCard({
  onNudgeClick,
  limit = 4,
}: FacultyEncodingWatchCardProps) {
  const { data, isLoading } = useEncodingTrackerOverview({
    status: "INCOMPLETE",
  });

  const rawItems = data?.items || [];
  // Sort with OVERDUE first, then by ascending progressPercentage
  const sortedItems = [...rawItems].sort((a, b) => {
    if (a.status === "OVERDUE" && b.status !== "OVERDUE") return -1;
    if (b.status === "OVERDUE" && a.status !== "OVERDUE") return 1;
    return a.progressPercentage - b.progressPercentage;
  });

  const displayItems = sortedItems.slice(0, limit);
  const overdueCount = rawItems.filter((i) => i.status === "OVERDUE").length;

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ClipboardCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Faculty Quota Watchlist
            </h2>
          </div>
        </div>

        <Link
          to="/question-bank/tracker"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          Tracker <ArrowRight size={12} />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5 py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-1.5 w-full rounded" />
            </div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        /* Empty State */
        <div className="py-7 text-center flex flex-col items-center justify-center gap-1.5">
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-xs font-bold text-foreground">
            All Faculty Targets Completed!
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">
            Every assigned teacher has met their question encoding quota for this academic year.
          </p>
        </div>
      ) : (
        /* List of Faculty Behind Target */
        <div className="flex flex-col gap-2">
          {displayItems.map((item) => {
            const isOverdue = item.status === "OVERDUE";
            const isNotStarted = item.status === "NOT_STARTED";
            const teacherInitials = (item.teacher.name || "T")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            // Days until deadline
            const daysLeft = item.deadline
              ? Math.ceil(
                  (new Date(item.deadline).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )
              : null;
            const noQuotaSet = item.targetCount === 0;

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border transition-colors flex flex-col gap-2 ${
                  isOverdue
                    ? "border-rose-500/30 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]"
                    : "border-border/70 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 border border-border shrink-0">
                      <AvatarImage src={item.teacher.avatarUrl || undefined} />
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {teacherInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {item.teacher.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {item.subject.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {/* Days-to-deadline chip */}
                    {daysLeft !== null && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${
                          daysLeft <= 0
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : daysLeft <= 3
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border/60"
                        }`}
                      >
                        <CalendarClock size={9} />
                        {daysLeft <= 0 ? "Past due" : `${daysLeft}d left`}
                      </span>
                    )}

                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-bold px-1.5 py-0 rounded-md ${
                        isOverdue
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : isNotStarted
                          ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {isOverdue ? (
                        <span className="flex items-center gap-0.5">
                          <AlertTriangle size={9} /> Overdue
                        </span>
                      ) : isNotStarted ? (
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} /> Not Started
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Hourglass size={9} /> In Progress
                        </span>
                      )}
                    </Badge>

                    {onNudgeClick && !noQuotaSet && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onNudgeClick(item)}
                        className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                        title={`Send quick nudge reminder to ${item.teacher.name}`}
                      >
                        <Bell size={12} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Strip */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">
                      {item.encodedCount} / {item.targetCount} encoded
                    </span>
                    <span
                      className={`font-bold ${
                        isOverdue ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      }`}
                    >
                      {item.remainingCount} left ({item.progressPercentage}%)
                    </span>
                  </div>
                  <Progress
                    value={item.progressPercentage}
                    className={`h-1.5 ${
                      isOverdue
                        ? "[&>div]:bg-rose-500"
                        : "[&>div]:bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default FacultyEncodingWatchCard;
