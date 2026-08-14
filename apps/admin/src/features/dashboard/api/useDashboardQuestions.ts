import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useDashboardQuestionStats() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["dashboard-question-stats"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/stats");
      return response.data?.data?.stats;
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useDashboardQuestions(limit = 20) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["dashboard-questions", limit],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/questions/get?limit=${limit}`);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}
