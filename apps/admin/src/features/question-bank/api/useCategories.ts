import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface Category {
  id: string;
  _id?: string;
  name: string;
  code?: string;
  icon?: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const useCategories = (params?: { search?: string }) => {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["categories", params?.search],
    queryFn: async () => {
      const cleanParams = params?.search?.trim()
        ? { search: params.search.trim() }
        : undefined;
      const response = await axiosPrivate.get("/questions/category/get", {
        params: cleanParams,
      });
      return (response.data?.data?.categories ??
        response.data?.data?.subjects ??
        response.data?.data ??
        []) as Category[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useSubjects = useCategories;

export const useSubjectsTotalCount = () => {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["subjectsTotalCount", "categoriesTotalCount"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/count");
      return response.data?.data?.totalCount ?? response.data?.totalCount ?? 0;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCategoriesTotalCount = useSubjectsTotalCount;

export function useCreateCategory() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      icon,
      authorId,
    }: {
      name: string;
      icon?: string;
      authorId?: string;
    }) => {
      const response = await axiosPrivate.post("/questions/category/create", {
        name,
        icon,
        authorId,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Category "${variables.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTotalCount"] });
      queryClient.invalidateQueries({ queryKey: ["subjectsTotalCount"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create category.");
    },
  });
}

export function useDeleteCategory() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(
        `/questions/category/single/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Subject category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["categoriesTotalCount"] });
      queryClient.invalidateQueries({ queryKey: ["subjectsTotalCount"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete category.");
    },
  });
}
