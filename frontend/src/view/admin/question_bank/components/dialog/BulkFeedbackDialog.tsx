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
      <DialogContent className="sm:max-w-[450px] p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 leading-snug">
              Request Revision
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 leading-normal">
              Flag <strong>{selectedCount}</strong> selected question{selectedCount !== 1 ? "s" : ""} as <em>Needs Revision</em> and add comments for the author.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Revision Comments / Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Please correct typos in Option B and adjust the question difficulty."
              required
              className="w-full min-h-[110px] p-3 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all resize-none leading-relaxed placeholder-slate-400"
            />
          </div>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-sm h-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !feedback.trim()}
              className="px-5 py-2 bg-[#A70202] text-white hover:bg-[#8f0101] font-semibold rounded-xl text-sm h-auto cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" />
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
