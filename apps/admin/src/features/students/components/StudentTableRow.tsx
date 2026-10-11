import { Link } from "react-router-dom";
import { Eye, Zap, UserCheck } from "lucide-react";
import type { Student } from "@/features/students";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import useRoleFlags from "@/hooks/useRoleFlags";

interface StudentTableRowProps {
  student: Student & {
    avgAccuracy?: number;
    isFailing?: boolean;
    activeGuidance?: any;
  };
  onAssignGuidance?: (student: any) => void;
  canSelect?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function StudentTableRow({
  student,
  onAssignGuidance,
  canSelect = false,
  isSelected = false,
  onToggleSelect,
}: StudentTableRowProps) {
  const { isAdminOrSuperAdmin, isTeamLead } = useRoleFlags();

  const activeGuidance =
    student.activeGuidance ||
    (student.guidanceAssignments || []).find(
      (g: any) =>
        String(g.status).toUpperCase() === "PENDING" ||
        String(g.status).toUpperCase() === "IN_PROGRESS",
    );
  const isAlreadyAssigned = Boolean(activeGuidance);

  const canAssignGuidance =
    (isAdminOrSuperAdmin || isTeamLead) &&
    !isAlreadyAssigned &&
    !!onAssignGuidance;

  return (
    <TableRow
      className={`hover:bg-accent/40 transition-colors group border-b border-border ${
        isSelected ? "bg-primary/5" : ""
      }`}
    >
      {canSelect && (
        <TableCell className="w-10 py-2 px-3 text-center">
          <input
            type="checkbox"
            checked={!!isSelected}
            disabled={isAlreadyAssigned}
            onChange={() => onToggleSelect?.(student.id)}
            className="rounded border-border size-3.5 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed align-middle"
            aria-label={`Select ${student.name}`}
            title={
              isAlreadyAssigned
                ? `Student is already assigned to ${activeGuidance?.advisor?.name || "an advisor"} for guidance`
                : `Select ${student.name}`
            }
          />
        </TableCell>
      )}
      {/* Student Profile */}
      <TableCell className="py-2 px-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[140px]">
                {student.name}
              </span>
              {student.isFailing && (
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 rounded-full font-bold"
                >
                  At Risk
                </Badge>
              )}
              {activeGuidance && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold"
                  title={
                    activeGuidance.advisor?.name
                      ? `Assigned to ${activeGuidance.advisor.name} (${activeGuidance.status})`
                      : "Assigned for academic guidance"
                  }
                >
                  Guided
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
              {student.email}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Calendar Pace */}
      <TableCell className="py-2 px-3">
        {student.calendarPace?.status === "ON_TRACK" && (
          <div className="flex flex-col gap-0.5">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] font-bold px-2 py-0.2 rounded-full w-fit"
            >
              On Track
            </Badge>
            {student.calendarPace.activeSubject && (
              <span className="text-[9.5px] text-muted-foreground truncate max-w-[130px]" title={student.calendarPace.activeSubject}>
                {student.calendarPace.activeSubject.split(" ")[0]} ({student.calendarPace.actualPercent}%)
              </span>
            )}
          </div>
        )}
        {student.calendarPace?.status === "BEHIND" && (
          <div className="flex flex-col gap-0.5">
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold px-2 py-0.2 rounded-full w-fit"
            >
              Behind ({student.calendarPace.lagPercent}%)
            </Badge>
            {student.calendarPace.activeSubject && (
              <span className="text-[9.5px] text-amber-600/80 dark:text-amber-400/80 truncate max-w-[130px]" title={student.calendarPace.activeSubject}>
                {student.calendarPace.activeSubject.split(" ")[0]}: {student.calendarPace.actualPercent}% / {student.calendarPace.expectedPercent}% exp
              </span>
            )}
          </div>
        )}
        {student.calendarPace?.status === "CRITICAL" && (
          <div className="flex flex-col gap-0.5">
            <Badge
              variant="destructive"
              className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[9px] font-bold px-2 py-0.2 rounded-full w-fit"
            >
              Critical Lag ({student.calendarPace.lagPercent}%)
            </Badge>
            {student.calendarPace.activeSubject && (
              <span className="text-[9.5px] text-rose-600/80 dark:text-rose-400/80 truncate max-w-[130px]" title={student.calendarPace.activeSubject}>
                Overdue / Lagging in {student.calendarPace.activeSubject.split(" ")[0]}
              </span>
            )}
          </div>
        )}
        {(!student.calendarPace || student.calendarPace.status === "NOT_SCHEDULED") && (
          <span className="text-[10px] text-muted-foreground/60 italic font-medium">
            Unscheduled
          </span>
        )}
      </TableCell>

      {/* Engagement Cadence */}
      <TableCell className="py-2 px-3">
        {student.engagement?.status === "ACTIVE" && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10.5px] font-bold text-foreground">
                {student.engagement.daysSinceLastActive === 0 ? "Active Today" : `${student.engagement.daysSinceLastActive}d ago`}
              </span>
            </div>
            <span className="text-[9.5px] text-muted-foreground">
              {student.engagement.weeklyAttemptCount} drills this wk
            </span>
          </div>
        )}
        {student.engagement?.status === "LOW_CADENCE" && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                {student.engagement.daysSinceLastActive}d inactive
              </span>
            </div>
            <span className="text-[9.5px] text-muted-foreground">
              Low recent cadence
            </span>
          </div>
        )}
        {student.engagement?.status === "DORMANT" && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span className="text-[10.5px] font-bold text-rose-600 dark:text-rose-400">
                Dormant ({student.engagement.daysSinceLastActive}d+)
              </span>
            </div>
            <span className="text-[9.5px] text-rose-500/80">
              Zero study activity
            </span>
          </div>
        )}
        {!student.engagement && (
          <span className="text-[10px] text-muted-foreground/60">No activity</span>
        )}
      </TableCell>

      {/* Progression Level */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold gap-1 px-2 py-0.5 rounded-full inline-flex items-center"
        >
          <Zap size={10} className="fill-amber-500 text-amber-500" />
          Lvl {student.level || 1}
        </Badge>
      </TableCell>

      {/* EXP */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <span className="text-[11px] font-bold text-foreground/80">
          {(student.xp || 0).toLocaleString()} XP
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-2 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canAssignGuidance && (
            <button
              type="button"
              onClick={() => onAssignGuidance(student)}
              className="hidden sm:inline-flex h-7 px-2 text-[10.5px] font-bold rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer items-center gap-1"
              title="Assign Guidance Advisor"
            >
              <UserCheck size={12} />
              Assign Guidance
            </button>
          )}
          <Link to={`/student-management/${student.id}`}>
            <button
              className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
              title="View Student Profile & Performance"
            >
              <Eye size={14} />
            </button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
