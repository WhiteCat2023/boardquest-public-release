import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  TrendingDown,
  UserCheck,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/features/students/api/useStudent";
import type { Student } from "@/features/students/types/types";

interface CalendarPaceLagCardProps {
  onInterveneClick?: (student: Student) => void;
  limit?: number;
}

export function CalendarPaceLagCard({
  onInterveneClick,
  limit = 4,
}: CalendarPaceLagCardProps) {
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);

  const { data, isLoading } = useStudents({
    paceStatus: "BEHIND",
    take: 20,
  });

  const students = data?.students || [];

  // Filter and sort by severity of lag (CRITICAL first, then largest negative lagPercent)
  const filteredStudents = students
    .filter((s) => {
      if (!criticalOnly) return true;
      return s.calendarPace?.status === "CRITICAL" || (s.calendarPace?.lagPercent ?? 0) <= -30;
    })
    .sort((a, b) => {
      const paceA = a.calendarPace;
      const paceB = b.calendarPace;
      if (paceA?.status === "CRITICAL" && paceB?.status !== "CRITICAL") return -1;
      if (paceB?.status === "CRITICAL" && paceA?.status !== "CRITICAL") return 1;
      return (paceA?.lagPercent ?? 0) - (paceB?.lagPercent ?? 0);
    });

  const displayStudents = filteredStudents.slice(0, limit);
  const criticalCount = students.filter(
    (s) => s.calendarPace?.status === "CRITICAL" || (s.calendarPace?.lagPercent ?? 0) <= -30
  ).length;

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <CalendarClock size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Milestone Pacing Alerts
              {students.length > 0 ? (
                <Badge
                  variant="outline"
                  className={
                    criticalCount > 0
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold px-1.5 py-0"
                      : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] font-bold px-1.5 py-0"
                  }
                >
                  {criticalCount > 0 ? `${criticalCount} Critical` : `${students.length} Behind`}
                </Badge>
              ) : null}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Students falling behind review calendar pace & syllabus targets
            </p>
          </div>
        </div>

        <Link
          to="/students"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          Roster <ArrowRight size={12} />
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-medium">Filter:</span>
        <button
          type="button"
          onClick={() => setCriticalOnly(false)}
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
            !criticalOnly
              ? "bg-primary text-primary-foreground font-bold shadow-2xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Behind ({students.length})
        </button>
        <button
          type="button"
          onClick={() => setCriticalOnly(true)}
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
            criticalOnly
              ? "bg-primary text-primary-foreground font-bold shadow-2xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Critical Only ({criticalCount})
        </button>
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
      ) : displayStudents.length === 0 ? (
        /* Empty State */
        <div className="py-7 text-center flex flex-col items-center justify-center gap-1.5">
          <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-xs font-bold text-foreground">
            All Students on Track!
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">
            {criticalOnly
              ? "No students have critical pacing lags at this time."
              : "Every enrolled student is on pace with their syllabus target dates."}
          </p>
        </div>
      ) : (
        /* List of Lagging Students */
        <div className="flex flex-col gap-2">
          {displayStudents.map((student) => {
            const pace = student.calendarPace;
            const lag = pace?.lagPercent ?? 0;
            const actual = pace?.actualPercent ?? 0;
            const expected = pace?.expectedPercent ?? 0;
            const isCritical = pace?.status === "CRITICAL" || lag <= -30;
            const targetSubject =
              pace?.activeSubject || student.userSettings?.focusSubject || "Study Plan";
            const initials = (student.name || "S")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={student.id}
                className="p-2.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 border border-border shrink-0">
                      <AvatarFallback className="text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {student.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-medium flex items-center gap-1">
                        <Target size={9} className="text-muted-foreground/70" />
                        {targetSubject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-bold px-1.5 py-0 rounded-md ${
                        isCritical
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        {isCritical ? <AlertOctagon size={9} /> : <TrendingDown size={9} />}
                        {lag !== 0 ? `${lag}% Lag` : "Behind"}
                      </span>
                    </Badge>

                    {(() => {
                      const hasGuidance =
                        student.activeGuidance ||
                        (student.guidanceAssignments || []).some(
                          (g: any) =>
                            String(g.status).toUpperCase() === "PENDING" ||
                            String(g.status).toUpperCase() === "IN_PROGRESS",
                        );
                      if (hasGuidance) {
                        return (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold"
                            title="Assigned for guidance"
                          >
                            Guided
                          </Badge>
                        );
                      }
                      if (onInterveneClick) {
                        return (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onInterveneClick(student)}
                            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                            title={`Assign pacing guidance & catch-up plan to ${student.name}`}
                          >
                            <UserCheck size={12} />
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Progress Comparison */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">
                      Actual: <strong className="text-foreground">{actual}%</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Expected: <strong className="text-primary font-bold">{expected}%</strong>
                    </span>
                  </div>

                  {/* Dual Bar: Outer track shows expected marker, inner bar shows actual */}
                  <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
                    {/* Expected ghost indicator */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-primary/20 transition-all rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, expected))}%` }}
                    />
                    {/* Actual progress */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all rounded-full ${
                        isCritical ? "bg-rose-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, actual))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default CalendarPaceLagCard;
