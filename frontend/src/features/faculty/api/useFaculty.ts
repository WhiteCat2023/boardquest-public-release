import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { FacultyMember, CreateFacultyPayload } from "@/features/faculty";

export function useFaculties(params?: {
  search?: string;
  role?: string;
  departmentId?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<{
    faculties: FacultyMember[];
    nextCursor: string | null;
    hasNextPage: boolean;
    total?: number;
  }>({
    queryKey: ["faculties", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/faculty", {
        params,
      });
      const data = response.data?.data;
      if (data && typeof data === "object" && "faculties" in data) {
        return {
          faculties: data.faculties ?? [],
          nextCursor: data.nextCursor ?? null,
          hasNextPage: !!data.hasNextPage,
          total: data.total ?? data.faculties?.length ?? 0,
        };
      }
      return {
        faculties: Array.isArray(data) ? data : [],
        nextCursor: null,
        hasNextPage: false,
        total: Array.isArray(data) ? data.length : 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

// export function useDepartments() {
//   const axiosPrivate = useAxiosPrivate();

//   return useQuery<Department[]>({
//     queryKey: ["departments"],
//     queryFn: async () => {
//       const response = await axiosPrivate.get("/departments/get");
//       const resData = response.data?.data;
//       if (Array.isArray(resData)) return resData;
//       if (Array.isArray(resData?.departments)) return resData.departments;
//       if (Array.isArray(response.data?.departments))
//         return response.data.departments;
//       return [];
//     },
//     staleTime: 1000 * 60 * 5,
//     refetchOnWindowFocus: false,
//   });
// }

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

export function useBulkCreateFaculty() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      members: Array<{
        name: string;
        email: string;
        role?: string;
        employeeId?: string;
        phoneNumber?: string;
      }>,
    ) => {
      return await axiosPrivate.post("/faculty/bulk", { members });
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

export function useCategories(params?: {
  isPublished?: boolean;
  status?: string;
  authorId?: string;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get", {
        params,
      });
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
    mutationFn: async ({
      id,
      categoryIds,
    }: {
      id: string;
      categoryIds: string[];
    }) => {
      return await axiosPrivate.patch(`/faculty/${id}/categories`, {
        categoryIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}
