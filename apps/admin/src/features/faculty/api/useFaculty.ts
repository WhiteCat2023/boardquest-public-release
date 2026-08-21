import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { FacultyMember, CreateFacultyPayload } from "@/features/faculty";

export function useFaculties(params?: {
  search?: string;
  role?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  enabled?: boolean;
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
    enabled: params?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
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
    onMutate: async ({ id, categoryIds }) => {
      await queryClient.cancelQueries({ queryKey: ["faculties"] });
      await queryClient.cancelQueries({ queryKey: ["faculty", id] });
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previousFaculties = queryClient.getQueryData(["faculties"]);
      const previousFaculty = queryClient.getQueryData(["faculty", id]);

      queryClient.setQueryData(["faculties"], (old: any) => {
        if (!old) return old;
        const list = old.faculties || (Array.isArray(old) ? old : null);
        if (!Array.isArray(list)) return old;

        const updatedList = list.map((f: any) =>
          f.id === id ? { ...f, handledCategoryIds: categoryIds } : f
        );

        return old.faculties ? { ...old, faculties: updatedList } : updatedList;
      });

      queryClient.setQueryData(["faculty", id], (old: any) => {
        if (!old) return old;
        const data = old.data || old;
        const updated = { ...data, handledCategoryIds: categoryIds };
        return old.data ? { ...old, data: updated } : updated;
      });

      return { previousFaculties, previousFaculty };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousFaculties) {
        queryClient.setQueryData(["faculties"], context.previousFaculties);
      }
      if (context?.previousFaculty) {
        queryClient.setQueryData(["faculty", id], context.previousFaculty);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryDetail"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-question-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
    },
  });
}
