import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { FacultyMember, Department, CreateFacultyPayload } from "../types";

export function useFaculties() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<FacultyMember[]>({
    queryKey: ["faculties"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/faculty");
      return response.data?.data?.faculties ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useDepartments() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/departments/get");
      const resData = response.data?.data;
      if (Array.isArray(resData)) return resData;
      if (Array.isArray(resData?.departments)) return resData.departments;
      if (Array.isArray(response.data?.departments)) return response.data.departments;
      return [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateFaculty() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFacultyPayload) => {
      return await axiosPrivate.post("/faculty", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export function useDeleteFaculty() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/faculty/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export function useToggleFacultyStatus() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await axiosPrivate.patch(`/faculty/${id}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export function useCategories() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get");
      return response.data?.data?.categories ?? response.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateFacultyCategories() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, categoryIds }: { id: string; categoryIds: string[] }) => {
      return await axiosPrivate.patch(`/faculty/${id}/categories`, { categoryIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}
