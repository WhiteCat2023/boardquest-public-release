import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useStudents } from "@/features/students";
import { useCategoriesTotalCount } from "@/features/question-bank";

export function useTeacherDashboard() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;

  const { data: studentData, isLoading: isStudentLoading } = useStudents({ skip: 0, take: 10 });
  const { data: categoriesTotalCount, isLoading: isCategoriesTotalCountLoading } = useCategoriesTotalCount();

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["teacher-dashboard-question-stats"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/stats");
      return response.data?.data?.stats;
    },
    staleTime: 1000 * 60 * 3,
  });

  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ["teacher-dashboard-questions"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/get?limit=20");
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const isLoading =
    isStudentLoading ||
    isStatsLoading ||
    isQuestionLoading ||
    isCategoriesTotalCountLoading;

  return {
    currentUser,
    studentData,
    categoriesTotalCount,
    statsData,
    questionData,
    isLoading,
  };
}
