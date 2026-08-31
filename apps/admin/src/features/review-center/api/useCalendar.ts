import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { 
  ReviewSchedule,
  CreateReviewSchedulePayload,
  UpdateReviewSchedulePayload
} from "../types/types";

export function useReviewSchedules(params?: { company?: string }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewSchedules", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/calendar/schedules/get", {
        params,
      });
      const resData = response.data?.data;
      let list: ReviewSchedule[] = [];
      if (Array.isArray(resData)) list = resData;
      else if (Array.isArray(resData?.schedules)) list = resData.schedules;
      else if (Array.isArray(response.data?.schedules)) list = response.data.schedules;

      if (params?.company && params.company !== "ALL") {
        return list.filter(
          (s) => s.companyName?.toLowerCase() === params.company?.toLowerCase()
        );
      }
      return list;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 1000 * 5, // Automatically sync changes from DB every 5 seconds
  });
}

export const useCalendar = useReviewSchedules;

export function useCreateReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewSchedulePayload) => {
      const response = await axiosPrivate.post("/calendar/schedules/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

export function useUpdateReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewSchedulePayload }) => {
      const response = await axiosPrivate.put(`/calendar/schedules/update/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

export function useDeleteReviewSchedule() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/calendar/schedules/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}

export const useDeleteCalendarEvent = useDeleteReviewSchedule;

