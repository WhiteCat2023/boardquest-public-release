import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export interface DashboardAnalyticsSummary {
  overallPassRate: number;
  overallAvgScore: number;
  totalStudentsCount: number;
  passedCount: number;
  nearTargetCount: number;
  atRiskCount: number;
  distribution: Array<{
    label: string;
    value: number;
    count: number;
    color: string;
    strokeColor: string;
    bgLight: string;
    text: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    rate: number;
    avgScore: number;
    students: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    questionCount: number;
    proficiency: number;
  }>;
}

export function useDashboardAnalyticsSummary() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<DashboardAnalyticsSummary>({
    queryKey: ["dashboardAnalyticsSummary"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/analytics/dashboard-summary");
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}
