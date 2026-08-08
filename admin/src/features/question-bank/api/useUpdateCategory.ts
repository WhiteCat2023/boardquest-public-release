import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface UpdateCategoryParams {
  categoryId: string;
  name: string;
  icon?: string;
}

export function useUpdateCategory() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, name, icon }: UpdateCategoryParams) => {
      const response = await axiosPrivate.put(
        `/questions/category/single/${categoryId}`,
        {
          categoryId,
          name,
          icon,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Subject updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["categoryDetail", variables.categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update subject.");
    },
  });
}
