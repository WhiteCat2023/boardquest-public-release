import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard, CheckCircle2, ArrowRight, ArrowLeft, MessageSquare, Edit3 } from "lucide-react";

interface FastReviewShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FastReviewShortcutsModal({
  open,
  onOpenChange,
}: FastReviewShortcutsModalProps) {
  const shortcuts = [
    {
      key: "A",
      label: "Approve & Next",
      desc: "Approve the current question and automatically advance to the next item.",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      key: "J / →",
      label: "Next Question",
      desc: "Navigate to the next question in the review queue.",
      icon: ArrowRight,
      color: "text-primary",
    },
    {
      key: "K / ←",
      label: "Previous Question",
      desc: "Navigate back to the previous question.",
      icon: ArrowLeft,
      color: "text-primary",
    },
    {
      key: "C",
      label: "Focus Comment Box",
      desc: "Instantly focus the comment input to type feedback for the author.",
      icon: MessageSquare,
      color: "text-indigo-500",
    },
    {
      key: "E",
      label: "Edit Question",
      desc: "Open question editor to fix typos or adjust details directly.",
      icon: Edit3,
      color: "text-amber-500",
    },
    {
      key: "?",
      label: "Show Shortcuts Guide",
      desc: "Open this keyboard shortcuts reference at any time.",
      icon: Keyboard,
      color: "text-muted-foreground",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-card border border-border shadow-2xl text-foreground font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Keyboard size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Fast Review Desk</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight mt-1">
            Keyboard Shortcuts Reference
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Speed up your question review workflow using these quick keyboard shortcuts. Hotkeys are paused while writing comments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-muted/40 border border-border/70 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg bg-card border border-border shrink-0 ${item.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <kbd className="px-2.5 py-1 text-[11px] font-mono font-bold bg-card text-foreground border border-border rounded-lg shadow-2xs shrink-0 ml-2">
                  {item.key}
                </kbd>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
