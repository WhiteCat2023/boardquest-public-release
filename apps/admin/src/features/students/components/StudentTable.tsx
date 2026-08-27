import { GraduationCap } from "lucide-react";
import type { Student } from "@/features/students";
import StudentTableRow from "./StudentTableRow";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";

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
  const displayStudents = students;

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && students.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2.5">
            <GraduationCap
              size={38}
              className="text-muted-foreground/40 stroke-[1.5]"
            />
            <p className="font-bold text-foreground text-sm">{emptyTitle}</p>
            <p className="text-xs max-w-xs text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader
                className="bg-muted/50 border-b border-border"
                data-shimmer-ignore
              >
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-2.5 px-4 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Student Profile
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Progression Level & XP
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Badges Earned
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Location
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-2.5 px-3 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="py-2.5 px-4 text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
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
