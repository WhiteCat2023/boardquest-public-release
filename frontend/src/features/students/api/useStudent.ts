import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export interface Student {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  location?: string;
  createdAt: string;
  mastery?: any[];
  studyPlans?: any[];
  examResults?: any[];
  lessonCompletions?: any[];
}

export function useStudents(params?: {
  search?: string;
  level?: string;
  location?: string;
  skip?: number;
  take?: number;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<{ students: Student[]; total: number }>({
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
      };
    },
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
      password: string;
      confirmPassword: string;
      name: string;
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
    mutationFn: async (students: Array<{
      name: string;
      email: string;
      location?: string;
      program?: string;
      yearLevel?: string;
    }>) => {
      return await axiosPrivate.post("/students/bulk", { students });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
