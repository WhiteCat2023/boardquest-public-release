import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { 
  ReviewSchedule,
  CreateReviewSchedulePayload,
  UpdateReviewSchedulePayload
} from "../types";

export function useReviewSchedules() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewSchedules"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/calendar/schedules/get");
      const resData = response.data?.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.schedules)) return resData.schedules;
      if (Array.isArray(response.data?.schedules)) return response.data.schedules;
      return [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

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
