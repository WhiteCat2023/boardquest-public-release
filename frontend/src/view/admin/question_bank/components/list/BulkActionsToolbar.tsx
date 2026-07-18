import { Globe, EyeOff, MessageSquare, Trash2, X, CheckSquare } from "lucide-react";

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

interface ToolbarActionProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  variant: "emerald" | "amber" | "neutral" | "rose";
}

const variantStyles: Record<ToolbarActionProps["variant"], string> = {
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 disabled:opacity-50",
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 disabled:opacity-50",
  neutral:
    "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50",
  rose:
    "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 disabled:opacity-50",
};

function ToolbarAction({ onClick, disabled, icon, label, variant }: ToolbarActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
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
    <div className="flex items-center justify-between rounded-xl border border-[#A70202]/20 bg-[#A70202]/[0.04] px-4 py-2.5 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Left — selection count */}
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A70202] text-[10px] font-bold text-white">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-[#A70202]">
          {selectedCount === 1 ? "1 question selected" : `${selectedCount} questions selected`}
        </span>

        <button
          onClick={onClear}
          className="ml-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear selection"
        >
          <X size={11} />
          Clear
        </button>
      </div>

      {/* Right — action buttons */}
      <div className="flex items-center gap-2">
        {canManageBulk && (
          <>
            <ToolbarAction
              onClick={onPublish}
              disabled={isPublishPending}
              icon={<Globe size={12} />}
              label="Publish"
              variant="emerald"
            />
            <ToolbarAction
              onClick={onUnpublish}
              disabled={isPublishPending}
              icon={<EyeOff size={12} />}
              label="Unpublish"
              variant="amber"
            />

            {/* Divider */}
            <div className="h-4 w-px bg-slate-200" />

            <ToolbarAction
              onClick={onFeedback}
              disabled={isFeedbackPending}
              icon={<MessageSquare size={12} />}
              label="Request Revision"
              variant="neutral"
            />
          </>
        )}

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200" />

        <ToolbarAction
          onClick={onDelete}
          disabled={isDeletePending}
          icon={<Trash2 size={12} />}
          label="Delete"
          variant="rose"
        />
      </div>
    </div>
  );
}
