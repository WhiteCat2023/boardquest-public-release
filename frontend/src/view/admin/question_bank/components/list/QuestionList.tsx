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
    bulkPublishMutation,
    bulkFeedbackMutation,
    bulkDeleteMutation,
    handleView,
    handleDelete,
    handleItemsPerPageChange,
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 py-16 text-center">
          <AlertCircle size={36} className="text-[#A70202]" />
          <div>
            <p className="font-semibold text-gray-800">Something went wrong</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error
                ? error.message
                : "Failed to fetch questions."}
            </p>
          </div>
          <button
            onClick={() => fetchQuestions()}
            className="mt-2 rounded-xl bg-[#A70202] px-5 py-2 text-sm font-medium text-white hover:bg-[#8f0101] transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Data layout ── */}
      <phantom-ui loading={loading}>
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* ── Empty state ── */}
          {questions.length === 0 && !loading && !error && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
              <FileQuestion size={36} className="text-gray-300" />
              <p className="font-semibold text-gray-600">No questions yet</p>
              <p className="text-sm text-gray-400">
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
              onPublish={() => handleBulkPublish(true)}
              onUnpublish={() => handleBulkPublish(false)}
              onFeedback={handleBulkFeedbackOpen}
              onBulkDelete={handleBulkDelete}
              onClear={() => setRowSelection({})}
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
