import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export interface DashboardAnalyticsSummary {
  overallPassRate: number;
  overallAvgScore: number;
  overallReadinessScore?: number;
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
    readinessScore?: number;
    avgScore: number;
    students: number;
    tier?: "High Probability" | "In Training" | "Needs Remediation";
    benchmarkMet?: boolean;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    questionCount: number;
    proficiency: number;
  }>;
}

export const DASHBOARD_ANALYTICS_QUERY_KEY = ["dashboardAnalyticsSummary"];

export function useDashboardAnalyticsSummary() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<DashboardAnalyticsSummary>({
    queryKey: DASHBOARD_ANALYTICS_QUERY_KEY,
    queryFn: async () => {
      const response = await axiosPrivate.get("/analytics/dashboard-summary");
      return response.data?.data;
    },
    staleTime: 5000, // 5 seconds fresh window
    refetchInterval: 10000, // 10 seconds auto-polling fallback for real-time live sync
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
