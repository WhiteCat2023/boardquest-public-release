import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm, showFeedback } from "@/components/modal";
import type { ReviewCenterRepresentative } from "../types/types";
import { useDeleteReviewCenter } from "../api/useReviewCenter";
import { useReviewCenterDirectory } from "../api/useReviewCenterDirectory";
import {
  ReviewCenterHeader,
  ReviewCenterFilters,
  ReviewCenterGrid,
  ReviewCenterTable,
  AddEditReviewCenterModal,
} from "../components";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";

export default function ReviewCenterManagement() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const deleteCenterMutation = useDeleteReviewCenter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const {
    searchTerm,
    handleSearchChange,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    handlePageSizeChange,
    hasNextPage,
    handleNextPage,
    handlePreviousPage,
    handlePageSelect,
    paginatedReviewCenters,
    isCentersLoading,
    resetFilters,
    hasActiveFilters,
  } = useReviewCenterDirectory();

  const handleDelete = async (item: ReviewCenterRepresentative) => {
    const confirmed = await confirm({
      title: "Remove Review Center",
      description: (
        <>
          Are you sure you want to remove{" "}
          <strong className="text-foreground">{item?.companyName}</strong> (
          {item?.name}) from the directory?
          <br />
          This action will revoke representative credentials for this
          institution.
        </>
      ),
      variant: "destructive",
      confirmText: "Confirm Removal",
    });

    if (!confirmed) return;

    deleteCenterMutation.mutate(item.id, {
      onSuccess: () => {
        showFeedback.success(
          `Review Center partner "${item?.companyName || item?.name}" removed.`,
        );
      },
      onError: (err: any) => {
        showFeedback.error(
          err.response?.data?.message || "Failed to remove review center.",
        );
      },
    });
  };

  // Modals & Dialogs State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ReviewCenterRepresentative | null>(null);

  const handleOpenEdit = (item: ReviewCenterRepresentative) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (item: ReviewCenterRepresentative) => {
    navigate(`/review-center/${item.id}`);
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <ReviewCenterHeader />

      {/* Search & Filters Bar Component with View Mode Toggle */}
      <ReviewCenterFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content: Table List View (Default) or Cards Grid View */}
      {viewMode === "list" ? (
        <ReviewCenterTable
          items={paginatedReviewCenters}
          isLoading={isCentersLoading}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          pagination={
            !isCentersLoading && totalItems > 0 ? (
              <DataTablePagination
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={currentPage > 1}
                onNext={handleNextPage}
                onPrevious={handlePreviousPage}
                onPageSelect={handlePageSelect}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[6, 8, 10, 20, 50]}
                onPageSizeChange={handlePageSizeChange}
                itemLabel="review centers"
                variant="table-footer"
              />
            ) : null
          }
        />
      ) : (
        <>
          <ReviewCenterGrid
            items={paginatedReviewCenters}
            isLoading={isCentersLoading}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />

          {/* Grid View Pagination Bar */}
          {!isCentersLoading && totalItems > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              onNext={handleNextPage}
              onPrevious={handlePreviousPage}
              onPageSelect={handlePageSelect}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              pageSizeOptions={[6, 8, 10, 20, 50]}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="review centers"
              variant="card"
            />
          )}
        </>
      )}

      {/* Modals & Dialogs */}
      <AddEditReviewCenterModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingItem(null);
        }}
        initialData={editingItem}
      />
    </div>
  );
}
