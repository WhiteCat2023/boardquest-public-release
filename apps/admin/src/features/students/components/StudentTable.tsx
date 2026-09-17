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
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function StudentTable({
  students,
  isLoading,
  onAssignGuidance,
  emptyTitle = "No Enrolled Students Registered",
  emptyDescription = "No students match the selected filter criteria.",
}: StudentTableProps) {
  const { isTeacher } = useRoleFlags();
  const displayStudents = students;

  return (
    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && students.length === 0 ? (
          <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
            <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
              <GraduationCap size={40} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center gap-1 max-w-sm">
              <p className="font-bold text-foreground text-sm tracking-tight">{emptyTitle}</p>
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
            <Table className="w-full text-left border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                data-shimmer-ignore
              >
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Student Profile
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Progression Level
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    EXP
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Location
                  </TableHead>
                  <TableHead className="hidden md:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Study Target / Batch
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
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
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </phantom-ui>
    </Card>
  );
}

