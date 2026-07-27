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
import { MessageSquare, Sparkles, Check } from "lucide-react";

interface AuthorReviewFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => Promise<void>;
  isPending: boolean;
  selectedCount: number;
  authorName?: string;
}

const FEEDBACK_PRESETS = [
  {
    label: "Question Wording",
    text: "Question text requires clarification and removal of ambiguous phrasing.",
  },
  {
    label: "Option Key Error",
    text: "Verify answer choices key and correct choice indexing.",
  },
  {
    label: "Distractor Quality",
    text: "Refine choice options to ensure plausible, non-obvious distractors.",
  },
  {
    label: "Category & Topic",
    text: "Re-assign question topic benchmark or category mapping.",
  },
  {
    label: "Difficulty Tuning",
    text: "Adjust difficulty level to align with standardized board exam criteria.",
  },
];

export default function AuthorReviewFeedbackModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  selectedCount,
  authorName,
}: AuthorReviewFeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);

  const togglePreset = (preset: typeof FEEDBACK_PRESETS[0]) => {
    let updatedPresets: string[];
    if (selectedPresets.includes(preset.label)) {
      updatedPresets = selectedPresets.filter((p) => p !== preset.label);
    } else {
      updatedPresets = [...selectedPresets, preset.label];
    }
    setSelectedPresets(updatedPresets);

    // Re-build text from active presets
    const activeText = FEEDBACK_PRESETS.filter((p) => updatedPresets.includes(p.label))
      .map((p) => p.text)
      .join(" ");

    setFeedback(activeText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    await onSubmit(feedback.trim());
    setFeedback("");
    setSelectedPresets([]);
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

          {/* Quick Presets Section */}
          <div className="flex flex-col gap-2 bg-muted/30 p-3 border border-border/80 rounded-2xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Fast Revision Feedback Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FEEDBACK_PRESETS.map((preset) => {
                const isActive = selectedPresets.includes(preset.label);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => togglePreset(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border flex items-center gap-1 ${
                      isActive
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-2xs"
                        : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {isActive && <Check size={11} className="text-amber-600" />}
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

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
                  <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5" />
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
