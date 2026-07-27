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

export default function Dashboard() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const userRole = (currentUser?.role || "ADMIN") as UserRole;

  const isTeacher = userRole === "TEACHER";
  const isTeamLead = userRole === "TEAMLEAD";

  // Data Queries
  const { data: facultyData, isLoading: isFacultyLoading } = useFaculties();
  const { data: studentData, isLoading: isStudentLoading } = useStudents({ skip: 0, take: 10 });
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();

  // Fetch Questions
  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ["dashboard-questions", userRole, currentUser?.id],
    queryFn: async () => {
      const url = isTeacher
        ? `/questions/get?authorId=${currentUser?.id}`
        : "/questions/get?limit=20";
      const response = await axiosPrivate.get(url);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const isLoading =
    isFacultyLoading ||
    isStudentLoading ||
    isCategoryLoading ||
    isQuestionLoading;

  const totalFaculties =
    (facultyData as any)?.total ?? (Array.isArray(facultyData) ? facultyData.length : (facultyData as any)?.faculties?.length || 0);
  const totalStudents =
    (studentData as any)?.total ?? (Array.isArray(studentData) ? studentData.length : (studentData as any)?.students?.length || 0);
  const totalCategories = (categoryData || []).length;
  const handledCategoriesCount =
    currentUser?.handledCategories?.length || (categoryData || []).length;

  const rawQuestions = Array.isArray(questionData?.questions)
    ? questionData.questions
    : Array.isArray(questionData?.items)
      ? questionData.items
      : Array.isArray(questionData)
        ? questionData
        : [];

  const teacherAuthoredQuestions = isTeacher
    ? rawQuestions
    : rawQuestions.filter(
        (q: any) =>
          q.authorId === currentUser?.id || q.author?.id === currentUser?.id,
      );

  const teacherDraftCount = teacherAuthoredQuestions.filter(
    (q: any) => !q.isPublished && q.status !== "APPROVED",
  ).length;
  const teacherPublishedCount = teacherAuthoredQuestions.filter(
    (q: any) => q.isPublished || q.status === "APPROVED",
  ).length;

  const totalQuestions = isTeacher
    ? teacherAuthoredQuestions.length
    : questionData?.total || rawQuestions.length;
  const publishedQuestions = rawQuestions.filter(
    (q: any) => q.isPublished || q.status === "APPROVED",
  ).length;
  const pendingReviewQuestions = rawQuestions.filter(
    (q: any) => !q.isPublished && q.status !== "APPROVED",
  ).length;

  const activeQuestions = isTeacher ? teacherAuthoredQuestions : rawQuestions;
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
          teacherAuthoredCount={teacherAuthoredQuestions.length}
          teacherPublishedCount={teacherPublishedCount}
          teacherDraftCount={teacherDraftCount}
          pendingReviewQuestions={pendingReviewQuestions}
          totalQuestions={totalQuestions}
          publishedQuestions={publishedQuestions}
          handledCategoriesCount={handledCategoriesCount}
          totalCategories={totalCategories}
          totalStudents={totalStudents}
          totalFaculties={totalFaculties}
        />

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
