import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";

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
  limit?: number;
}

export function useLogs({ level = "ALL", search = "", limit = 200 }: UseLogsParams = {}) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth?.accessToken || auth?.data?.user?.id || auth?.user?.id);

  return useQuery<LogItem[]>({
    queryKey: ["system-logs", level, search, limit],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/logs/get", {
          params: { level, search, limit },
        });
        return response.data?.data?.logs || response.data?.logs || [];
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          throw error;
        }
        console.warn("Failed to fetch system logs from backend:", error);
        return [];
      }
    },
    placeholderData: keepPreviousData,
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      if (!isAuthenticated || query.state.error) {
        return false;
      }
      return 5000;
    },
  });
}

export function useLogStats() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth?.accessToken || auth?.data?.user?.id || auth?.user?.id);

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
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          throw error;
        }
        console.warn("Failed to fetch log stats:", error);
        return { total: 0, info: 0, warn: 0, error: 0, fatal: 0 };
      }
    },
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      if (!isAuthenticated || query.state.error) {
        return false;
      }
      return 5000;
    },
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
