import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Keyboard,
  Tag,
  BookOpen,
  Sparkles,
  Layers,
  Award,
  FileCheck2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { type Question, QuestionStatus } from "@/types/question";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import QuestionCommentsPanel from "../QuestionCommentsPanel";
import FastReviewShortcutsModal from "./FastReviewShortcutsModal";

interface FastReviewWorkspaceProps {
  questions: Question[];
  isLoading: boolean;
  onRefresh?: () => void;
  selectedAuthor?: any;
}

export default function FastReviewWorkspace({
  questions,
  isLoading,
  onRefresh,
  selectedAuthor,
}: FastReviewWorkspaceProps) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Clamp index if questions array changes
  useEffect(() => {
    if (currentIndex >= questions.length && questions.length > 0) {
      setCurrentIndex(questions.length - 1);
    }
  }, [questions.length, currentIndex]);

  const activeQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0
      ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
      : 0;

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

      if (e.key === "a" || e.key === "A") {
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
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleApprove, handleNext, handlePrev, handleFocusComment, handleEdit]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-2xl">
        <Spinner size="lg" variant="default" />
        <p className="text-xs font-semibold text-muted-foreground">
          Loading pending questions for review...
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0 || !activeQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border border-border rounded-2xl font-sans">
        <div className="p-3.5 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 animate-in zoom-in-50">
          <FileCheck2 size={32} />
        </div>
        <h3 className="text-base font-bold text-foreground">
          All Questions Reviewed!
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {selectedAuthor
            ? `There are no remaining pending questions for ${selectedAuthor.name}.`
            : "The review queue for the selected criteria is completely clear."}
        </p>
      </div>
    );
  }

  const questionContent =
    (activeQuestion as any).question || activeQuestion.text || "";
  const subjectName = activeQuestion.category?.name || "Major Subject";
  const topicName = activeQuestion.topic;
  const questionType = activeQuestion.type || "MCQ";
  const imageUrl = (activeQuestion as any).imageUrl;
  const choiceImages = (activeQuestion as any).choiceImages || [];

  const rawChoices =
    (activeQuestion as any).choices ||
    (activeQuestion as any).options ||
    (activeQuestion as any).choiceOptions ||
    [];

  const choicesList = Array.isArray(rawChoices)
    ? rawChoices
    : typeof rawChoices === "object" && rawChoices !== null
      ? Object.values(rawChoices)
      : [];

  const correctAnswer =
    (activeQuestion as any).correctAnswer ||
    (activeQuestion as any).answer ||
    "";
  const rationale =
    (activeQuestion as any).explanation ||
    (activeQuestion as any).rationale ||
    "";

  const commentsCount =
    activeQuestion._count?.comments ??
    activeQuestion._count?.questionComments ??
    (Array.isArray(activeQuestion.comments) ? activeQuestion.comments.length : 0);

  const displayStatus =
    (activeQuestion.status === "PENDING_REVISION" ||
      (activeQuestion.status as any) === "NEEDS_REVISION") &&
    commentsCount === 0
      ? "PENDING_REVIEW"
      : activeQuestion.status || "PENDING_REVIEW";

  return (
    <div className="flex flex-col gap-3 font-sans w-full animate-in fade-in duration-200">
      {/* ── Top Progress & Info Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-card border border-border shadow-2xs">
        {/* Left: Progress & Counter */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono font-bold bg-primary/10 text-primary border-primary/20 px-1.5 py-0 rounded-md"
              >
                {progressPercent}% Complete
              </Badge>
            </div>
            {/* Progress bar */}
            <div className="w-36 sm:w-48 bg-muted h-1.5 rounded-full overflow-hidden mt-1.5 border border-border/40">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Jump dots + Shortcuts button */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsShortcutsOpen(true)}
            className="h-7 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border-border bg-card rounded-lg gap-1.5 cursor-pointer shadow-2xs"
            title="View keyboard shortcuts"
          >
            <Keyboard size={13} className="text-primary" />
            <span>Shortcuts</span>
            <kbd className="px-1.5 py-0.2 bg-muted text-[9px] font-mono rounded border border-border">
              ?
            </kbd>
          </Button>
        </div>
      </div>

      {/* ── Main Split View Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ── Left Column: Question Details & Inspection (7 Cols) ── */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Question Card Header */}
            <div className="p-3 px-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-card px-2 py-0.5 text-[11px] font-mono font-extrabold tracking-wider text-foreground border border-border shadow-2xs">
                  Q-{activeQuestion.id.slice(-4).toUpperCase()}
                </span>
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary flex items-center gap-1">
                  <BookOpen size={11} />
                  {subjectName}
                </span>
                {topicName && (
                  <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Tag size={10} className="text-muted-foreground/60" />
                    {topicName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${getDifficultyColor(activeQuestion.difficulty)}`}
                >
                  {activeQuestion.difficulty}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(displayStatus)}`}
                >
                  {displayStatus}
                </span>
              </div>
            </div>

            {/* Question Stem */}
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Question Stem
                </span>
                <p className="text-sm sm:text-base font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                  {questionContent}
                </p>
              </div>

              {/* Question Image Attachment */}
              {imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Question Image Attachment
                  </span>
                  <div className="p-2 bg-muted/20 border border-border rounded-xl flex items-center justify-center max-h-[280px] overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Question attachment"
                      className="max-h-[260px] w-auto max-w-full rounded-lg object-contain border border-border"
                    />
                  </div>
                </div>
              )}

              {/* Choices / Options (for MCQ or any question with choices) */}
              {choicesList.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Layers size={11} /> Answer Choices & Keys
                  </span>

                  <div className="flex flex-col gap-2">
                    {choicesList.map((opt: any, idx: number) => {
                      const letter = String.fromCharCode(65 + idx);
                      const optText =
                        typeof opt === "string"
                          ? opt
                          : opt?.text || opt?.label || "";
                      const isCorrect =
                        opt?.isCorrect === true ||
                        opt?.correct === true ||
                        optText.toLowerCase().trim() === String(correctAnswer).toLowerCase().trim() ||
                        letter === String(correctAnswer).trim().toUpperCase();
                      const choiceImg = choiceImages[idx];

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-2xs"
                              : "bg-muted/30 border-border/70 text-foreground/90 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-card border border-border text-muted-foreground"
                              }`}
                            >
                              {letter}
                            </div>

                            <div className={`text-xs sm:text-sm font-medium pt-0.5 leading-normal ${isCorrect ? "font-bold text-emerald-800 dark:text-emerald-300" : ""}`}>
                              {optText}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {choiceImg && (
                              <img
                                src={choiceImg}
                                alt={`Choice ${letter}`}
                                className="h-9 w-9 object-cover rounded-lg border border-border shrink-0"
                              />
                            )}

                            {isCorrect && (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md gap-1 shrink-0">
                                <Check size={11} className="stroke-[3]" />
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Expected Answer Display for True/False or Short Answer */
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Expected Correct Answer
                  </span>
                  <div className="p-3.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <Check size={14} className="text-emerald-600" />
                      <span>{correctAnswer || "Not specified"}</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                      Key
                    </span>
                  </div>
                </div>
              )}

              {/* Rationale / Explanation */}
              {rationale && (
                <div className="mt-2 p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Sparkles size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Medical Rationale & Explanation
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {rationale}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action Bar for Current Question */}
            <div className="p-3 px-4 border-t border-border bg-muted/40 flex flex-wrap items-center justify-between gap-2.5">
              {/* Previous / Next buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-foreground gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                  <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
                    K
                  </kbd>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentIndex === totalQuestions - 1}
                  className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-foreground gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                  <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
                    J
                  </kbd>
                </Button>
              </div>

              {/* Edit and Approve Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 px-3 rounded-lg text-xs font-semibold border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                  <kbd className="hidden sm:inline-block px-1 bg-muted text-[9px] font-mono rounded border border-border">
                    E
                  </kbd>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleApprove}
                  disabled={
                    approveMutation.isPending ||
                    activeQuestion.status === QuestionStatus.APPROVED
                  }
                  className="h-8 px-4 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-2xs border border-emerald-600/20 disabled:opacity-50"
                >
                  {approveMutation.isPending ? (
                    <Spinner size="xs" variant="current" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Approve & Next</span>
                  <kbd className="hidden sm:inline-block px-1.5 bg-emerald-700 text-white text-[9px] font-mono rounded">
                    A
                  </kbd>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Integrated Comments & Discussion Panel (5 Cols) ── */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <QuestionCommentsPanel questionId={activeQuestion.id} />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <FastReviewShortcutsModal
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </div>
  );
}
