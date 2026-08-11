import { Clock, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/utils/style";
import type { QuestionComment } from "../../api/useQuestionComments";

interface CommentItemProps {
  comment: QuestionComment;
  currentUserId?: string;
  currentUserRole?: string;
  onToggleResolve: (commentId: string, isResolved: boolean) => void;
  onDelete: (commentId: string) => void;
  isResolvePending?: boolean;
  isDeletePending?: boolean;
}

export default function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  onToggleResolve,
  onDelete,
  isResolvePending = false,
  isDeletePending = false,
}: CommentItemProps) {
  const authorName = comment.author?.name || "Educator";
  const authorRole = comment.author?.role || "USER";
  const isMine = comment.authorId === currentUserId;
  const isResolved = Boolean(comment.isResolved);

  const canDelete = Boolean(
    currentUserId &&
      (comment.authorId === currentUserId ||
        ["SUPERADMIN", "ADMIN", "TEAMLEAD"].includes(currentUserRole || ""))
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
      case "ADMIN":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "TEAMLEAD":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "TEACHER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      className={`p-3 px-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
        isResolved
          ? "bg-emerald-500/5 border-emerald-500/25 border-l-4 border-l-emerald-500"
          : isMine
          ? "bg-primary/5 border-primary/20 shadow-2xs"
          : "bg-muted/20 border-border/80"
      }`}
    >
      {/* Author & Action Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Avatar + Author Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary border border-primary/20 shrink-0">
            {getInitials(authorName)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground truncate max-w-[130px]" title={authorName}>
                {authorName}
              </span>
              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 ${getRoleBadgeStyle(authorRole)}`}>
                {authorRole}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock size={9} className="shrink-0" />
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              •{" "}
              {new Date(comment.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Right: Resolution Toggle Icon Button & Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onToggleResolve(comment.id, !isResolved)}
            disabled={isResolvePending}
            title={isResolved ? "Mark comment as unresolved" : "Mark comment as resolved"}
            className={`h-6 w-6 rounded-md cursor-pointer transition-all ${
              isResolved
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-background border-border text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 size={13} className={isResolved ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"} />
          </Button>

          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(comment.id)}
              disabled={isDeletePending}
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
              title="Delete comment"
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Comment Body */}
      <div className="pl-9">
        <p className={`text-xs leading-normal whitespace-pre-wrap ${
          isResolved ? "text-muted-foreground/80 font-normal" : "text-foreground font-normal"
        }`}>
          {comment.content}
        </p>
      </div>
    </div>
  );
}
