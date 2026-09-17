import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg sm:max-w-lg p-0 overflow-hidden border border-border rounded-2xl bg-card shadow-2xl text-foreground font-sans gap-0">
        {/* Main Content Area */}
        <div className="p-5 sm:p-6 space-y-4 min-w-0 w-full">
          <DialogHeader className="gap-1.5 text-left pr-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  Approve All Pending Questions
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Batch review approval for faculty submission
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Author Card Info */}
          <div className="flex items-center justify-between p-3 px-3.5 rounded-xl bg-muted/40 border border-border min-w-0 w-full gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Avatar className="h-9 w-9 rounded-xl border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <span className="text-xs sm:text-sm font-bold text-foreground block truncate" title={author.name}>
                  {author.name}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate mt-0.5" title={author.email}>
                  {author.email}
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 shrink-0 whitespace-nowrap"
            >
              {author.pendingCount} Pending Questions
            </Badge>
          </div>

          {/* Prompt Description */}
          <div className="space-y-2 pt-1 text-xs text-muted-foreground leading-relaxed min-w-0 w-full">
            <p className="break-words">
              Are you sure you want to approve all{" "}
              <strong className="text-foreground font-semibold">
                {author.pendingCount} pending question{author.pendingCount !== 1 ? "s" : ""}
              </strong>{" "}
              submitted by{" "}
              <strong className="text-foreground font-semibold">{author.name}</strong>?
            </p>
            <div className="flex items-start gap-2 text-[11.5px] text-muted-foreground/90 pt-0.5 min-w-0">
              <Sparkles size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="min-w-0 flex-1 leading-normal break-words">
                Approved questions will be marked as active and made immediately available in the question bank.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 sm:px-6 bg-muted/40 border-t border-border flex items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-8.5 px-4 rounded-xl text-xs font-semibold border-border bg-card hover:bg-muted text-foreground cursor-pointer shadow-2xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-8.5 px-4 rounded-xl !bg-emerald-600 hover:!bg-emerald-700 !text-white text-xs font-bold gap-1.5 cursor-pointer shadow-2xs border border-emerald-600/30"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Approve All ({author.pendingCount})</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
