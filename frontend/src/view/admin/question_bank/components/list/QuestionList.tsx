import { AlertCircle, FileQuestion } from "lucide-react";
import { type QuestionFilters } from "@/hooks/useQuestionBank";
import QuestionTable from "./QuestionTable";
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";
import BulkFeedbackDialog from "../dialog/BulkFeedbackDialog";
import { useQuestionListActions } from "@/hooks/useQuestionListActions";

interface QuestionListProps {
  filters?: QuestionFilters;
}

export default function QuestionList({ filters }: QuestionListProps) {
  const {
    questions,
    hasNextPage,
    loading,
    error,
    fetchQuestions,
    currentPageIndex,
    cursorsStack,
    itemsPerPage,
    rowSelection,
    selectedIds,
    isFeedbackOpen,
    canManageBulk,
    bulkApproveMutation,
    bulkPublishMutation,
    bulkFeedbackMutation,
    bulkDeleteMutation,
    handleView,
    handleDelete,
    handleItemsPerPageChange,
    handleBulkApprove,
    handleBulkDelete,
    handleBulkPublish,
    handleBulkFeedbackOpen,
    handleBulkFeedbackSubmit,
    handleNext,
    handlePrevious,
    handlePageSelect,
    setRowSelection,
    setIsFeedbackOpen,
  } = useQuestionListActions(filters);

  return (
    <>
      {/* ── Error state ── */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/10 py-16 text-center text-foreground font-sans">
          <AlertCircle size={36} className="text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error
                ? error.message
                : "Failed to fetch questions."}
            </p>
          </div>
          <button
            onClick={() => fetchQuestions()}
            className="mt-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Data layout ── */}
      <phantom-ui loading={loading}>
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300 font-sans">
          {/* ── Empty state ── */}
          {questions.length === 0 && !loading && !error && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16 text-center shadow-xs">
              <FileQuestion size={36} className="text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No questions yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first question to get started.
              </p>
            </div>
          )}

          {/* Data Table with Integrated Datagrid Header Toolbar */}
          {questions.length > 0 && !loading && !error && (
            <QuestionTable
              questions={questions}
              onView={handleView}
              onDelete={handleDelete}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              canManageBulk={canManageBulk}
              onApprove={handleBulkApprove}
              onPublish={() => handleBulkPublish(true)}
              onUnpublish={() => handleBulkPublish(false)}
              onFeedback={handleBulkFeedbackOpen}
              onBulkDelete={handleBulkDelete}
              onClear={() => setRowSelection({})}
              isApprovePending={bulkApproveMutation.isPending}
              isPublishPending={bulkPublishMutation.isPending}
              isFeedbackPending={bulkFeedbackMutation.isPending}
              isDeletePending={bulkDeleteMutation.isPending}
            />
          )}

          {/* Pagination */}
          <QuestionListPagination
            currentPage={currentPageIndex + 1}
            hasNextPage={!!hasNextPage}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onPageSelect={handlePageSelect}
            maxPageReached={cursorsStack.length}
          />

          {/* Bulk Revision Feedback Dialog */}
          <BulkFeedbackDialog
            open={isFeedbackOpen}
            onOpenChange={setIsFeedbackOpen}
            onSubmit={handleBulkFeedbackSubmit}
            isPending={bulkFeedbackMutation.isPending}
            selectedCount={selectedIds.length}
          />
        </div>
      </phantom-ui>
    </>
  );
}
