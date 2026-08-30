import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rcAxios from "@/lib/axios";

export interface ReviewSchedule {
  id: string;
  title: string;
  companyName: string;
  category?: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  reviewCenterId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewSchedulePayload {
  title: string;
  startDate: string;
  endDate: string;
  category?: string;
  description?: string;
}

export interface UpdateReviewSchedulePayload {
  title?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  description?: string;
  status?: string;
}

export function useReviewSchedules() {
  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewCenterSchedules"],
    queryFn: async () => {
      const response = await rcAxios.get("/schedules");
      const resData = response.data?.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.schedules)) return resData.schedules;
      if (Array.isArray(response.data?.schedules)) return response.data.schedules;
      return [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useCreateReviewSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewSchedulePayload) => {
      const response = await rcAxios.post("/schedules", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchedules"] });
    },
  });
}

export function useUpdateReviewSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateReviewSchedulePayload;
    }) => {
      const response = await rcAxios.put(`/schedules/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchedules"] });
    },
  });
}

export function useDeleteReviewSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rcAxios.delete(`/schedules/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchedules"] });
    },
  });
}
