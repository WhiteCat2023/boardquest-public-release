import { Link } from "react-router-dom";
import { Eye, UserCheck, AlertTriangle, CheckCircle2, Mail } from "lucide-react";
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
  onReachOut?: (student: any) => void;
  canSelect?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function StudentTableRow({
  student,
  onAssignGuidance,
  onReachOut,
  canSelect = false,
  isSelected = false,
  onToggleSelect,
}: StudentTableRowProps) {
  const { isAdminOrSuperAdmin, isTeamLead, currentUser, isTeacher } = useRoleFlags();

  const activeGuidance =
    student.activeGuidance ||
    (student.guidanceAssignments || []).find(
      (g: any) =>
        String(g.status).toUpperCase() === "PENDING" ||
        String(g.status).toUpperCase() === "IN_PROGRESS",
    );
  const isAlreadyAssigned = Boolean(activeGuidance);

  const isMyAdvisee = Boolean(
    isTeacher &&
      currentUser?.id &&
      (activeGuidance?.advisorId === currentUser.id ||
        activeGuidance?.advisor?.id === currentUser.id)
  );

  const contactRecency = (() => {
    if (!student.lastContactedAt) return null;
    const diffDays = Math.floor(
      (new Date().getTime() - new Date(student.lastContactedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0)
      return {
        label: "Contacted today",
        color: "text-emerald-600 dark:text-emerald-400 font-semibold",
      };
    if (diffDays === 1)
      return {
        label: "1d ago",
        color: "text-emerald-600 dark:text-emerald-400 font-medium",
      };
    if (diffDays < 7)
      return {
        label: `${diffDays}d ago`,
        color: "text-emerald-600 dark:text-emerald-400 font-medium",
      };
    if (diffDays < 14)
      return {
        label: `${diffDays}d ago`,
        color: "text-amber-600 dark:text-amber-400 font-medium",
      };
    return {
      label: `Overdue (${diffDays}d)`,
      color: "text-rose-600 dark:text-rose-400 font-bold",
    };
  })();

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
              {isMyAdvisee ? (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 rounded-full bg-primary/15 text-primary border-primary/30 font-bold"
                  title="Your assigned advisee for academic guidance"
                >
                  My Advisee
                </Badge>
              ) : activeGuidance ? (
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
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium truncate max-w-[160px]">
              <span className="truncate">{student.email}</span>
              {contactRecency ? (
                <>
                  <span className="opacity-40">&bull;</span>
                  <span
                    className={`text-[9px] shrink-0 ${contactRecency.color}`}
                    title={`Last advisor email: ${new Date(student.lastContactedAt!).toLocaleDateString()}`}
                  >
                    {contactRecency.label}
                  </span>
                </>
              ) : activeGuidance ? (
                <>
                  <span className="opacity-40">&bull;</span>
                  <span
                    className="text-[9px] shrink-0 text-amber-600 dark:text-amber-400 font-semibold"
                    title="Student is assigned to guidance but has not received an outreach message yet"
                  >
                    Needs outreach
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Academic Standing */}
      <TableCell className="py-2 px-3">
        {student.academicStanding === "FAILING" || student.isFailing ? (
          <Badge
            variant="destructive"
            className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-default"
            title={
              student.failingSubjects && student.failingSubjects.length > 0
                ? `Failing benchmark (<75%) · Weak/unattempted subjects: ${student.failingSubjects.join(", ")}`
                : `Failing benchmark (<75%) · Discipline average: ${student.avgAccuracy ?? 0}%`
            }
          >
            <AlertTriangle size={10} className="shrink-0" />
            Failing · {student.avgAccuracy ?? 0}%
          </Badge>
        ) : student.academicStanding === "PASSING" ? (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-default"
            title={`Passing benchmark (≥75%) · Overall discipline average: ${student.avgAccuracy ?? 0}% across all licensure domains`}
          >
            <CheckCircle2 size={10} className="shrink-0" />
            Passing · {student.avgAccuracy ?? 0}%
          </Badge>
        ) : (
          <span
            className="text-[10px] text-muted-foreground/60 italic font-medium cursor-default"
            title="No subject activity recorded yet"
          >
            Untested
          </span>
        )}
      </TableCell>

      {/* Calendar Pace */}
      <TableCell className="py-2 px-3">
        {student.calendarPace?.status === "ON_TRACK" && (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full cursor-default"
            title={
              student.calendarPace.activeSubject
                ? `${student.calendarPace.activeSubject}: ${student.calendarPace.actualPercent}% completed`
                : "On track with target study calendar"
            }
          >
            On Track
          </Badge>
        )}
        {student.calendarPace?.status === "BEHIND" && (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full cursor-default"
            title={
              student.calendarPace.activeSubject
                ? `${student.calendarPace.activeSubject}: ${student.calendarPace.actualPercent}% actual vs ${student.calendarPace.expectedPercent}% expected`
                : `Behind schedule by ${student.calendarPace.lagPercent}%`
            }
          >
            Behind ({student.calendarPace.lagPercent}%)
          </Badge>
        )}
        {student.calendarPace?.status === "CRITICAL" && (
          <Badge
            variant="destructive"
            className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[9.5px] font-bold px-2 py-0.5 rounded-full cursor-default"
            title={
              student.calendarPace.activeSubject
                ? `Overdue in ${student.calendarPace.activeSubject} (Lagging by ${student.calendarPace.lagPercent}%)`
                : `Critical schedule lag of ${student.calendarPace.lagPercent}%`
            }
          >
            Critical Lag ({student.calendarPace.lagPercent}%)
          </Badge>
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

      {/* Actions */}
      <TableCell className="py-2 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canAssignGuidance && (
            <button
              type="button"
              onClick={() => onAssignGuidance(student)}
              className={
                student.isFailing
                  ? "hidden sm:inline-flex h-7 px-2.5 text-[10.5px] font-bold rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 transition-all cursor-pointer items-center gap-1 shadow-xs"
                  : "hidden sm:inline-flex h-7 px-2 text-[10.5px] font-bold rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer items-center gap-1"
              }
              title={student.isFailing ? "Assign Immediate Academic Intervention" : "Assign Guidance Advisor"}
            >
              <UserCheck size={12} className={student.isFailing ? "text-rose-500" : ""} />
              {student.isFailing ? "Intervene" : "Assign Guidance"}
            </button>
          )}
          {onReachOut && (
            <button
              type="button"
              onClick={() => onReachOut(student)}
              className="size-7 p-1 text-muted-foreground hover:text-primary rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
              title={
                student.lastContactedAt
                  ? `Reach out to ${student.name} via email (Last: ${contactRecency?.label || "previously"})`
                  : activeGuidance || student.isFailing
                  ? `Reach out to ${student.name} via email (Advise / Check-in)`
                  : `Reach out to ${student.name} via email`
              }
            >
              <Mail
                size={14}
                className={
                  (student.isFailing || activeGuidance) && !student.lastContactedAt
                    ? "text-primary"
                    : ""
                }
              />
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
