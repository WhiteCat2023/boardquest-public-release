import { toast } from "sonner";

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
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-slate-800">{title}</span>
      <span className="text-xs text-slate-500 italic line-clamp-1" title={message}>
        "{message}"
      </span>
    </div>,
    {
      description: (
        <div className="w-full mt-1.5 flex flex-col gap-1.5">
          <span className="text-[11px] text-slate-400">
            You can undo this action within {duration / 1000} seconds.
          </span>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
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
