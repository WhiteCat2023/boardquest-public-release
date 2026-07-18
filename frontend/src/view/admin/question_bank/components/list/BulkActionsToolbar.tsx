import { Button } from "@/components/ui/button";
import { Globe, EyeOff, MessageSquare, Trash2, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  canManageBulk: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onFeedback: () => void;
  onDelete: () => void;
  onClear: () => void;
  isPublishPending: boolean;
  isFeedbackPending: boolean;
  isDeletePending: boolean;
}

export default function BulkActionsToolbar({
  selectedCount,
  canManageBulk,
  onPublish,
  onUnpublish,
  onFeedback,
  onDelete,
  onClear,
  isPublishPending,
  isFeedbackPending,
  isDeletePending,
}: BulkActionsToolbarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl w-[90%] md:w-auto">
      <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A70202] text-[10px] font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-bold tracking-wide text-slate-300 whitespace-nowrap">
          selected
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {canManageBulk && (
          <>
            <Button
              onClick={onPublish}
              disabled={isPublishPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Globe size={13} />
              Publish
            </Button>
            <Button
              onClick={onUnpublish}
              disabled={isPublishPending}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <EyeOff size={13} />
              Unpublish
            </Button>
            <Button
              onClick={onFeedback}
              disabled={isFeedbackPending}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors shadow-xs"
            >
              <MessageSquare size={13} />
              Feedback
            </Button>
          </>
        )}

        <Button
          onClick={onDelete}
          disabled={isDeletePending}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
        >
          <Trash2 size={13} />
          Delete
        </Button>

        <button
          onClick={onClear}
          className="text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
