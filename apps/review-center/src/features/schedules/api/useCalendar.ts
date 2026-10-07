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
  schoolYear?: string;
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
  schoolYear?: string;
}

export interface UpdateReviewSchedulePayload {
  title?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  description?: string;
  status?: string;
  schoolYear?: string;
}

export function useReviewSchedules(filters: { schoolYear?: string } = {}) {
  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewCenterSchedules", filters],
    queryFn: async () => {
      const response = await rcAxios.get("/schedules", { params: filters });
      const resData = response.data?.data;
      let list: ReviewSchedule[] = [];
      if (Array.isArray(resData)) list = resData;
      else if (Array.isArray(resData?.schedules)) list = resData.schedules;
      else if (Array.isArray(response.data?.schedules)) list = response.data.schedules;
      return list;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 1000 * 5, // Automatically sync changes from DB every 5 seconds
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
