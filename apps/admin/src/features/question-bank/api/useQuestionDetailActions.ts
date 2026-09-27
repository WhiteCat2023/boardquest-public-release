import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";
import { QuestionStatus, type Question } from "@/types/question";

interface UseQuestionDetailActionsProps {
  question?: Question | null;
  questionId?: string;
  onOpenComments?: () => void;
}

export function useQuestionDetailActions({
  question,
  questionId,
  onOpenComments,
}: UseQuestionDetailActionsProps) {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!questionId) return;
      await axiosPrivate.post("/questions/bulk/approve", { ids: [questionId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questionDetail", questionId],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question approved successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve question.");
    },
  });

  const submitRevisionMutation = useMutation({
    mutationFn: async () => {
      if (!questionId) return;
      await axiosPrivate.post("/questions/bulk/status", {
        ids: [questionId],
        status: QuestionStatus.PENDING_REVIEW,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questionDetail", questionId],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      showUndoToast({
        title: "Revisions Submitted",
        message: "Question status updated to Pending Review",
        duration: 5000,
        onUndo: async () => {
          try {
            await axiosPrivate.post("/questions/bulk/status", {
              ids: [questionId],
              status: QuestionStatus.PENDING_REVISION,
            });
            toast.info("Reverted revision submission.");
            queryClient.invalidateQueries({
              queryKey: ["questionDetail", questionId],
            });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
          } catch (err: any) {
            toast.error("Failed to undo revision submission.");
          }
        },
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit revisions.");
    },
  });

  const handleSubmitRevisions = (unresolvedCommentsCount: number) => {
    if (unresolvedCommentsCount > 0) {
      toast.error(
        `Cannot resubmit question while there ${
          unresolvedCommentsCount === 1
            ? "is 1 unresolved comment"
            : `are ${unresolvedCommentsCount} unresolved comments`
        }. Please resolve all comments first.`,
      );
      onOpenComments?.();
      return;
    }
    submitRevisionMutation.mutate();
  };

  const handleDelete = () => {
    if (!questionId) return;

    queryClient.setQueriesData<any>({ queryKey: ["questions"] }, (old: any) => {
      if (!old) return old;
      if (old.questions) {
        return {
          ...old,
          questions: old.questions.filter((q: any) => q.id !== questionId),
        };
      }
      return old;
    });

    navigate("/question-bank");

    const timeoutId = setTimeout(async () => {
      try {
        await axiosPrivate.delete(`/questions/${questionId}`);
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            "Failed to delete question permanently.",
        );
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      }
    }, 4000);

    const questionText =
      question?.question || question?.text || "Selected question";

    showUndoToast({
      title: "Question Deleted",
      message: questionText,
      onUndo: () => {
        clearTimeout(timeoutId);
        queryClient.invalidateQueries({ queryKey: ["questions"] });
        toast.success("Delete action undone.");
      },
      duration: 4000,
    });
  };

  return {
    approveMutation,
    submitRevisionMutation,
    handleSubmitRevisions,
    handleDelete,
  };
}

export default useQuestionDetailActions;
