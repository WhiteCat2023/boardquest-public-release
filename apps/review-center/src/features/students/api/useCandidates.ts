import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rcAxios from "@/lib/axios";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  schoolId?: string;
  schoolYear: string;
  batch: string;
  status: string;
  companyName: string;
  reviewCenterId?: string | null;
  studentId?: string | null;
  studentDetails?: {
    level: number;
    xp: number;
    streak: number;
    verified: boolean;
  } | null;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFilters {
  search?: string;
  schoolYear?: string;
  batch?: string;
  status?: string;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  schoolYears: string[];
  batches: string[];
  total: number;
}

export interface EnrollCandidatePayload {
  name: string;
  email: string;
  schoolId?: string;
  schoolYear: string;
  batch: string;
  status?: string;
}

export interface UpdateCandidatePayload {
  name?: string;
  email?: string;
  schoolId?: string;
  schoolYear?: string;
  batch?: string;
  status?: string;
}

export function useCandidates(filters: CandidateFilters = {}) {
  return useQuery<CandidatesResponse>({
    queryKey: ["reviewCenterCandidates", filters],
    queryFn: async () => {
      const response = await rcAxios.get("/candidates", {
        params: filters,
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
      return {
        candidates: [],
        schoolYears: [],
        batches: [],
        total: 0,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useEnrollCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EnrollCandidatePayload) => {
      const response = await rcAxios.post("/candidates/enroll", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCandidatePayload;
    }) => {
      const response = await rcAxios.put(`/candidates/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
    },
  });
}

export interface BulkEnrollPayload {
  schoolYear: string;
  batch: string;
  students: {
    name: string;
    email: string;
    schoolId?: string;
    batch?: string;
  }[];
}

export function useBulkEnrollCandidates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkEnrollPayload) => {
      const response = await rcAxios.post("/candidates/bulk-enroll", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rcAxios.delete(`/candidates/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchoolYears"] });
    },
  });
}

export interface SchoolYearRecord {
  id: string;
  schoolYear: string;
  isCurrent: boolean;
  createdAt: string;
}

export function useSchoolYears() {
  return useQuery<string[]>({
    queryKey: ["reviewCenterSchoolYears"],
    queryFn: async () => {
      const response = await rcAxios.get("/candidates/school-years");
      const list = response.data?.data?.schoolYears;
      if (Array.isArray(list)) {
        return list.map((item: any) =>
          typeof item === "string" ? item : item.schoolYear
        );
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}

export function useCreateSchoolYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schoolYear: string) => {
      const response = await rcAxios.post("/candidates/school-years", {
        schoolYear,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchoolYears"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
    },
  });
}

export function useDeleteSchoolYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schoolYear: string) => {
      const response = await rcAxios.delete(
        `/candidates/school-years/${encodeURIComponent(schoolYear)}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterSchoolYears"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
    },
  });
}
