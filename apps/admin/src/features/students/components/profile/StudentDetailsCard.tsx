import { GraduationCap, Calendar, Target, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Student } from "../../types/types";

interface StudentDetailsCardProps {
  student: Student;
  formatDate: (dateStr?: string) => string;
}

export function StudentDetailsCard({ student, formatDate }: StudentDetailsCardProps) {
  const userSettings = student.userSettings;

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-3">
      <CardHeader className="p-0 border-b border-border pb-2.5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="text-primary" size={16} />
          Enrolled Student Details
        </CardTitle>
        {userSettings?.targetBatch && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9.5px] font-bold py-0">
            {userSettings.targetBatch}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0 space-y-1.5 text-xs">
        <div className="flex justify-between py-1 border-b border-border">
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
        <div className="flex justify-between py-1.5 border-b border-border">
          <span className="text-muted-foreground font-medium">Enrollment Date</span>
          <span className="font-semibold text-foreground">{formatDate(student.createdAt)}</span>
        </div>
        {userSettings?.targetExamDate && (
          <div className="flex justify-between py-1.5 border-b border-border">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Calendar size={13} className="text-primary" /> Target Board Exam
            </span>
            <span className="font-bold text-primary">{formatDate(userSettings.targetExamDate)}</span>
          </div>
        )}
        {userSettings?.dailyQuota && (
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Target size={13} className="text-indigo-500" /> Daily Target Quota
            </span>
            <span className="font-bold text-foreground font-mono">{userSettings.dailyQuota} Qs/day</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
