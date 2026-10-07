import { AlertCircle, FileQuestion } from "lucide-react";
import { type QuestionFilters } from "@/features/question-bank";
import QuestionTable from "./QuestionTable";
import { DataTablePagination } from "@/components/custom/pagination";
import { useQuestionListActions } from "@/features/question-bank";
import BulkParaphraseDialog from "../dialog/BulkParaphraseDialog";

interface QuestionListProps {
  filters?: QuestionFilters;
  isBankView?: boolean;
  overrideQuestions?: any[];
  isLoadingOverride?: boolean;
}

export default function QuestionList({
  filters,
  isBankView,
  overrideQuestions,
  isLoadingOverride,
}: QuestionListProps) {
  const {
    questions: hookQuestions,
    hasNextPage,
    total,
    loading: hookLoading,
    error,
    fetchQuestions,
    currentPageIndex,
    cursorsStack,
    itemsPerPage,
    rowSelection,
    selectedQuestions,
    canManageBulk,
    bulkApproveMutation,
    bulkDeleteMutation,
    handleView,
    handleDelete,
    handleItemsPerPageChange,
    handleBulkApprove,
    handleBulkDelete,
    handleNext,
    handlePrevious,
    handlePageSelect,
    setRowSelection,
    isParaphraseOpen,
    setIsParaphraseOpen,
    handleOpenParaphrase,
    handleParaphraseSuccess,
  } = useQuestionListActions(filters);

  const questions = overrideQuestions ?? hookQuestions;
  const loading = isLoadingOverride ?? hookLoading;

  const isBank = isBankView || filters?.status === "APPROVED";

  return (
    <>
      {/* ── Error state ── */}
      {error && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/10 py-16 text-center text-foreground font-sans">
          <AlertCircle size={36} className="text-destructive" />
          <div>
            <p className="font-semibold text-foreground">
              Something went wrong
            </p>
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

          {/* Data Table with Integrated Datagrid Header Toolbar & Footer */}
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
              onBulkDelete={handleBulkDelete}
              onClear={() => setRowSelection({})}
              isApprovePending={bulkApproveMutation.isPending}
              isDeletePending={bulkDeleteMutation.isPending}
              isBankView={isBank}
              onParaphrase={handleOpenParaphrase}
              pagination={
                <DataTablePagination
                  currentPage={currentPageIndex + 1}
                  totalItems={total}
                  totalPages={
                    total !== undefined
                      ? Math.max(1, Math.ceil(total / itemsPerPage))
                      : undefined
                  }
                  hasNextPage={!!hasNextPage}
                  hasPreviousPage={currentPageIndex > 0}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onPageSelect={handlePageSelect}
                  pageSize={itemsPerPage}
                  itemLabel="questions"
                  variant="table-footer"
                />
              }
            />
          )}
        </div>
      </phantom-ui>

      {/* Bulk Paraphrase Dialog */}
      <BulkParaphraseDialog
        open={isParaphraseOpen}
        onOpenChange={setIsParaphraseOpen}
        selectedQuestions={selectedQuestions}
        onSuccess={handleParaphraseSuccess}
      />
    </>
  );
}
