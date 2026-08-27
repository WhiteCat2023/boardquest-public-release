import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

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


