import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { StudentListItem, StudentAnalyticsResult } from "../types/types";

export function useStudentsList(params?: { search?: string; take?: number }) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<StudentListItem[]>({
    queryKey: ["studentsList", params],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/students/get", {
          params: {
            take: params?.take || 100,
            search: params?.search?.trim() || undefined,
          }
        });
        const resData = response.data?.data;
        const list = Array.isArray(resData) 
          ? resData 
          : resData?.students || resData?.data || [];
        return list;
      } catch (err) {
        return [];
      }
    }
  });
}

export function useStudentAnalyticsReport(selectedStudentId: string | null) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<StudentAnalyticsResult | null>({
    queryKey: ["studentReport", selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      try {
        const response = await axiosPrivate.get(`/analytics/student/${selectedStudentId}`);
        if (response.data?.data) return response.data.data;
        return null;
      } catch (err) {
        return null;
      }
    },
    enabled: !!selectedStudentId,
  });
}
