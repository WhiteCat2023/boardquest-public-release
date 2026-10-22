import { GraduationCap, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Student } from "@/features/students";
import StudentTableRow from "./StudentTableRow";
import { Button } from "@/components/ui/button";
import useRoleFlags from "@/hooks/useRoleFlags";
import { ColumnHeaderFilter } from "@/components/custom/table";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  onAssignGuidance?: (student: any) => void;
  onReachOut?: (student: any) => void;
  selectedIds?: string[];
  onToggleSelect?: (studentId: string) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  canSelect?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: React.ReactNode;
  selectedAcademicStanding?: string;
  onAcademicStandingChange?: (val: string) => void;
  selectedPaceStatus?: string;
  onPaceStatusChange?: (val: string) => void;
  selectedEngagement?: string;
  onEngagementChange?: (val: string) => void;
}

export default function StudentTable({
  students,
  isLoading,
  onAssignGuidance,
  onReachOut,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  canSelect = false,
  emptyTitle = "No Enrolled Students Registered",
  emptyDescription = "No students match the selected filter criteria.",
  pagination,
  selectedAcademicStanding,
  onAcademicStandingChange,
  selectedPaceStatus,
  onPaceStatusChange,
  selectedEngagement,
  onEngagementChange,
}: StudentTableProps) {
  const { isTeacher } = useRoleFlags();
  const displayStudents = students;
  const assignableCount = displayStudents.filter(
    (s) =>
      !s.activeGuidance &&
      !(s.guidanceAssignments || []).some(
        (g: any) =>
          String(g.status).toUpperCase() === "PENDING" ||
          String(g.status).toUpperCase() === "IN_PROGRESS",
      ),
  ).length;

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
      {isLoading ? (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                {canSelect && (
                  <th className="w-10 py-2.5 px-3 text-center">
                    <Skeleton className="size-3.5 rounded mx-auto" />
                  </th>
                )}
                <th className="py-2.5 px-4 font-extrabold">Student Profile</th>
                <th className="py-2.5 px-3 font-extrabold">Academic Standing</th>
                <th className="py-2.5 px-3 font-extrabold">Calendar Pace</th>
                <th className="py-2.5 px-3 font-extrabold">Engagement</th>
                <th className="py-2.5 px-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {Array.from({ length: 8 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-transparent">
                  {canSelect && (
                    <td className="w-10 py-2.5 px-3 text-center">
                      <Skeleton className="size-3.5 rounded mx-auto" />
                    </td>
                  )}
                  {/* Student Profile Skeleton */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <Skeleton className="h-3.5 w-32 rounded" />
                        <Skeleton className="h-2.5 w-44 rounded" />
                      </div>
                    </div>
                  </td>
                  {/* Academic Standing Skeleton */}
                  <td className="py-2.5 px-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </td>
                  {/* Calendar Pace Skeleton */}
                  <td className="py-2.5 px-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  {/* Engagement Skeleton */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="size-1.5 rounded-full" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                      <Skeleton className="h-2.5 w-20 rounded" />
                    </div>
                  </td>
                  {/* Actions Skeleton */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-7 w-20 rounded-lg" />
                      <Skeleton className="size-7 rounded-lg" />
                      <Skeleton className="size-7 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : students.length === 0 ? (
        <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
          <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
            <GraduationCap size={40} className="stroke-[1.5]" />
          </div>
          <div className="flex flex-col items-center gap-1 max-w-sm">
            <p className="font-bold text-foreground text-sm tracking-tight">
              {emptyTitle}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {emptyDescription}
            </p>
          </div>
          {!isTeacher && (
            <Link to="/student-management/create" className="mt-2">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl h-8.5 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Enroll New Student</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                {canSelect && (
                  <th className="w-10 py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!isAllSelected && assignableCount > 0}
                      disabled={assignableCount === 0}
                      onChange={onToggleSelectAll}
                      className="rounded border-border size-3.5 accent-primary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed align-middle"
                      aria-label="Select all unassigned students on page"
                      title={
                        assignableCount === 0
                          ? "All students on this page are already assigned for guidance"
                          : "Select all unassigned students on this page"
                      }
                    />
                  </th>
                )}
                <th className="py-2.5 px-4 font-extrabold">Student Profile</th>
                <th className="py-2.5 px-3 font-extrabold">
                  {onAcademicStandingChange && selectedAcademicStanding !== undefined ? (
                    <ColumnHeaderFilter
                      title="Academic Standing"
                      selectedValue={selectedAcademicStanding}
                      onSelect={onAcademicStandingChange}
                      options={[
                        { label: "🚨 Failing (<75%)", value: "FAILING" },
                        { label: "Passing (≥75%)", value: "PASSING" },
                        { label: "Untested", value: "UNTESTED" },
                      ]}
                      allOptionLabel="All Standings"
                    />
                  ) : (
                    "Academic Standing"
                  )}
                </th>
                <th className="py-2.5 px-3 font-extrabold">
                  {onPaceStatusChange && selectedPaceStatus !== undefined ? (
                    <ColumnHeaderFilter
                      title="Calendar Pace"
                      selectedValue={selectedPaceStatus}
                      onSelect={onPaceStatusChange}
                      options={[
                        { label: "On Track", value: "ON_TRACK" },
                        { label: "Behind Schedule", value: "BEHIND" },
                        { label: "Critical Lag", value: "CRITICAL" },
                        { label: "Unscheduled", value: "NOT_SCHEDULED" },
                      ]}
                      allOptionLabel="All Paces"
                    />
                  ) : (
                    "Calendar Pace"
                  )}
                </th>
                <th className="py-2.5 px-3 font-extrabold">
                  {onEngagementChange && selectedEngagement !== undefined ? (
                    <ColumnHeaderFilter
                      title="Engagement"
                      selectedValue={selectedEngagement}
                      onSelect={onEngagementChange}
                      options={[
                        { label: "Active (≤2d)", value: "ACTIVE" },
                        { label: "Low Cadence", value: "LOW_CADENCE" },
                        { label: "Dormant (5d+)", value: "DORMANT" },
                      ]}
                      allOptionLabel="All Activity"
                    />
                  ) : (
                    "Engagement"
                  )}
                </th>
                <th className="py-2.5 px-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayStudents.map((student, idx) => (
                <StudentTableRow
                  key={student.id || idx}
                  student={student}
                  onAssignGuidance={onAssignGuidance}
                  onReachOut={onReachOut}
                  canSelect={canSelect}
                  isSelected={selectedIds.includes(student.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination}
    </div>
  );
}
