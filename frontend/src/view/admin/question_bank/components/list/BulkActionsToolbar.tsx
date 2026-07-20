import React from "react";
import { Globe, EyeOff, MessageSquare, Trash2, X, SlidersHorizontal } from "lucide-react";
import CustomDrawer from "@/components/custom/drawer/Drawer";
import { QuestionFilter } from "@/view/admin/question_bank/components/QuestionFilter";

interface UnifiedToolbarProps {
  totalCount: number;
  selectedCount: number;
  canManageBulk: boolean;
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
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
  totalCount,
  selectedCount,
  canManageBulk,
  itemsPerPage,
  onItemsPerPageChange,
  onPublish,
  onUnpublish,
  onFeedback,
  onDelete,
  onClear,
  isPublishPending,
  isFeedbackPending,
  isDeletePending,
}: UnifiedToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between w-full border-b border-slate-200/80 bg-slate-50/50 px-4 py-3 gap-3 transition-all duration-200">
      {/* Left side: Question count and Selection info */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 bg-white border border-slate-200/80 shadow-2xs">
          Showing {totalCount} question{totalCount !== 1 ? "s" : ""}
        </span>

        {/* Selected count pill & clear button — ONLY shown when selectedCount > 0 */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-[#A70202]/10 border border-[#A70202]/20 px-3 py-1 rounded-full text-xs font-semibold animate-in fade-in duration-150">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#A70202] text-[10px] font-bold text-white">
              {selectedCount}
            </span>
            <span className="text-[#A70202] font-semibold">
              {selectedCount === 1 ? "1 question selected" : `${selectedCount} questions selected`}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="ml-1 flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
            {canManageBulk && (
              <>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isPublishPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Globe size={13} />
                  Publish
                </button>

                <button
                  type="button"
                  onClick={onUnpublish}
                  disabled={isPublishPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <EyeOff size={13} />
                  Unpublish
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <button
                  type="button"
                  onClick={onFeedback}
                  disabled={isFeedbackPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare size={13} />
                  Request Revision
                </button>
              </>
            )}

            <div className="h-4 w-px bg-slate-200" />

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeletePending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#A70202] hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              Delete
            </button>

            <div className="h-4 w-px bg-slate-200" />
          </div>
        )}

        {/* Items Per Page Selector */}
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg px-2 py-0.5 border border-slate-200 shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
            <option value={24}>24</option>
            <option value={30}>30</option>
          </select>
        </div>

        {/* Mobile Filters Trigger */}
        <div className="lg:hidden" data-shimmer-ignore>
          <CustomDrawer
            drawerTriggerIcon={<SlidersHorizontal size={14} />}
            drawerTitleIcon={<SlidersHorizontal size={14} />}
            drawerTriggerName="Filters"
            drawerDescription="Refine the list of exam questions."
            buttonClassName="bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] h-9 px-3 rounded-xl text-xs font-semibold"
          >
            <QuestionFilter />
          </CustomDrawer>
        </div>
      </div>
    </div>
  );
}
