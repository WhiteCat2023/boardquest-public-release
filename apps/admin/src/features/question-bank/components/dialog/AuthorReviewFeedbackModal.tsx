import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";

interface AuthorReviewFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => Promise<void>;
  isPending: boolean;
  selectedCount: number;
  authorName?: string;
}

export default function AuthorReviewFeedbackModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  selectedCount,
  authorName,
}: AuthorReviewFeedbackModalProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    await onSubmit(feedback.trim());
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-3xl bg-card border border-border shadow-2xl text-foreground font-sans">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <MessageSquare size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Educator Guidance</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight mt-1">
              Request Revision {authorName ? `for ${authorName}` : ""}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Provide structured, clear feedback for <strong className="text-foreground">{selectedCount}</strong> selected question{selectedCount !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>

          {/* Detailed Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Detailed Revision Notes & Instructions
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Detail specific guidance (e.g. Please clarify question wording and check key in Option C)..."
              required
              className="w-full min-h-[130px] p-3.5 text-xs font-medium border border-border rounded-2xl bg-muted/30 text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all resize-none leading-relaxed placeholder:text-muted-foreground"
            />
          </div>

          <DialogFooter className="mt-2 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border-border text-muted-foreground hover:bg-accent hover:text-foreground font-semibold rounded-xl text-xs h-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !feedback.trim()}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs h-auto cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-amber-600/20"
            >
              {isPending ? (
                <>
                  <Spinner size="xs" variant="current" />
                  Sending Feedback...
                </>
              ) : (
                "Send Revision Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
