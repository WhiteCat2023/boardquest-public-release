import { CheckCircle2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PendingReviewAuthor } from "@/features/question-bank";

interface ApproveAuthorQuestionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  author: PendingReviewAuthor | null;
  isLoading?: boolean;
  onConfirm: () => void;
}

export default function ApproveAuthorQuestionsDialog({
  isOpen,
  onOpenChange,
  author,
  isLoading = false,
  onConfirm,
}: ApproveAuthorQuestionsDialogProps) {
  if (!author) return null;

  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6 bg-card border border-border rounded-2xl shadow-2xl text-foreground font-sans animate-in fade-in-0 zoom-in-95">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div className="text-left">
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Approve All Pending Questions
              </AlertDialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Batch review approval for faculty submission
              </p>
            </div>
          </div>

          {/* Author Card Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80 mt-2 text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9 rounded-xl border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 leading-tight">
                <span className="text-xs font-bold text-foreground block truncate">
                  {author.name}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                  {author.email}
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 shrink-0 ml-2"
            >
              {author.pendingCount} Question{author.pendingCount !== 1 ? "s" : ""}
            </Badge>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2 text-left">
            Are you sure you want to approve all{" "}
            <strong className="text-foreground font-semibold">
              {author.pendingCount} pending question{author.pendingCount !== 1 ? "s" : ""}
            </strong>{" "}
            submitted by <strong className="text-foreground font-semibold">{author.name}</strong>?
            <br />
            <span className="text-[11px] text-muted-foreground/80 mt-1 block">
              Approved questions will be marked as active and made immediately available in the question bank.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-9 px-4 rounded-xl bg-muted text-foreground border-border hover:bg-accent text-xs font-semibold cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-sm border border-emerald-600/20"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Approve All ({author.pendingCount})
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
