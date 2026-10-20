import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserX,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/features/students/api/useStudent";
import type { Student } from "@/features/students/types/types";

interface InactiveStudentsWatchCardProps {
  onInterveneClick?: (student: Student) => void;
  limit?: number;
}

export function InactiveStudentsWatchCard({
  onInterveneClick,
  limit = 4,
}: InactiveStudentsWatchCardProps) {
  const [minDaysFilter, setMinDaysFilter] = useState<number>(0);

  const { data, isLoading } = useStudents({
    engagement: "DORMANT",
    take: 20,
  });

  const students = data?.students || [];

  // Filter by minDays if selected, then sort descending by daysSinceLastActive
  const filteredStudents = students
    .filter((s) => {
      const days = s.engagement?.daysSinceLastActive ?? 0;
      return days >= minDaysFilter;
    })
    .sort((a, b) => {
      const daysA = a.engagement?.daysSinceLastActive ?? 0;
      const daysB = b.engagement?.daysSinceLastActive ?? 0;
      return daysB - daysA;
    });

  const displayStudents = filteredStudents.slice(0, limit);
  const dormantCount = students.length;

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <UserX size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Dormant Students
              {dormantCount > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-bold px-1.5 py-0"
                >
                  {dormantCount} Inactive
                </Badge>
              ) : null}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Students with no recent drill attempts or review activity
            </p>
          </div>
        </div>

        <Link
          to="/student-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          Roster <ArrowRight size={12} />
        </Link>
      </div>

      {/* Filter Tabs / Quick Chips */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-medium">Inactive:</span>
        {[
          { label: "All (>3d)", value: 0 },
          { label: "7+ Days", value: 7 },
          { label: "14+ Days", value: 14 },
        ].map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setMinDaysFilter(chip.value)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
              minDaysFilter === chip.value
                ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
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
              <Skeleton className="h-2 w-32 rounded" />
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
            No Dormant Students Found!
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[240px]">
            {minDaysFilter > 0
              ? `No students have been inactive for more than ${minDaysFilter} days.`
              : "All enrolled students are actively engaging with board exam review modules."}
          </p>
        </div>
      ) : (
        /* List of Dormant Students */
        <div className="flex flex-col gap-2">
          {displayStudents.map((student) => {
            const daysSince = student.engagement?.daysSinceLastActive ?? 0;
            const isSevere = daysSince >= 14;
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
                      <AvatarFallback className="text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight">
                        {student.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-bold px-1.5 py-0 rounded-md ${
                        isSevere
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        <Clock size={9} />
                        {daysSince > 0 ? `${daysSince}d inactive` : "No activity"}
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
                            title={`Assign guidance & outreach to ${student.name}`}
                          >
                            <UserCheck size={12} />
                          </Button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Subtext info: streak & last active timestamp */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Flame size={10} className="text-muted-foreground/60" />
                    Streak: {student.streak || 0}d
                  </span>
                  <span>
                    {student.engagement?.lastActiveAt
                      ? `Last active: ${new Date(student.engagement.lastActiveAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}`
                      : "Never logged drill attempt"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default InactiveStudentsWatchCard;
