import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Question } from "@/types/question";
import { useQuery } from "@tanstack/react-query";

export interface QuestionFilters {
    search?: string;
    category?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    status?: string;
    cursor?: string;
    limit?: number | string;
    authorId?: string;
}

export interface PendingReviewAuthor {
    id: string;
    name: string;
    email: string;
    role: string;
    pendingCount: number;
    latestSubmissionAt?: string;
}

export function useQuestionBank(
    filters?: QuestionFilters,
    options?: { enabled?: boolean; refetchInterval?: number; staleTime?: number }
) {
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
            total: typeof rawData?.total === "number" ? rawData.total : undefined,
        };
    };

    return useQuery({
        queryKey: ["questions", filters],
        queryFn: getQuestions,
        enabled: options?.enabled ?? true,
        refetchInterval: options?.refetchInterval,
        staleTime: options?.staleTime,
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

export function usePendingReviewAuthors(
    params?: { search?: string },
    options?: { enabled?: boolean; refetchInterval?: number }
) {
    const axiosPrivate = useAxiosPrivate();

    return useQuery({
        queryKey: ["pendingReviewAuthors", params],
        queryFn: async () => {
            const cleanParams = params?.search?.trim()
                ? { search: params.search.trim() }
                : undefined;

            const response = await axiosPrivate.get("/questions/review/authors", {
                params: cleanParams,
            });
            return (response.data?.data?.authors || []) as PendingReviewAuthor[];
        },
        enabled: options?.enabled ?? true,
        refetchInterval: options?.refetchInterval,
        staleTime: 1000 * 30,
    });
}

export function usePendingReviewCount(options?: { enabled?: boolean }) {
    const { data: authors = [], isLoading } = usePendingReviewAuthors(undefined, {
        enabled: options?.enabled ?? true,
        refetchInterval: 30000,
    });

    const totalQuestions = authors.reduce((sum, a) => sum + (a.pendingCount || 0), 0);
    const authorsCount = authors.length;

    return {
        totalQuestions,
        authorsCount,
        hasPending: totalQuestions > 0,
        isLoading,
    };
}

export function useMyPendingRevisionCount(authorId?: string, options?: { enabled?: boolean }) {
    const isEnabled = (options?.enabled ?? true) && Boolean(authorId);

    const { data, isLoading } = useQuestionBank(
        isEnabled
            ? {
                  authorId,
                  status: "PENDING_REVISION",
                  limit: 1,
              }
            : undefined,
        {
            enabled: isEnabled,
            refetchInterval: 30000,
            staleTime: 1000 * 30,
        }
    );

    const pendingRevisionCount = data?.total ?? 0;

    return {
        pendingRevisionCount,
        hasPendingRevision: pendingRevisionCount > 0,
        isLoading,
    };
}