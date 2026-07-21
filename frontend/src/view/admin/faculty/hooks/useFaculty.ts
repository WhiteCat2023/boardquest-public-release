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
  });
}

export function useDepartments() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/departments/get");
      return response.data?.data?.departments ?? [];
    },
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
