import {
  Trash2,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import CustomDrawer from "@/components/custom/drawer/Drawer";
import { QuestionFilter } from "@/features/question-bank/components/QuestionFilter";

interface UnifiedToolbarProps {
  totalCount: number;
  selectedCount: number;
  canManageBulk: boolean;
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
  onApprove?: () => void;
  onDelete: () => void;
  onClear: () => void;
  isApprovePending?: boolean;
  isDeletePending: boolean;
  isBankView?: boolean;
  onParaphrase?: () => void;
}

export default function BulkActionsToolbar({
  totalCount,
  selectedCount,
  canManageBulk,
  itemsPerPage,
  onItemsPerPageChange,
  onApprove,
  onDelete,
  onClear,
  isApprovePending,
  isDeletePending,
  isBankView = false,
  onParaphrase,
}: UnifiedToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between w-full border-b border-border bg-muted/40 px-4 py-3 gap-3 transition-all duration-200 font-sans">
      {/* Left side: Question count and Selection info */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-muted-foreground bg-card border border-border shadow-2xs">
          Showing {totalCount} question{totalCount !== 1 ? "s" : ""}
        </span>

        {/* Selected count pill & clear button — ONLY shown when selectedCount > 0 */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold animate-in fade-in duration-150">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {selectedCount}
            </span>
            <span className="text-primary font-semibold">
              {selectedCount === 1
                ? "1 question selected"
                : `${selectedCount} questions selected`}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="ml-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X size={12} />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Right side: Action buttons (if selected) + Items per page control */}
      <div className="flex flex-wrap items-center gap-2.5" data-shimmer-ignore>
        {/* Bulk Action Buttons — ONLY SHOWN WHEN selectedCount > 0 */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            {onParaphrase && (
              <button
                type="button"
                onClick={onParaphrase}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  selectedCount > 5
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                    : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                }`}
                title={
                  selectedCount > 5
                    ? `Bulk paraphrase is limited to 5 questions per batch (currently ${selectedCount} selected)`
                    : "Paraphrase selected questions with AI (up to 5 questions)"
                }
              >
                <Sparkles size={13} />
                <span>Paraphrase</span>
                {selectedCount > 5 && (
                  <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                    Max 5
                  </span>
                )}
              </button>
            )}

            {canManageBulk && onApprove && !isBankView && (
              <button
                type="button"
                onClick={onApprove}
                disabled={isApprovePending}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                Approve
              </button>
            )}

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeletePending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}

        {/* Items Per Page Selector */}
        <div className="flex items-center gap-2 bg-card px-2.5 py-1 rounded-xl border border-border shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground">
            Items per page:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-muted text-foreground text-xs font-semibold rounded-lg px-2 py-0.5 border border-border shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Mobile Filters Trigger */}
        <div className="lg:hidden" data-shimmer-ignore>
          <CustomDrawer
            triggerButton={
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <SlidersHorizontal size={14} /> Filters
              </button>
            }
            title="Filters"
            description="Refine the list of exam questions."
          >
            <QuestionFilter />
          </CustomDrawer>
        </div>
      </div>
    </div>
  );
}
