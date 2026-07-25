import { Link, useNavigate, useParams } from "react-router-dom";
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
  Globe,
  EyeOff,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";
import { QuestionStatus, UserRole } from "@/types/question";
import { getDifficultyColor, getInitials, getStatusColor } from "@/utils/style";
import { useQuestionDetail } from "@/hooks/useQuestionBank";

export default function ViewQuestion() {
  const { questionId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

  const { data: question, isLoading, error } = useQuestionDetail(questionId);

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
              status: QuestionStatus.NEEDS_REVISION,
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

  const publishMutation = useMutation({
    mutationFn: async (isPublished: boolean) => {
      await axiosPrivate.put(`/questions/publish/${questionId}`, { isPublished });
    },
    onSuccess: (_, isPublished) => {
      queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      showUndoToast({
        title: isPublished ? "Question Published" : "Question Unpublished",
        message: isPublished ? "Question is now Live" : "Question moved to Shared Library",
        duration: 5000,
        onUndo: async () => {
          try {
            await axiosPrivate.put(`/questions/publish/${questionId}`, { isPublished: !isPublished });
            toast.info("Reverted publish state.");
            queryClient.invalidateQueries({ queryKey: ["questionDetail", questionId] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
          } catch (err: any) {
            toast.error("Failed to undo publish action.");
          }
        },
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update publish state.");
    }
  });

  const handleTogglePublish = () => {
    if (!question) return;
    const nextState = !question.isPublished;
    publishMutation.mutate(nextState);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin border-4 border-primary border-t-transparent rounded-full w-12 h-12" />
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

  const authorId = typeof question?.author === "object"
    ? (question?.author as any).id
    : question?.authorId;

  const isAuthor = authorId === currentUserId;
  const canEdit = (currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TEAMLEAD || (currentUserRole === UserRole.TEACHER && isAuthor)) && !question?.isPublished;
  const canDelete = (currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || (currentUserRole === UserRole.TEACHER && isAuthor)) && !question?.isPublished;
  const canPublish = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TEAMLEAD;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300">
      {/* Back navigation */}
      <Link 
        to="/question-bank" 
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Question Bank
      </Link>

      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40">
          <div className="flex items-center gap-3">
            <span className="rounded bg-muted px-3 py-1.5 text-xs font-extrabold tracking-wide text-muted-foreground border border-border">
              Q-{question.id.slice(-6).toUpperCase()}
            </span>
            <span className="rounded bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide border border-indigo-500/20">
              {question.category?.name || "Subject Category"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {question.isPublished && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Published
              </span>
            )}
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${getStatusColor(question.status)}`}>
              {question.status}
            </span>
          </div>
        </div>

        {/* Question Details Section */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Question is published warning banner */}
          {question.isPublished && (
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Globe size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                This question is <strong>published</strong>. To edit or delete this question, you must unpublish it first.
              </span>
            </div>
          )}

          {/* Question text */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question Prompt</span>
            <h2 className="text-xl font-bold text-foreground leading-relaxed">
              {question.question || question.text}
            </h2>
          </div>

          {/* Revision Comments (if status is NEEDS_REVISION) */}
          {question.status === QuestionStatus.NEEDS_REVISION && question.feedback && (
            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-sm font-medium text-destructive">
              <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-1">Revision Comments / Notes:</span>
              {question.feedback}
            </div>
          )}

          {/* Options Section */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {question.type === "MCQ" ? "Options & Key" : question.type === "TRUE_FALSE" ? "True / False Key" : "Correct Answer Wording"}
            </span>

            <div className="flex flex-col gap-3">
              {question.type === "MCQ" && (
                (question.choices || []).map((choice: string, idx: number) => {
                  const isCorrect = choice.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isCorrect 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs" 
                          : "bg-muted/40 border-border text-foreground/90"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect 
                          ? "bg-emerald-500 text-white" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isCorrect ? <Check size={14} className="stroke-[3]" /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm leading-relaxed">{choice}</span>
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
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isCorrect 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs" 
                          : "bg-muted/40 border-border text-foreground/90"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect 
                          ? "bg-emerald-500 text-white" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isCorrect ? <Check size={14} className="stroke-[3]" /> : (idx === 0 ? "T" : "F")}
                      </div>
                      <span className="text-sm leading-relaxed">{choice}</span>
                    </div>
                  );
                })
              )}

              {question.type === "SHORT_ANSWER" && (
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                  <Check size={16} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide">Correct Wording:</span>
                    <span className="text-sm leading-relaxed">{question.correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
            {/* Topic */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Topic Benchmark</span>
                <span className="text-sm font-semibold text-foreground">{question.topic || "N/A"}</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <GraduationCap size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Difficulty Level</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted text-muted-foreground rounded-xl">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Question Type</span>
                <span className="text-sm font-semibold text-foreground">{question.type}</span>
              </div>
            </div>
          </div>

          {/* Author profile & creation timestamp */}
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border mt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary border border-primary/20">
                {getInitials(authorName)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{authorName || "Faculty Reviewer"}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">Author Profile</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-medium text-muted-foreground">
              <span>Created on: </span>
              <span className="font-semibold text-foreground">{new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

        </div>

        {/* Action Footer Bar */}
        <div className="p-6 border-t border-border bg-muted/40 flex justify-end gap-3.5">
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold px-5 py-2.5 rounded-xl h-auto"
            >
              <Trash2 size={16} />
              Delete Question
            </Button>
          )}

          {canEdit && (
            <Button
              type="button"
              onClick={() => navigate(`/question-bank/edit/${questionId}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
            >
              <Edit size={16} />
              Edit Question
            </Button>
          )}

          {question.status === QuestionStatus.NEEDS_REVISION ? (
            <Button
              type="button"
              onClick={() => submitRevisionMutation.mutate()}
              disabled={submitRevisionMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {submitRevisionMutation.isPending ? (
                <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <>
                  <Send size={16} />
                  Submit Revisions
                </>
              )}
            </Button>
          ) : (
            canPublish && (
              <Button
                type="button"
                onClick={handleTogglePublish}
                disabled={publishMutation.isPending || (question.status !== QuestionStatus.APPROVED && !question.isPublished)}
                className={`font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 cursor-pointer transition-all ${
                  question.isPublished
                    ? "border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
                title={
                  question.status !== QuestionStatus.APPROVED && !question.isPublished
                    ? "Question must be approved before publishing."
                    : ""
                }
              >
                {publishMutation.isPending ? (
                  <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" />
                ) : question.isPublished ? (
                  <>
                    <EyeOff size={16} />
                    Unpublish Question
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Publish Question
                  </>
                )}
              </Button>
            )
          )}
        </div>

      </div>
    </div>
  );
}
