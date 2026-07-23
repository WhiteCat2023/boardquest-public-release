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
    <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden w-full p-0">
      <phantom-ui loading={isLoading}>
        {!isLoading && students.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <GraduationCap size={48} className="text-slate-300 stroke-[1.5]" />
            <p className="font-bold text-slate-600">No Enrolled Students Registered</p>
            <p className="text-sm max-w-sm">No students have been enrolled in the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                    Student Profile
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                    Progression Level & XP
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                    Badges Earned
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                    Location
                  </TableHead>
                  <TableHead className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 h-auto">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {displayStudents.map((student, idx) => (
                  <StudentTableRow
                    key={student.id === "placeholder" ? `ph-${idx}` : student.id}
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
