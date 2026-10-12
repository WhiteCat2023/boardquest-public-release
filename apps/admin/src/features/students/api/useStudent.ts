import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Student, StudentCohortSummary, ExamResult, ExamResultStats } from "@/features/students/types/types";

export function useStudents(params?: {
  search?: string;
  level?: string;
  location?: string;
  advisorId?: string;
  paceStatus?: string;
  engagement?: string;
  academicStanding?: string;
  skip?: number;
  take?: number;
  enabled?: boolean;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<{ students: Student[]; total: number; summary?: StudentCohortSummary }>({
    queryKey: ["students", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/students/get", {
        params,
      });
      const resData = response.data?.data;
      if (Array.isArray(resData)) {
        return { students: resData, total: resData.length };
      }
      return {
        students: resData?.data || resData?.students || [],
        total: resData?.pagination?.total || (resData?.data || []).length,
        summary: resData?.summary,
      };
    },
    enabled: params?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useStudent(studentId?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<Student>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      const response = await axiosPrivate.get(`/students/get/${studentId}`);
      return response.data?.data?.student ?? response.data?.data;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateStudent() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password?: string;
      confirmPassword?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      location?: string;
    }) => {
      return await axiosPrivate.post("/students/create", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useBulkCreateStudents() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      students: Array<{
        name?: string;
        firstName?: string;
        lastName?: string;
        email: string;
        location?: string;
        program?: string;
        yearLevel?: string;
      }>,
    ) => {
      return await axiosPrivate.post("/students/bulk", { students });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useStudentExamResults(studentId?: string, initialData?: ExamResult[]) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ExamResult[]>({
    queryKey: ["student-exams", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await axiosPrivate.get(`/students/exam/${studentId}`);
      return response.data?.data?.results || [];
    },
    enabled: !!studentId,
    initialData: initialData && initialData.length > 0 ? initialData : undefined,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useStudentExamStats(studentId?: string) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<ExamResultStats>({
    queryKey: ["student-exam-stats", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      const response = await axiosPrivate.get(`/students/exam/stats/${studentId}`);
      return response.data?.data?.stats;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

