import { GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Student } from "../../types/types";

interface StudentDetailsCardProps {
  student: Student;
  formatDate: (dateStr?: string) => string;
}

export function StudentDetailsCard({ student, formatDate }: StudentDetailsCardProps) {
  return (
    <Card className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
      <CardHeader className="p-0 border-b border-border pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="text-primary" size={18} />
          Enrolled Student Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3 text-xs">
        <div className="flex justify-between py-1.5 border-b border-border">
          <span className="text-muted-foreground font-medium">Student ID</span>
          <span className="font-bold text-foreground font-mono">{student.id}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border">
          <span className="text-muted-foreground font-medium">Full Name</span>
          <span className="font-semibold text-foreground">{student.name}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border">
          <span className="text-muted-foreground font-medium">Email Address</span>
          <span className="font-semibold text-foreground">{student.email}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-border">
          <span className="text-muted-foreground font-medium">Location</span>
          <span className="font-semibold text-foreground">{student.location || "Philippines"}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-muted-foreground font-medium">Enrollment Date</span>
          <span className="font-semibold text-foreground">{formatDate(student.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
