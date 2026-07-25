import { GraduationCap } from "lucide-react";
import type { Student } from "../hooks/useStudent";
import StudentTableRow from "./StudentTableRow";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
}

export default function StudentTable({ students, isLoading }: StudentTableProps) {
  const displayStudents =
    isLoading && students.length === 0
      ? (Array(5).fill({
          id: "placeholder",
          name: "Loading Student Name",
          email: "loading.student@university.edu",
          level: 1,
          xp: 150,
          streak: 3,
          location: "Philippines",
          createdAt: new Date().toISOString(),
        }) as Student[])
      : students;

  return (
    <Card className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && students.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <GraduationCap size={48} className="text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-bold text-foreground">
              No Enrolled Students Registered
            </p>
            <p className="text-sm max-w-sm">
              No students have been enrolled in the platform yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader
                className="bg-muted/40 border-b border-border"
                data-shimmer-ignore
              >
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Student Profile
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Progression Level & XP
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Badges Earned
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Location
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {displayStudents.map((student, idx) => (
                  <StudentTableRow
                    key={
                      student.id === "placeholder" ? `ph-${idx}` : student.id
                    }
                    student={student}
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
