import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Question } from "@/types/question";
import { useQuery } from "@tanstack/react-query";
export interface QuestionFilters {
    search?: string;
    category?: string;
    difficulty?: string;
    type?: string;
    status?: string;
    cursor?: string;
    limit?: number;
    authorId?: string;
    isPublished?: boolean;
}

export function useQuestionBank(filters?: QuestionFilters) {
    const axiosPrivate = useAxiosPrivate();
 
    const getQuestions = async () => {
        // Remove empty strings or undefined properties to avoid sending empty params to API
        const cleanParams = filters
            ? Object.fromEntries(
                  Object.entries(filters).filter(([_, val]) => val !== undefined && val !== "")
              )
            : undefined;

        const response = await axiosPrivate.get("/questions/get", {
            params: cleanParams,
        });
        return {
            questions: (response.data?.data?.questions ?? []) as Question[],
            nextCursor: response.data?.data?.nextCursor as string | null,
            hasNextPage: !!response.data?.data?.hasNextPage,
        };
    };

    return useQuery({
        queryKey: ["questions", filters],
        queryFn: getQuestions,
    });
}