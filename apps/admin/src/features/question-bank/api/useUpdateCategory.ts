import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface UpdateCategoryParams {
  categoryId?: string;
  subjectId?: string;
  name: string;
  icon?: string;
}

export type UpdateSubjectParams = UpdateCategoryParams;

export function useUpdateCategory() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, subjectId, name, icon }: UpdateCategoryParams) => {
      const targetId = subjectId || categoryId;
      const response = await axiosPrivate.put(
        `/questions/category/single/${targetId}`,
        {
          categoryId: targetId,
          subjectId: targetId,
          name,
          icon,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      const targetId = variables.subjectId || variables.categoryId;
      toast.success("Subject updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["categoryDetail", targetId],
      });
      queryClient.invalidateQueries({
        queryKey: ["subjectDetail", targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update subject.");
    },
  });
}

export const useUpdateSubject = useUpdateCategory;
