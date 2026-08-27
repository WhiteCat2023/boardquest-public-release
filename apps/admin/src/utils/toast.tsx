import { toast } from "sonner";
import { CheckCircle2, AlertCircle, UploadCloud, Loader2 } from "lucide-react";

interface UndoToastOptions {
  /** The main header text of the toast (default: "Item Deleted") */
  title?: string;
  /** The item's textual details (e.g. question prompt) */
  message: string;
  /** Callback function executed when the user clicks 'Undo' */
  onUndo: () => void;
  /** The duration in milliseconds before the action is finalized (default: 4000) */
  duration?: number;
}

/**
 * Displays a warning toast with an 'Undo' button and a shrinking timer progress bar.
 */
export const showUndoToast = ({
  title = "Item Deleted",
  message,
  onUndo,
  duration = 4000,
}: UndoToastOptions) => {
  return toast.warning(
    <div className="flex flex-col gap-0.5 font-sans">
      <span className="font-bold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground italic line-clamp-1" title={message}>
        "{message}"
      </span>
    </div>,
    {
      description: (
        <div className="w-full mt-1.5 flex flex-col gap-1.5 font-sans">
          <span className="text-[11px] text-muted-foreground">
            You can undo this action within {duration / 1000} seconds.
          </span>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden border border-border/40">
            <div
              className="bg-amber-500 h-full"
              style={{
                animation: `shrink-timer ${duration}ms linear forwards`,
                transformOrigin: "left",
              }}
            />
          </div>
          <style>{`
            @keyframes shrink-timer {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      ),
      action: {
        label: "Undo",
        onClick: onUndo,
      },
      duration: duration,
    }
  );
};

export interface ProgressToastController {
  update: (currentCount: number, totalCount?: number, message?: string) => void;
  success: (message?: string, title?: string) => void;
  error: (message?: string, title?: string) => void;
  dismiss: () => void;
}

/**
 * Creates and renders a dynamic progress bar toast tracking questions being queued.
 */
export const createProgressToast = ({
  id = "bulk-upload-progress",
  title = "Uploading Bulk Questions",
  totalCount = 1,
}: {
  id?: string;
  title?: string;
  totalCount?: number;
}): ProgressToastController => {
  const toastId = id;

  const render = (
    currentCount: number,
    total: number,
    status: "uploading" | "success" | "error",
    message: string,
    customTitle = title,
  ) => {
    const validTotal = Math.max(1, total);
    const progress = Math.min(100, Math.max(0, (currentCount / validTotal) * 100));

    toast.custom(
      (t) => (
        <div className="w-[356px] sm:w-[390px] bg-card border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-2.5 font-sans text-foreground transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl border shrink-0 transition-colors ${
                  status === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : status === "error"
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-primary/10 border-primary/30 text-primary"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle2 size={18} className="stroke-[2.5]" />
                ) : status === "error" ? (
                  <AlertCircle size={18} className="stroke-[2.5]" />
                ) : (
                  <UploadCloud size={18} className="animate-pulse stroke-[2.2]" />
                )}
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-bold text-foreground truncate">
                  {customTitle}
                </span>
                <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {message}
                </span>
              </div>
            </div>

            {/* Percentage indicator */}
            <span
              className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg border shrink-0 ${
                status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : status === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-primary/10 border-primary/20 text-primary"
              }`}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-muted/70 h-2 rounded-full overflow-hidden border border-border/60">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full ${
                status === "success"
                  ? "bg-emerald-500 shadow-xs"
                  : status === "error"
                    ? "bg-destructive"
                    : "bg-primary shadow-xs"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtitle / Question Counter */}
          {status === "uploading" && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-0.5">
              <span>
                Queued{" "}
                <strong className="text-foreground">{currentCount}</strong> of{" "}
                <strong className="text-foreground">{validTotal}</strong> questions
              </span>
              <span className="flex items-center gap-1 text-primary font-semibold">
                <Loader2 size={10} className="animate-spin" /> In Progress
              </span>
            </div>
          )}
        </div>
      ),
      {
        id: toastId,
        duration: status === "uploading" ? Infinity : 4000,
      },
    );
  };

  // Initial render at 0
  render(
    0,
    totalCount,
    "uploading",
    `Preparing ${totalCount} question(s) for queue...`,
  );

  return {
    update: (currentCount: number, total: number = totalCount, msg?: string) => {
      render(
        currentCount,
        total,
        "uploading",
        msg || `Queuing ${currentCount} of ${total} questions...`,
      );
    },
    success: (msg?: string, title?: string) => {
      render(
        totalCount,
        totalCount,
        "success",
        msg || `Successfully queued and saved ${totalCount} question(s).`,
        title || "Upload Complete",
      );
    },
    error: (msg?: string, title?: string) => {
      render(
        0,
        totalCount,
        "error",
        msg || "An error occurred while queuing questions.",
        title || "Upload Failed",
      );
    },
    dismiss: () => {
      toast.dismiss(toastId);
    },
  };
};
