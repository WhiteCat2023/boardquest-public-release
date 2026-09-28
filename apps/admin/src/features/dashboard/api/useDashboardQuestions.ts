import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useDashboardQuestionStats(authorId?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["dashboard-question-stats", authorId],
    queryFn: async () => {
      const params = authorId ? `?authorId=${authorId}` : "";
      const response = await axiosPrivate.get(`/questions/stats${params}`);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useDashboardQuestions(limit = 20, authorId?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["dashboard-questions", limit, authorId],
    queryFn: async () => {
      const params = authorId
        ? `?limit=${limit}&authorId=${authorId}`
        : `?limit=${limit}`;
      const response = await axiosPrivate.get(`/questions/get${params}`);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });
}
