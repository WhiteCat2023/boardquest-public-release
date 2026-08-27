import useRoleFlags from "@/hooks/useRoleFlags";
import {
  useUsers,
  useSubjects,
} from "@/features/users";
import { useStudents } from "@/features/students";

import { DashboardBanner } from "../components/DashboardBanner";
import { DashboardKpiCards } from "../components/DashboardKpiCards";
import { SubjectOverviewSection } from "../components/SubjectOverviewSection";
import { RecentQuestionsCard } from "../components/RecentQuestionsCard";
import { StudentRosterCard } from "../components/StudentRosterCard";
import { StudentPassingRateAnalytics } from "../components/StudentPassingRateAnalytics";
import { FacultyRosterCard } from "../components/FacultyRosterCard";
import { SystemAuditLogsCard } from "../components/SystemAuditLogsCard";
import { useSubjectsTotalCount } from "@/features/question-bank";
import { useDashboardQuestionStats, useDashboardQuestions } from "../api/useDashboardQuestions";

export default function Dashboard() {
  const { currentUser, userRole, isSuperAdmin, isTeacher, isTeamLead } = useRoleFlags();

  // Data Queries
  const { data: facultyData } = useUsers({ limit: 10 });
  const { data: studentData } = useStudents({ skip: 0, take: 10 });
  const { data: categoriesTotalCount } = useSubjectsTotalCount();
  const { data: dbCategories = [] } = useSubjects();
  const { data: statsData } = useDashboardQuestionStats();
  const { data: questionData } = useDashboardQuestions(20, isTeacher ? currentUser?.id : undefined);

  const totalFaculties =
    (facultyData as any)?.total ?? (Array.isArray(facultyData) ? facultyData.length : (facultyData as any)?.faculties?.length || 0);
  const totalStudents =
    (studentData as any)?.total ?? (Array.isArray(studentData) ? studentData.length : (studentData as any)?.students?.length || 0);

  const rawQuestions = Array.isArray(questionData?.questions)
    ? questionData.questions
    : Array.isArray(questionData?.items)
      ? questionData.items
      : Array.isArray(questionData)
        ? questionData
        : [];

  const totalQuestions = isTeacher
    ? (statsData?.teacherAuthoredCount ?? 0)
    : (statsData?.totalQuestions ?? 0);
  const teacherAuthoredCount = statsData?.teacherAuthoredCount ?? 0;

  const activeQuestions = rawQuestions;
  const studentsList = studentData?.students || [];

  const facultyList = Array.isArray((facultyData as any)?.faculties)
    ? (facultyData as any).faculties
    : Array.isArray(facultyData)
      ? facultyData
      : [];

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 md:p-5 w-full font-sans bg-background text-foreground min-h-full">
      {/* Banner Section (System Condition & Status) */}
      <DashboardBanner
        userRole={(userRole || "TEACHER") as any}
        userName={currentUser?.name}
      />

      {/* System Overview KPI Cards */}
      <DashboardKpiCards
        userRole={(userRole || "TEACHER") as any}
        teacherAuthoredCount={teacherAuthoredCount}
        totalQuestions={totalQuestions}
        handledCategoriesCount={
          Array.isArray(dbCategories)
            ? dbCategories.length
            : currentUser?.handledCategories?.length || 0
        }
        totalCategories={typeof categoriesTotalCount === "number" ? categoriesTotalCount : (categoriesTotalCount?.totalCount ?? 0)}
        totalStudents={totalStudents}
        totalFaculties={totalFaculties}
      />

      {/* SuperAdmin View: Faculty Roster & System Audit Logs */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <FacultyRosterCard faculties={facultyList} />
          <SystemAuditLogsCard />
        </div>
      )}

      {/* Operational Sections: Hidden for SUPERADMIN */}
      {!isSuperAdmin && (
        <>
          {/* App Analytics: Line Graph & Performance Distribution */}
          <StudentPassingRateAnalytics />
          {/* 6 Major Licensure Examination Subjects Overview */}
          <SubjectOverviewSection />

          {/* Operational Grid: Recent Questions & Student Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            <RecentQuestionsCard
              isTeacher={isTeacher}
              isTeamLead={isTeamLead}
              questions={activeQuestions}
              currentUserName={currentUser?.name}
            />
            <StudentRosterCard students={studentsList} />
          </div>
        </>
      )}
    </div>
  );
}
