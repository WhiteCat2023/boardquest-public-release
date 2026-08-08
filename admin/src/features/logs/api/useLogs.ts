import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export type LogLevelType = "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogItem {
  id: string;
  level: LogLevelType;
  action: string;
  message: string;
  source?: string;
  userEmail?: string;
  ipAddress?: string;
  metadata?: string;
  createdAt: string;
}

export interface LogStats {
  total: number;
  info: number;
  warn: number;
  error: number;
  fatal: number;
}

export interface UseLogsParams {
  level?: string;
  search?: string;
}

export function useLogs({ level = "ALL", search = "" }: UseLogsParams = {}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<LogItem[]>({
    queryKey: ["system-logs", level, search],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/logs/get", {
          params: { level, search, limit: 200 },
        });
        return response.data?.data?.logs || response.data?.logs || [];
      } catch (error) {
        console.warn("Failed to fetch system logs from backend:", error);
        return [];
      }
    },
    refetchInterval: 5000,
  });
}

export function useLogStats() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<LogStats>({
    queryKey: ["system-logs-stats"],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/logs/stats");
        return (
          response.data?.data?.stats ||
          response.data?.stats || {
            total: 0,
            info: 0,
            warn: 0,
            error: 0,
            fatal: 0,
          }
        );
      } catch (error) {
        console.warn("Failed to fetch log stats:", error);
        return { total: 0, info: 0, warn: 0, error: 0, fatal: 0 };
      }
    },
    refetchInterval: 5000,
  });
}

export function useClearLogs() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.post("/logs/clear");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-logs"] });
      queryClient.invalidateQueries({ queryKey: ["system-logs-stats"] });
    },
  });
}
