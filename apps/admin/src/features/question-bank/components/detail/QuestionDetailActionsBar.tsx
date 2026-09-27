import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QuestionStatus, type Question } from "@/types/question";
import { useQuestionDetailActions } from "../../api/useQuestionDetailActions";

interface QuestionDetailActionsBarProps {
  question: Question;
  showComments: boolean;
  onToggleComments: () => void;
  commentsCount: number;
  unresolvedCommentsCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  onOpenComments?: () => void;
}

export function QuestionDetailActionsBar({
  question,
  showComments,
  onToggleComments,
  commentsCount,
  unresolvedCommentsCount,
  canEdit,
  canDelete,
  canApprove,
  onOpenComments,
}: QuestionDetailActionsBarProps) {
  const navigate = useNavigate();
  const hasUnresolvedComments = unresolvedCommentsCount > 0;

  const {
    approveMutation,
    submitRevisionMutation,
    handleSubmitRevisions,
    handleDelete,
  } = useQuestionDetailActions({
    question,
    questionId: question.id,
    onOpenComments,
  });

  return (
    <div className="p-3 px-5 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2.5 rounded-b-xl">
      <Button
        type="button"
        variant="outline"
        onClick={onToggleComments}
        className={`cursor-pointer font-semibold px-3.5 py-1 rounded-lg h-8 text-xs flex items-center gap-1.5 transition-all ${
          showComments
            ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-xs"
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        <MessageSquare size={13} />
        <span>Comments</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
            showComments
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
          }`}
        >
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
            onClick={() => navigate(`/question-bank/edit/${question.id}`)}
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

        {(question.status === QuestionStatus.PENDING_REVISION ||
          (question.status as string) === "NEEDS_REVISION") && (
          <Button
            type="button"
            onClick={() => handleSubmitRevisions(unresolvedCommentsCount)}
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
  );
}

export default QuestionDetailActionsBar;
