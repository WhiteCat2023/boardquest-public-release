import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type {
  ReviewCenterRepresentative,
  CreateReviewCenterPayload,
  UpdateReviewCenterPayload,
} from "../types/types";

export function useReviewCenters(params?: {
  search?: string;
  location?: string;
  company?: string;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewCenterRepresentative[]>({
    queryKey: ["reviewCenters", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/review-center", {
        params,
      });
      const resData = response.data?.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.reviewCenters)) return resData.reviewCenters;
      if (Array.isArray(response.data?.reviewCenters))
        return response.data.reviewCenters;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useReviewCenter(id?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewCenterRepresentative>({
    queryKey: ["reviewCenter", id],
    queryFn: async () => {
      if (!id) throw new Error("Review center ID is required");
      const response = await axiosPrivate.get(`/review-center/${id}`);
      return response.data?.data?.reviewCenter ?? response.data?.reviewCenter;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateReviewCenterPayload;
    }) => {
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

export interface ReviewCenterCandidateItem {
  id: string;
  name: string;
  email: string;
  schoolId?: string;
  schoolYear: string;
  batch?: string;
  status: string;
  companyName: string;
  studentId?: string | null;
  studentDetails?: {
    level: number;
    xp: number;
    streak: number;
    verified: boolean;
  } | null;
  enrolledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewCenterCandidatesResponse {
  candidates: ReviewCenterCandidateItem[];
  schoolYears: string[];
  batches?: string[];
  total: number;
}

export function useReviewCenterCandidates(
  reviewCenterId?: string,
  params?: { search?: string; schoolYear?: string; status?: string; batch?: string },
) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ReviewCenterCandidatesResponse>({
    queryKey: ["reviewCenterCandidates", reviewCenterId, params],
    queryFn: async () => {
      if (!reviewCenterId) {
        return { candidates: [], schoolYears: [], batches: [], total: 0 };
      }
      const response = await axiosPrivate.get(`/review-center/${reviewCenterId}/candidates`, {
        params,
      });
      const resData = response.data?.data;
      if (resData && Array.isArray(resData.candidates)) {
        return resData;
      }
      if (Array.isArray(resData)) {
        return {
          candidates: resData,
          schoolYears: [],
          batches: [],
          total: resData.length,
        };
      }
      return { candidates: [], schoolYears: [], batches: [], total: 0 };
    },
    enabled: !!reviewCenterId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchInterval: 1000 * 5, // live sync every 5 seconds
  });
}
