import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface LearningModule {
  id: string;
  title: string;
  description?: string | null;
  fileUrls: string[];
  order: number;
  isPublished: boolean;
  categoryId: string;
  authorId?: string | null;
  author?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  fileUrls?: string[];
  order?: number;
  isPublished?: boolean;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  fileUrls?: string[];
  order?: number;
  isPublished?: boolean;
}

export function useLearningModules(categoryId: string | null) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["learningModules", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await axiosPrivate.get(
        `/questions/category/${categoryId}/modules`
      );
      return (
        response.data?.data?.modules ?? response.data?.modules ?? []
      ) as LearningModule[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateLearningModule(categoryId: string | null) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateModuleInput) => {
      if (!categoryId) throw new Error("Category ID is required");
      const response = await axiosPrivate.post(
        `/questions/category/${categoryId}/modules`,
        data
      );
      return response.data;
    },
    onSuccess: (_, data) => {
      toast.success(`Module "${data.title}" added successfully!`);
      queryClient.invalidateQueries({
        queryKey: ["learningModules", categoryId],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add module.");
    },
  });
}

export function useUpdateLearningModule(categoryId: string | null) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      moduleId,
      data,
    }: {
      moduleId: string;
      data: UpdateModuleInput;
    }) => {
      const response = await axiosPrivate.put(
        `/questions/category/modules/${moduleId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Module updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["learningModules", categoryId],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update module.");
    },
  });
}

export function useDeleteLearningModule(categoryId: string | null) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      const response = await axiosPrivate.delete(
        `/questions/category/modules/${moduleId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Module deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["learningModules", categoryId],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete module.");
    },
  });
}
