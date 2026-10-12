import { GraduationCap, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Student } from "@/features/students";
import StudentTableRow from "./StudentTableRow";
import { Button } from "@/components/ui/button";
import useRoleFlags from "@/hooks/useRoleFlags";

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
      <phantom-ui loading={isLoading}>
        {!isLoading && students.length === 0 ? (
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
                <th className="py-2.5 px-3 font-extrabold">Academic Standing</th>
                <th className="py-2.5 px-3 font-extrabold">Calendar Pace</th>
                <th className="py-2.5 px-3 font-extrabold">Engagement</th>
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
      </phantom-ui>
      {pagination}
    </div>
  );
}

