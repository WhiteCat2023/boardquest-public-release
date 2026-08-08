import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { 
  useQuestionComments, 
  useAddQuestionComment, 
  useDeleteQuestionComment,
  useToggleResolveComment,
} from "../api/useQuestionComments";
import UnresolvedCommentsWarningBanner from "./comments/UnresolvedCommentsWarningBanner";
import CommentInputForm from "./comments/CommentInputForm";
import CommentFilterToolbar from "./comments/CommentFilterToolbar";
import CommentItem from "./comments/CommentItem";

interface QuestionCommentsPanelProps {
  questionId: string;
  onClose?: () => void;
}

export default function QuestionCommentsPanel({
  questionId,
  onClose,
}: QuestionCommentsPanelProps) {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId = currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;
  const currentUserRole = currentUser?.role || (auth as any)?.data?.user?.role;

  const [commentFilter, setCommentFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [visibleCount, setVisibleCount] = useState(5);

  const { data: comments = [], isLoading } = useQuestionComments(questionId);
  const addCommentMutation = useAddQuestionComment(questionId);
  const deleteCommentMutation = useDeleteQuestionComment(questionId);
  const toggleResolveMutation = useToggleResolveComment(questionId);

  const unresolvedCount = comments.filter((c) => !c.isResolved).length;
  const resolvedCount = comments.filter((c) => c.isResolved).length;

  const filteredComments = comments.filter((comment) => {
    if (commentFilter === "OPEN") return !comment.isResolved;
    if (commentFilter === "RESOLVED") return comment.isResolved;
    return true;
  });

  const visibleComments = filteredComments.slice(0, visibleCount);
  const hasMoreComments = filteredComments.length > visibleCount;
  const remainingCommentsCount = filteredComments.length - visibleCount;

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="p-3 px-4 border-b border-border bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <MessageSquare size={15} />
          </div>
          <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5 tracking-tight">
            Question Discussion & Comments
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.2 text-[10px] font-extrabold border border-primary/20">
              {comments.length}
            </span>
          </h3>
        </div>

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Main Container */}
      <div className="p-4 flex flex-col gap-3.5">
        
        {/* Unresolved Comments Warning Banner */}
        <UnresolvedCommentsWarningBanner unresolvedCount={unresolvedCount} />

        {/* Comment Input Form */}
        <CommentInputForm
          onSubmit={async (content) => {
            await addCommentMutation.mutateAsync(content);
          }}
          isPending={addCommentMutation.isPending}
        />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Comments Filter Dropdown */}
        <CommentFilterToolbar
          filter={commentFilter}
          onFilterChange={(newFilter) => {
            setCommentFilter(newFilter);
            setVisibleCount(5);
          }}
          totalCount={comments.length}
          unresolvedCount={unresolvedCount}
          resolvedCount={resolvedCount}
          showingCount={visibleComments.length}
          filteredCount={filteredComments.length}
        />

        {/* Comments Stream */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" variant="default" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
              <MessageSquare size={32} className="text-muted-foreground/50 mb-2" />
              <h4 className="text-sm font-bold text-foreground">
                {commentFilter === "OPEN"
                  ? "No open comments"
                  : commentFilter === "RESOLVED"
                  ? "No resolved comments"
                  : "No comments yet"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {commentFilter === "OPEN"
                  ? "All comments for this question have been resolved!"
                  : commentFilter === "RESOLVED"
                  ? "Resolved comments will be archived here for audit trail history."
                  : "Be the first to share notes, questions, or revision remarks on this item."}
              </p>
            </div>
          ) : (
            <>
              {visibleComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onToggleResolve={(commentId, isResolved) =>
                    toggleResolveMutation.mutate({ commentId, isResolved })
                  }
                  onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
                  isResolvePending={toggleResolveMutation.isPending}
                  isDeletePending={deleteCommentMutation.isPending}
                />
              ))}

              {/* View More Comments Button */}
              {hasMoreComments && (
                <div className="pt-2 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="w-full h-8 px-4 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
                  >
                    View More Comments ({remainingCommentsCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
