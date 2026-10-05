import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useQuestionListStore } from "@/store/QuestionListStore";

export interface SaveQuestionPayload {
  id?: string;
  question: string;
  imageUrl?: string;
  type: string;
  categoryId: string;
  topic: string;
  difficulty: string;
  correctAnswer: string;
  choices: string[];
  choiceImages?: string[];
}

export function useCreateQuestion() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveQuestionPayload) => {
      const response = await axiosPrivate.post("/questions/create", payload);
      return response.data;
    },
    onSuccess: () => {
      useQuestionListStore.getState().resetPagination();
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      queryClient.invalidateQueries({ queryKey: ["questionStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardAnalyticsSummary"] });
      toast.success("New question added to repository!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create question.");
    },
  });
}

export function useUpdateQuestion(questionId?: string) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveQuestionPayload) => {
      const id = payload.id || questionId;
      const response = await axiosPrivate.put(`/questions/update/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      if (questionId) {
        queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      }
      toast.success("Question updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update question.");
    },
  });
}
