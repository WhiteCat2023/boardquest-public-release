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
        const rawData = response.data?.data;
        const questionsList = Array.isArray(rawData)
            ? rawData
            : (rawData?.questions ?? []);

        return {
            questions: questionsList as Question[],
            nextCursor: rawData?.nextCursor as string | null,
            hasNextPage: !!rawData?.hasNextPage,
        };
    };

    return useQuery({
        queryKey: ["questions", filters],
        queryFn: getQuestions,
    });
}

export function useQuestionDetail(questionId: string | null | undefined) {
    const axiosPrivate = useAxiosPrivate();

    return useQuery({
        queryKey: ["questionDetail", questionId],
        queryFn: async () => {
            if (!questionId) return null;
            const response = await axiosPrivate.get(`/questions/get/${questionId}`);
            return (response.data?.data?.question || response.data?.data) as Question;
        },
        enabled: !!questionId,
        staleTime: 1000 * 60 * 5,
    });
}

export function usePendingReviewAuthors() {
    const axiosPrivate = useAxiosPrivate();

    return useQuery({
        queryKey: ["pendingReviewAuthors"],
        queryFn: async () => {
            const response = await axiosPrivate.get("/questions/review/authors");
            return (response.data?.data?.authors || []) as Array<{
                id: string;
                name: string;
                email: string;
                role: string;
                department?: string;
                pendingCount: number;
                latestSubmissionAt?: string;
            }>;
        },
    });
}