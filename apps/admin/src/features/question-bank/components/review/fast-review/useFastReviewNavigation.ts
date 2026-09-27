import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import type { Question } from "@/types/question";

interface UseFastReviewNavigationProps {
  questions: Question[];
  initialQuestionId?: string | null;
  onRefresh?: () => void;
  onBackToTable?: () => void;
  onOpenShortcuts: () => void;
}

export function useFastReviewNavigation({
  questions,
  initialQuestionId,
  onRefresh,
  onBackToTable,
  onOpenShortcuts,
}: UseFastReviewNavigationProps) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialQuestionId && questions.length > 0) {
      const idx = questions.findIndex((q) => q.id === initialQuestionId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  // Sync index if initialQuestionId changes
  useEffect(() => {
    if (initialQuestionId && questions.length > 0) {
      const idx = questions.findIndex((q) => q.id === initialQuestionId);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    }
  }, [initialQuestionId, questions]);

  // Clamp index if questions array changes
  useEffect(() => {
    if (currentIndex >= questions.length && questions.length > 0) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions.length, currentIndex]);

  const activeQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await axiosPrivate.post("/questions/bulk/approve", { ids: [questionId] });
    },
    onSuccess: () => {
      toast.success("Question approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      onRefresh?.();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve question.");
    },
  });

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleApprove = useCallback(() => {
    if (!activeQuestion || approveMutation.isPending) return;
    approveMutation.mutate(activeQuestion.id);
  }, [activeQuestion, approveMutation]);

  const handleEdit = useCallback(() => {
    if (!activeQuestion) return;
    navigate(`/question-bank/edit/${activeQuestion.id}`);
  }, [activeQuestion, navigate]);

  const handleFocusComment = useCallback(() => {
    const commentInput = document.querySelector<HTMLTextAreaElement>(
      "textarea[placeholder*='comment'], textarea[placeholder*='feedback'], textarea[placeholder*='notes']"
    );
    if (commentInput) {
      commentInput.focus();
    }
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "Escape" && onBackToTable) {
        e.preventDefault();
        onBackToTable();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleApprove();
      } else if (e.key === "j" || e.key === "J" || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        handleFocusComment();
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleEdit();
      } else if (e.key === "?") {
        e.preventDefault();
        onOpenShortcuts();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleApprove,
    handleNext,
    handlePrev,
    handleFocusComment,
    handleEdit,
    onBackToTable,
    onOpenShortcuts,
  ]);

  return {
    currentIndex,
    setCurrentIndex,
    activeQuestion,
    totalQuestions,
    isApproving: approveMutation.isPending,
    handleNext,
    handlePrev,
    handleApprove,
    handleEdit,
    handleFocusComment,
  };
}
