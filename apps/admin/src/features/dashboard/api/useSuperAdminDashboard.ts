import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useUsers } from "@/features/users";
import { useStudents } from "@/features/students";
import { useSubjectsTotalCount } from "@/features/question-bank";

export function useSuperAdminDashboard() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;

  const { data: facultyData, isLoading: isFacultyLoading } = useUsers({ limit: 1 });
  const { data: studentData, isLoading: isStudentLoading } = useStudents({ skip: 0, take: 10 });
  const { data: categoriesTotalCount, isLoading: isCategoriesTotalCountLoading } = useSubjectsTotalCount();

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["superadmin-dashboard-question-stats"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/stats");
      return response.data?.data?.stats;
    },
    staleTime: 1000 * 60 * 3,
  });

  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ["superadmin-dashboard-questions"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/get?limit=20");
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const isLoading =
    isFacultyLoading ||
    isStudentLoading ||
    isStatsLoading ||
    isQuestionLoading ||
    isCategoriesTotalCountLoading;

  return {
    currentUser,
    facultyData,
    studentData,
    categoriesTotalCount,
    statsData,
    questionData,
    isLoading,
  };
}
