import { useParams, useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useStudent, useStudents } from "@/features/students";
import { getStudentEarnedBadges } from "@/utils/badgeUtils";
import { StudentProfileHeader } from "../components/profile/StudentProfileHeader";
import { StudentDetailsCard } from "../components/profile/StudentDetailsCard";
import { StudentPerformanceCard } from "../components/profile/StudentPerformanceCard";
import { StudentBadgesSection } from "../components/profile/StudentBadgesSection";
import { StudentAchievementHistory } from "../components/profile/StudentAchievementHistory";
import { StudentSubjectProgressCard } from "../components/profile/StudentSubjectProgressCard";

export default function ViewStudent() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: studentDirect, isLoading: isDirectLoading } =
    useStudent(studentId);
  const { data: allStudentsData, isLoading: isListLoading } = useStudents({
    skip: 0,
    take: 100,
  });

  const fallbackStudent = (allStudentsData?.students || []).find(
    (s) => s.id === studentId,
  );
  const student = studentDirect || fallbackStudent;
  const isLoading = isDirectLoading && isListLoading && !student;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!student && !isLoading) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-foreground">
          Student Profile Not Found
        </h2>
        <p className="text-xs text-muted-foreground">
          The requested student account could not be retrieved.
        </p>
        <Button
          onClick={() => navigate("/student-management")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-semibold"
        >
          Return to Student Directory
        </Button>
      </div>
    );
  }

  const activeStudent =
    student ||
    ({
      id: "placeholder",
      name: "Loading Student Name",
      email: "loading.student@university.edu",
      level: 1,
      xp: 100,
      location: "Philippines",
      createdAt: new Date().toISOString(),
    } as any);

  const studentBadges = getStudentEarnedBadges(activeStudent);
  const unlockedBadgesCount = studentBadges.filter((b) => b.unlocked).length;

  return (
    <phantom-ui loading={isLoading}>
      <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-6xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground">
        {/* Header section with back button and hero card */}
        <StudentProfileHeader student={activeStudent} />

        {/* Grid: Student Details & Academic Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StudentDetailsCard student={activeStudent} formatDate={formatDate} />
          <StudentPerformanceCard
            student={activeStudent}
            studentBadges={studentBadges}
            unlockedBadgesCount={unlockedBadgesCount}
          />
        </div>

        {/* 6 Major Board Subjects Performance Section */}
        <StudentSubjectProgressCard student={activeStudent} />

        {/* Earned Achievements & Gamification Badges Card */}
        <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
                <Award className="text-primary" size={22} />
                Earned Achievements & Gamification Badges
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Academic milestones, evaluation streak awards, and mastery
                honors unlocked by {activeStudent.name}.
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full w-fit"
            >
              {unlockedBadgesCount} / {studentBadges.length} Unlocked
            </Badge>
          </div>

          {/* Badges Grid */}
          <StudentBadgesSection badges={studentBadges} />

          {/* Achievements History Feed */}
          <StudentAchievementHistory
            achievements={activeStudent.achievements}
            studentName={activeStudent.name}
            formatDate={formatDate}
          />
        </Card>
      </div>
    </phantom-ui>
  );
}
