import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Tag, 
  Check,
  GraduationCap,
  Calendar,
  AlertCircle,
  Send,
  KeyRound,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";
import { QuestionStatus } from "@/types/question";
import { getDifficultyColor, getInitials, getStatusColor } from "@/utils/style";
import { useQuestionPermissions } from "@/features/question-bank";
import QuestionLifecycleStepper from "../components/QuestionLifecycleStepper";
import { useQuestionDetail } from "@/features/question-bank";
import { Spinner } from "@/components/ui/spinner";
import QuestionCommentsPanel from "../components/QuestionCommentsPanel";
import { useQuestionComments } from "../api/useQuestionComments";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function ViewQuestion() {
  const { questionId } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const from = location.state?.from || null;

  const handleBackNav = () => {
    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/question-bank");
    }
  };

  const { data: question, isLoading, error } = useQuestionDetail(questionId);
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [] } = useQuestionComments(questionId);
  const commentsCount = comments.length || (question as any)?._count?.comments || 0;
  const unresolvedCommentsCount = comments.filter((c) => !c.isResolved).length;
  const hasUnresolvedComments = unresolvedCommentsCount > 0;

  const handleSubmitRevisions = () => {
    if (hasUnresolvedComments) {
      toast.error(
        `Cannot resubmit question while there ${unresolvedCommentsCount === 1 ? "is 1 unresolved comment" : `are ${unresolvedCommentsCount} unresolved comments`}. Please resolve all comments first.`
      );
      setShowComments(true);
      return;
    }
    submitRevisionMutation.mutate();
  };

  const {
    canEdit,
    canDelete,
    canApprove,
    isAuthor,
  } = useQuestionPermissions(question);

  const approveMutation = useMutation({
    mutationFn: async () => {
      await axiosPrivate.post("/questions/bulk/approve", { ids: [questionId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question approved successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve question.");
    },
  });

  const submitRevisionMutation = useMutation({
    mutationFn: async () => {
      await axiosPrivate.post("/questions/bulk/status", {
        ids: [questionId],
        status: QuestionStatus.PENDING_REVIEW,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
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
            queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
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

  const handleDelete = () => {
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
        toast.error(err.response?.data?.message || "Failed to delete question permanently.");
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      }
    }, 4000);

    const questionText = question?.question || question?.text || "Selected question";

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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" variant="default" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center font-sans">
        <AlertCircle size={40} className="text-primary" />
        <div>
          <h3 className="text-lg font-bold text-foreground">Question Not Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This question could not be retrieved from the database.
          </p>
        </div>
        <Link to="/question-bank">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5">
            Back to Question Bank
          </Button>
        </Link>
      </div>
    );
  }

  const authorName = typeof question?.author === "object" 
    ? question?.author?.name 
    : question?.author;

  return (
    <div className={`flex flex-col lg:flex-row items-start gap-5 p-4 md:p-6 w-full ${showComments ? "max-w-6xl" : "max-w-3xl"} mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300 transition-all`}>
      {/* ── Main Column: Question Details ── */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-5">
      {/* Back navigation */}
      <button 
        type="button"
        onClick={handleBackNav} 
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={14} />
        {from?.includes("/review") ? "Back to Review Questions Desk" : "Back to Question Bank"}
      </button>

      {/* Visual Question Lifecycle Stepper */}
      <QuestionLifecycleStepper status={question.status} />

      {/* Main Question Card Container */}
      <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Section */}
        <div className="p-3.5 px-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-card px-2.5 py-1 text-[11px] font-mono font-extrabold tracking-wider text-foreground border border-border shadow-2xs flex items-center gap-1">
              Q-{question.id.slice(-6).toUpperCase()}
            </span>
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide border border-indigo-500/20 flex items-center gap-1">
              <Tag size={12} />
              {question.category?.name || "Subject Category"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(question.status)}`}>
              {question.status}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowComments(!showComments)}
              className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 h-7 ${
                showComments
                  ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <MessageSquare size={12} />
              <span>Comments</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                showComments ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
              }`}>
                {commentsCount}
              </span>
            </Button>
          </div>
        </div>

        {/* Question Details Section */}
        <div className="p-5 md:p-6 flex flex-col gap-5">
          
          {/* Question text prompt container */}
          <div className="p-3.5 px-4.5 rounded-xl bg-muted/20 border border-border/70 flex flex-col gap-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Question Prompt
              </span>
              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider border border-border px-1.5 py-0.2 rounded bg-card">
                {question.type}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-foreground leading-snug tracking-tight">
              {question.question || question.text}
            </h2>
          </div>

          {/* Options & Answer Key Section */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound size={11} className="text-primary" />
              {question.type === "MCQ" ? "Options & Answer Key" : question.type === "TRUE_FALSE" ? "True / False Key" : "Correct Answer Wording"}
            </span>

            <div className="flex flex-col gap-2">
              {question.type === "MCQ" && (
                (question.choices || []).map((choice: string, idx: number) => {
                  const isCorrect = choice.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 px-3.5 rounded-lg border transition-all ${
                        isCorrect 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs ring-1 ring-emerald-500/20" 
                          : "bg-card hover:bg-muted/30 border-border text-foreground/90"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
                        isCorrect 
                          ? "bg-emerald-600 text-white shadow-2xs" 
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {isCorrect ? <Check size={13} className="stroke-[3]" /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-xs md:text-sm leading-normal flex-1">{choice}</span>
                      {isCorrect && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {question.type === "TRUE_FALSE" && (
                ["True", "False"].map((choice, idx) => {
                  const isCorrect = choice.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 px-3.5 rounded-lg border transition-all ${
                        isCorrect 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs ring-1 ring-emerald-500/20" 
                          : "bg-card hover:bg-muted/30 border-border text-foreground/90"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
                        isCorrect 
                          ? "bg-emerald-600 text-white shadow-2xs" 
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {isCorrect ? <Check size={13} className="stroke-[3]" /> : (idx === 0 ? "T" : "F")}
                      </div>
                      <span className="text-xs md:text-sm leading-normal flex-1">{choice}</span>
                      {isCorrect && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {question.type === "SHORT_ANSWER" && (
                <div className="flex items-center gap-2.5 p-3 px-3.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs ring-1 ring-emerald-500/20">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white shadow-2xs">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide">Correct Wording:</span>
                    <span className="text-xs md:text-sm leading-normal">{question.correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Topic */}
            <div className="p-2.5 px-3 rounded-lg border border-border/80 bg-card hover:bg-muted/20 transition-all flex items-center gap-2.5 shadow-2xs">
              <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 shrink-0">
                <Tag size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Topic Benchmark</span>
                <span className="text-xs font-bold text-foreground truncate">{question.topic || "General"}</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="p-2.5 px-3 rounded-lg border border-border/80 bg-card hover:bg-muted/20 transition-all flex items-center gap-2.5 shadow-2xs">
              <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 shrink-0">
                <GraduationCap size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Difficulty Level</span>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>

            {/* Type */}
            <div className="p-2.5 px-3 rounded-lg border border-border/80 bg-card hover:bg-muted/20 transition-all flex items-center gap-2.5 shadow-2xs">
              <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 shrink-0">
                <Calendar size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Question Type</span>
                <span className="text-xs font-bold text-foreground truncate">{question.type}</span>
              </div>
            </div>
          </div>

          {/* Author Profile & Creation Timestamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 px-3.5 bg-muted/30 rounded-xl border border-border/80 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary border border-primary/20 shrink-0">
                {getInitials(authorName)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">{authorName || "Faculty Reviewer"}</span>
                <span className="text-[9px] font-medium text-muted-foreground">Author Profile</span>
              </div>
            </div>
            <div className="text-left sm:text-right text-[10px] font-medium text-muted-foreground">
              <span>Created: </span>
              <span className="font-semibold text-foreground">
                {new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(question.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

        </div>

        {/* Action Footer Bar */}
        <div className="p-3 px-5 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowComments(!showComments)}
            className={`cursor-pointer font-semibold px-3.5 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5 transition-all ${
              showComments
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-xs"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <MessageSquare size={13} />
            <span>Comments</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
              showComments ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            }`}>
              {commentsCount}
            </span>
          </Button>

          <div className="flex items-center gap-2">
            {canDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold px-3.5 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Delete
              </Button>
            )}

            {canEdit && (
              <Button
                type="button"
                onClick={() => navigate(`/question-bank/edit/${questionId}`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-4 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Edit size={13} />
                Edit
              </Button>
            )}

            {question.status === QuestionStatus.PENDING_REVIEW && canApprove && (
              <Button
                type="button"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-600/20"
              >
                {approveMutation.isPending ? (
                  <Spinner size="sm" variant="current" />
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    Approve
                  </>
                )}
              </Button>
            )}

            {(question.status === QuestionStatus.PENDING_REVISION || (question.status as string) === "NEEDS_REVISION") && (
              <Button
                type="button"
                onClick={handleSubmitRevisions}
                disabled={submitRevisionMutation.isPending}
                className={`font-semibold px-4 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  hasUnresolvedComments
                    ? "bg-amber-600/80 hover:bg-amber-600 text-white opacity-90"
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
                title={
                  hasUnresolvedComments
                    ? `Cannot resubmit while there are ${unresolvedCommentsCount} unresolved comment(s)`
                    : "Submit Revisions"
                }
              >
                {submitRevisionMutation.isPending ? (
                  <Spinner size="sm" variant="current" />
                ) : (
                  <>
                    <Send size={13} />
                    Submit Revisions
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>

      {/* ── Custom Right Sidebar: Question Discussion & Comments ── */}
      {showComments && questionId && (
        <aside className="w-full lg:w-[320px] shrink-0 self-start sticky top-6 transition-all duration-300 animate-in slide-in-from-right-4">
          <QuestionCommentsPanel
            questionId={questionId}
            onClose={() => setShowComments(false)}
          />
        </aside>
      )}
    </div>
  );
}

