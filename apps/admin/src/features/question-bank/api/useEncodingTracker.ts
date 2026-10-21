import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type {
  TrackerOverviewResponse,
  MyProgressResponse,
} from "../types/encodingTracker.types";

export interface TrackerFilters {
  schoolYear?: string;
  subjectId?: string;
  status?: string;
  search?: string;
}

export interface UpsertQuotaPayload {
  teacherId: string;
  subjectId: string;
  schoolYear?: string;
  targetCount: number;
  deadline?: string | null;
  notes?: string;
  term?: string;
  title?: string;
}

export interface NudgePayload {
  teacherId: string;
  subjectId?: string;
  customMessage?: string;
}

export interface BulkNudgePayload {
  subjectId?: string;
  schoolYear?: string;
  customMessage?: string;
}

export interface UpsertSubjectQuotaPayload {
  subjectId: string;
  totalTargetCount: number;
  deadline?: string | null;
  notes?: string;
  schoolYear?: string;
}

export function useEncodingTrackerOverview(filters?: TrackerFilters) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["encodingTrackerOverview", filters],
    queryFn: async () => {
      const cleanParams = filters
        ? Object.fromEntries(
            Object.entries(filters).filter(
              ([_, val]) => val !== undefined && val !== "" && val !== "ALL",
            ),
          )
        : undefined;

      const response = await axiosPrivate.get("/questions/encoding-tracker", {
        params: cleanParams,
      });
      return response.data?.data as TrackerOverviewResponse;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMyEncodingProgress(schoolYear?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["myEncodingProgress", schoolYear],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        "/questions/encoding-tracker/my-progress",
        {
          params: schoolYear ? { schoolYear } : undefined,
        },
      );
      return response.data?.data as MyProgressResponse;
    },
  });
}

export function useUpsertQuotaMutation() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertQuotaPayload) => {
      const response = await axiosPrivate.post(
        "/questions/encoding-tracker/quota",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encodingTrackerOverview"] });
      queryClient.invalidateQueries({ queryKey: ["myEncodingProgress"] });
    },
  });
}

export function useUpsertSubjectQuotaMutation() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertSubjectQuotaPayload) => {
      const response = await axiosPrivate.post(
        "/questions/encoding-tracker/quota-subject",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encodingTrackerOverview"] });
      queryClient.invalidateQueries({ queryKey: ["myEncodingProgress"] });
    },
  });
}

export function useSendTeacherNudgeMutation() {
  const axiosPrivate = useAxiosPrivate();

  return useMutation({
    mutationFn: async (payload: NudgePayload) => {
      const response = await axiosPrivate.post(
        "/questions/encoding-tracker/nudge",
        payload,
      );
      return response.data;
    },
  });
}

export function useSendBulkTeacherNudgesMutation() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkNudgePayload) => {
      const response = await axiosPrivate.post(
        "/questions/encoding-tracker/nudge-bulk",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encodingTrackerOverview"] });
    },
  });
}
