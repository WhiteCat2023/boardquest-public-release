import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { ReviewCenterRepresentative, CreateReviewCenterPayload, UpdateReviewCenterPayload } from "../types";

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
