import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface QuestionCommentAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface QuestionComment {
  id: string;
  questionId: string;
  authorId: string;
  author: QuestionCommentAuthor;
  content: string;
  isResolved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useQuestionComments(questionId: string | null | undefined) {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["questionComments", questionId],
    queryFn: async () => {
      if (!questionId) return [];
      const response = await axiosPrivate.get(`/questions/${questionId}/comments`);
      return (response.data?.data?.comments || []) as QuestionComment[];
    },
    enabled: Boolean(questionId),
  });
}

export function useAddQuestionComment(questionId: string) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await axiosPrivate.post(`/questions/${questionId}/comments`, { content });
      return response.data?.data?.comment as QuestionComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionComments", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Comment added successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add comment.");
    },
  });
}

export function useToggleResolveComment(questionId: string) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isResolved }: { commentId: string; isResolved?: boolean }) => {
      const response = await axiosPrivate.patch(`/questions/${questionId}/comments/${commentId}/resolve`, {
        isResolved,
      });
      return response.data?.data?.comment as QuestionComment;
    },
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({ queryKey: ["questionComments", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success(
        updatedComment?.isResolved
          ? "Comment marked as resolved."
          : "Comment marked as unresolved."
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update comment resolution status.");
    },
  });
}

export function useDeleteQuestionComment(questionId: string) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await axiosPrivate.delete(`/questions/${questionId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionComments", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Comment deleted.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete comment.");
    },
  });
}
