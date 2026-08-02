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

interface BulkFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => Promise<void>;
  isPending: boolean;
  selectedCount: number;
}

export default function BulkFeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  selectedCount
}: BulkFeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    await onSubmit(feedback);
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-card border border-border shadow-xl text-foreground font-sans">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
              Request Revision
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-normal">
              Flag <strong className="text-foreground">{selectedCount}</strong> selected question{selectedCount !== 1 ? "s" : ""} as <em className="text-amber-600 dark:text-amber-400 font-semibold not-italic">Needs Revision</em> and add comments for the author.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Revision Comments / Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Please correct typos in Option B and adjust the question difficulty."
              required
              className="w-full min-h-[120px] p-3.5 text-xs font-medium border border-border rounded-xl bg-muted/40 text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all resize-none leading-relaxed placeholder:text-muted-foreground"
            />
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
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
                  Submitting...
                </>
              ) : (
                "Send Feedback"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
