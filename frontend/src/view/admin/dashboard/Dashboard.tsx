import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import {
  useFaculties,
  useCategories,
} from "@/view/admin/faculty/hooks/useFaculty";
import { useStudents } from "@/view/admin/student_management/hooks/useStudent";

import { DashboardBanner } from "./components/DashboardBanner";
import type { UserRole } from "./components/DashboardBanner";
import { DashboardKpiCards } from "./components/DashboardKpiCards";
import { SubjectOverviewSection } from "./components/SubjectOverviewSection";
import { RecentQuestionsCard } from "./components/RecentQuestionsCard";
import { StudentRosterCard } from "./components/StudentRosterCard";
import { StudentPassingRateAnalytics } from "./components/StudentPassingRateAnalytics";
import { useCategoriesTotalCount } from "@/hooks/useCategories";

export default function Dashboard() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const userRole = (currentUser?.role || "ADMIN") as UserRole;

  const isTeacher = userRole === "TEACHER";
  const isTeamLead = userRole === "TEAMLEAD";

  // Data Queries
  const { data: facultyData, isLoading: isFacultyLoading } = useFaculties({ limit: 1 });
  const { data: studentData, isLoading: isStudentLoading } = useStudents({ skip: 0, take: 10 });
  const { data: categoriesTotalCount, isLoading: isCategoriesTotalCountLoading } = useCategoriesTotalCount();


  // Fetch Question Stats directly from database backend
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-question-stats", userRole, currentUser?.id],
    queryFn: async () => {
      const url = isTeacher
        ? `/questions/stats?authorId=${currentUser?.id}`
        : "/questions/stats";
      const response = await axiosPrivate.get(url);
      return response.data?.data?.stats;
    },
    staleTime: 1000 * 60 * 3,
  });

  // Fetch Recent Questions for display card
  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ["dashboard-questions", userRole, currentUser?.id],
    queryFn: async () => {
      const url = isTeacher
        ? `/questions/get?authorId=${currentUser?.id}&limit=20`
        : "/questions/get?limit=20";
      const response = await axiosPrivate.get(url);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const isLoading =
    isFacultyLoading ||
    isStudentLoading ||
    isCategoriesTotalCountLoading ||
    isStatsLoading ||
    isQuestionLoading;

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
  const publishedQuestions = statsData?.publishedQuestions ?? 0;
  const pendingReviewQuestions = statsData?.pendingReviewQuestions ?? 0;
  const teacherAuthoredCount = statsData?.teacherAuthoredCount ?? 0;
  const teacherPublishedCount = statsData?.teacherPublishedCount ?? 0;
  const teacherDraftCount = statsData?.teacherDraftCount ?? 0;

  const activeQuestions = rawQuestions;
  const studentsList = studentData?.students || [];

  return (
    <phantom-ui loading={isLoading}>
      <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full max-w-7xl mx-auto font-sans bg-background text-foreground min-h-full">
        {/* Banner Section */}
        <DashboardBanner
          userRole={userRole}
          userName={currentUser?.name}
          teacherDraftCount={teacherDraftCount}
          pendingReviewQuestions={pendingReviewQuestions}
        />

        {/* Dynamic KPI Cards */}
        <DashboardKpiCards
          userRole={userRole}
          teacherAuthoredCount={teacherAuthoredCount}
          teacherPublishedCount={teacherPublishedCount}
          teacherDraftCount={teacherDraftCount}
          pendingReviewQuestions={pendingReviewQuestions}
          totalQuestions={totalQuestions}
          publishedQuestions={publishedQuestions}
          handledCategoriesCount={currentUser?.handledCategories?.length || 0}
          totalCategories={typeof categoriesTotalCount === "number" ? categoriesTotalCount : (categoriesTotalCount?.totalCount ?? 0)}
          totalStudents={totalStudents}
          totalFaculties={totalFaculties}
        />

        {/* Student Passing Rate Analytics: Line Graph + Pie/Donut Chart */}
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
      </div>
    </phantom-ui>
  );
}
