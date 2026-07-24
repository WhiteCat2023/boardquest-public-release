import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { 
  ReviewCenterRepresentative, 
  CreateReviewCenterPayload, 
  UpdateReviewCenterPayload,
  ReviewSchedule,
  CreateReviewSchedulePayload,
  UpdateReviewSchedulePayload
} from "../types";

export function useReviewCenters() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewCenterRepresentative[]>({
    queryKey: ["reviewCenters"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/review-center");
      const resData = response.data?.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.reviewCenters)) return resData.reviewCenters;
      if (Array.isArray(response.data?.reviewCenters)) return response.data.reviewCenters;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateReviewCenter() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewCenterPayload) => {
      const response = await axiosPrivate.post("/review-center", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenters"] });
    },
  });
}

export function useUpdateReviewCenter() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReviewCenterPayload }) => {
      const response = await axiosPrivate.put(`/review-center/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenters"] });
    },
  });
}

export function useDeleteReviewCenter() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/review-center/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenters"] });
    },
  });
}

// --- REVIEW CALENDAR / SCHEDULE HOOKS ---

export function useReviewSchedules() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewSchedule[]>({
    queryKey: ["reviewSchedules"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/review-center/schedules/get");
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
      const response = await axiosPrivate.post("/review-center/schedules/create", data);
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
      const response = await axiosPrivate.put(`/review-center/schedules/update/${id}`, data);
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
      const response = await axiosPrivate.delete(`/review-center/schedules/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
    },
  });
}
