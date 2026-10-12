import { GraduationCap, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Student } from "@/features/students";
import StudentTableRow from "./StudentTableRow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
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
    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0 flex flex-col gap-0 py-0">
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
          <Table
            containerClassName="overflow-y-auto max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-full scroll-smooth"
            className="w-full text-left border-collapse min-w-[680px]"
          >
            <TableHeader
              className="bg-muted/95 backdrop-blur-xs border-b border-border sticky top-0 z-10 shadow-2xs"
              data-shimmer-ignore
            >
              <TableRow className="border-b border-border hover:bg-transparent">
                {canSelect && (
                  <TableHead className="w-10 py-3 px-3 text-center h-auto bg-muted/95 backdrop-blur-xs">
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
                  </TableHead>
                )}
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto bg-muted/95 backdrop-blur-xs">
                  Student Profile
                </TableHead>
                <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto bg-muted/95 backdrop-blur-xs">
                  Academic Standing
                </TableHead>
                <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto bg-muted/95 backdrop-blur-xs">
                  Calendar Pace
                </TableHead>
                <TableHead className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto bg-muted/95 backdrop-blur-xs">
                  Engagement
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto bg-muted/95 backdrop-blur-xs">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
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
            </TableBody>
          </Table>
        )}
      </phantom-ui>
      {pagination}
    </Card>
  );
}

