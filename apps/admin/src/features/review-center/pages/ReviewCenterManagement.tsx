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
  AddEditReviewCenterModal,
} from "../components";
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";

export default function ReviewCenterManagement() {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const deleteCenterMutation = useDeleteReviewCenter();

  const {
    searchTerm,
    handleSearchChange,
    selectedLocation,
    handleLocationChange,
    uniqueLocations,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
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

      {/* Search & Filters Bar Component */}
      <ReviewCenterFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        uniqueLocations={uniqueLocations}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Cards Grid Component */}
      <ReviewCenterGrid
        items={paginatedReviewCenters}
        isLoading={isCentersLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Pagination Bar */}
      {!isCentersLoading && (
        <QuestionListPagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onNext={handleNextPage}
          onPrevious={handlePreviousPage}
          onPageSelect={handlePageSelect}
          maxPageReached={totalPages}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemLabel="review centers"
        />
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
