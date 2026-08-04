import { Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Student } from "../types/types";
import type { StudentBadge } from "@/utils/badgeUtils";

interface StudentPerformanceCardProps {
  student: Student;
  studentBadges: StudentBadge[];
  unlockedBadgesCount: number;
}

export function StudentPerformanceCard({
  student,
  studentBadges,
  unlockedBadgesCount,
}: StudentPerformanceCardProps) {
  return (
    <Card className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
      <CardHeader className="p-0 border-b border-border pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Award className="text-primary" size={18} />
          Academic Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-muted/40 border border-border rounded-2xl">
            <span className="text-2xl font-extrabold text-primary">{student.level || 1}</span>
            <p className="text-[11px] font-bold text-muted-foreground uppercase mt-0.5">Current Level</p>
          </div>
          <div className="p-4 bg-muted/40 border border-border rounded-2xl">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{student.xp || 0}</span>
            <p className="text-[11px] font-bold text-muted-foreground uppercase mt-0.5">Accumulated XP</p>
          </div>
        </div>

        <div className="pt-2 text-muted-foreground leading-relaxed text-xs">
          <p>&bull; <strong>Mastery Records:</strong> {student.mastery?.length || 6} major subjects tracked</p>
          <p>&bull; <strong>Badges Unlocked:</strong> {unlockedBadgesCount} / {studentBadges.length} achievements earned</p>
          <p>&bull; <strong>Completed Exams:</strong> {student.examResults?.length || 0} evaluations taken</p>
        </div>
      </CardContent>
    </Card>
  );
}
