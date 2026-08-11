import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export function useCategoryDetail(categoryId?: string | null) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["categoryDetail", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const response = await axiosPrivate.get(
        `/questions/category/single/${categoryId}`
      );
      return response.data?.data?.category ?? response.data?.category ?? null;
    },
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 2,
  });
}
