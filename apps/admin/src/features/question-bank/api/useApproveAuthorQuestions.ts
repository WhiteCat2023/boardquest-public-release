import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showFeedback } from "@/components/modal";

export function useApproveAuthorQuestions() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authorId: string) => {
      const res = await axiosPrivate.get("/questions/get", {
        params: {
          status: "PENDING_REVIEW,PENDING_REVISION",
          authorId,
          limit: 100,
        },
      });
      const qList = res.data?.data?.questions || res.data?.data || [];
      const pendingReviewOnly = qList.filter(
        (q: any) => q.status === "PENDING_REVIEW",
      );
      const pendingRevisionCount = qList.length - pendingReviewOnly.length;

      if (pendingRevisionCount > 0) {
        showFeedback.warning(
          `Warning: ${pendingRevisionCount} question(s) for this author are in Pending Revision status and cannot be approved until resubmitted.`,
        );
      }

      const ids = pendingReviewOnly.map((q: any) => q.id);
      if (ids.length === 0) {
        showFeedback.error(
          "No questions in Pending Review status available to approve for this author.",
        );
        throw new Error("No pending review questions to approve");
      }
      await axiosPrivate.post("/questions/bulk/approve", { ids });
    },
    onSuccess: () => {
      showFeedback.success("Approved all pending questions for selected author.");
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      if (err.message !== "No pending review questions to approve") {
        showFeedback.error(
          err.response?.data?.message || "Failed to approve author questions.",
        );
      }
    },
  });
}

export default useApproveAuthorQuestions;
