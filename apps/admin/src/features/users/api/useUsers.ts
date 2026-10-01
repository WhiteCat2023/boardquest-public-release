import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { UserMember, CreateUserPayload } from "@/features/users";

export function useUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<{
    users: UserMember[];
    faculties: UserMember[];
    nextCursor: string | null;
    hasNextPage: boolean;
    total?: number;
  }>({
    queryKey: ["users", "faculties", params],
    queryFn: async () => {
      const response = await axiosPrivate.get("/faculty", {
        params,
      });
      const data = response.data?.data;
      if (data && typeof data === "object" && ("faculties" in data || "users" in data)) {
        const userList = data.users ?? data.faculties ?? [];
        return {
          users: userList,
          faculties: userList,
          nextCursor: data.nextCursor ?? null,
          hasNextPage: !!data.hasNextPage,
          total: data.total ?? userList.length ?? 0,
        };
      }
      const rawList = Array.isArray(data) ? data : [];
      return {
        users: rawList,
        faculties: rawList,
        nextCursor: null,
        hasNextPage: false,
        total: rawList.length,
      };
    },
    enabled: params?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

export const useFaculties = useUsers;

export function useCreateUser() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserPayload) => {
      return await axiosPrivate.post("/faculty", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export const useCreateFaculty = useCreateUser;

export function useBulkCreateUser() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      members: Array<{
        name?: string;
        firstName?: string;
        middleName?: string;
        lastName?: string;
        email: string;
        role?: string;
        employeeId?: string;
        phoneNumber?: string;
        companyName?: string;
        location?: string;
      }>,
    ) => {
      return await axiosPrivate.post("/faculty/bulk", { members });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });
}

export const useBulkCreateFaculty = useBulkCreateUser;

export function useToggleUserStatus() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      accountStatus,
      isActive,
    }: {
      id: string;
      accountStatus?: "ACTIVE" | "DEACTIVATED" | string;
      isActive?: boolean;
    }) => {
      return await axiosPrivate.patch(`/faculty/${id}/status`, {
        accountStatus,
        isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      queryClient.invalidateQueries({ queryKey: ["active-dean"] });
    },
  });
}

export const useToggleFacultyStatus = useToggleUserStatus;

export function useActiveDean(enabled: boolean = true) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery<{
    id: string;
    name: string;
    email: string;
    employeeId?: string;
  } | null>({
    queryKey: ["active-dean"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/faculty/active-dean");
      return response.data?.data?.activeDean || null;
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: true,
  });
}

export function useSubjects(params?: {
  isPublished?: boolean;
  status?: string;
  authorId?: string;
  search?: string;
  all?: boolean;
}) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["subjects", "categories", params],
    queryFn: async () => {
      const cleanParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(
              ([_, val]) => val !== undefined && val !== ""
            )
          )
        : undefined;

      const response = await axiosPrivate.get("/questions/category/get", {
        params: cleanParams,
      });
      return response.data?.data?.subjects ?? response.data?.data?.categories ?? response.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export const useCategories = useSubjects;

export function useUpdateUserSubjects() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      categoryIds,
      subjectIds,
    }: {
      id: string;
      categoryIds?: string[];
      subjectIds?: string[];
    }) => {
      const ids = subjectIds || categoryIds || [];
      return await axiosPrivate.patch(`/faculty/${id}/categories`, {
        categoryIds: ids,
        subjectIds: ids,
      });
    },
    onMutate: async ({ id, categoryIds, subjectIds }) => {
      const ids = subjectIds || categoryIds || [];
      await queryClient.cancelQueries({ queryKey: ["users"] });
      await queryClient.cancelQueries({ queryKey: ["faculties"] });
      await queryClient.cancelQueries({ queryKey: ["faculty", id] });
      await queryClient.cancelQueries({ queryKey: ["subjects"] });
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previousFaculties = queryClient.getQueryData(["faculties"]);
      const previousFaculty = queryClient.getQueryData(["faculty", id]);

      queryClient.setQueryData(["faculties"], (old: any) => {
        if (!old) return old;
        const list = old.faculties || old.users || (Array.isArray(old) ? old : null);
        if (!Array.isArray(list)) return old;

        const updatedList = list.map((f: any) =>
          f.id === id ? { ...f, handledCategoryIds: ids, handledSubjectIds: ids } : f
        );

        return old.faculties ? { ...old, faculties: updatedList } : updatedList;
      });

      queryClient.setQueryData(["faculty", id], (old: any) => {
        if (!old) return old;
        const data = old.data || old;
        const updated = { ...data, handledCategoryIds: ids, handledSubjectIds: ids };
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
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export const useUpdateFacultyCategories = useUpdateUserSubjects;
export const useUpdateSubjects = useUpdateUserSubjects;
