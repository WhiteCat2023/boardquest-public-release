import { useNavigate } from "react-router-dom";
import type { ReviewCenterRepresentative } from "../types/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  useReviewCenters,
  useDeleteReviewCenter,
} from "../api/useReviewCenter";

import ReviewCenterHeader from "../components/ReviewCenterHeader";
import ReviewCenterFilters from "../components/ReviewCenterFilters";
import ReviewCenterGrid from "../components/ReviewCenterGrid";
import AddEditReviewCenterModal from "../components/AddEditReviewCenterModal";
import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";
import { useConfirm } from "@/components/modal";

export default function ReviewCenterManagement() {
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const { data: rawReviewCenters = [], isLoading: isCentersLoading } = useReviewCenters({
    search: searchTerm,
    location: selectedLocation,
    company: selectedCompany,
  });
  const deleteCenterMutation = useDeleteReviewCenter();

  const reviewCenters = Array.isArray(rawReviewCenters) ? rawReviewCenters : [];
  const total = reviewCenters.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviewCenters = reviewCenters.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const { confirm } = useConfirm();

  // Modals & Dialogs State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewCenterRepresentative | null>(null);

  // Dynamic filter option dropdown lists
  const uniqueLocations = Array.from(
    new Set(reviewCenters.map((rc) => rc?.location || "Philippines").filter(Boolean))
  );

  const uniqueCompanies = Array.from(
    new Set(reviewCenters.map((rc) => rc?.companyName).filter((name): name is string => Boolean(name)))
  );

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("ALL");
    setSelectedCompany("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedLocation !== "ALL" ||
    selectedCompany !== "ALL";

  const handleOpenEdit = (item: ReviewCenterRepresentative) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (item: ReviewCenterRepresentative) => {
    navigate(`/review-center/${item.id}`);
  };

  const handleOpenDelete = async (item: ReviewCenterRepresentative) => {
    const confirmed = await confirm({
      title: "Remove Review Center",
      description: (
        <>
          Are you sure you want to remove{" "}
          <strong className="text-foreground">{item?.companyName}</strong> ({item?.name}) from the directory?
          <br />
          This action will revoke representative credentials for this institution.
        </>
      ),
      variant: "destructive",
      confirmText: "Confirm Removal",
    });

    if (!confirmed) return;

    deleteCenterMutation.mutate(item.id, {
      onSuccess: () => {
        toast.success(`Review Center partner "${item?.companyName || item?.name}" removed.`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to remove review center.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <ReviewCenterHeader />

      {/* Search & Filters Bar Component */}
      <ReviewCenterFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedLocation={selectedLocation}
        onLocationChange={(val) => {
          setSelectedLocation(val);
          setCurrentPage(1);
        }}
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
        onDelete={handleOpenDelete}
      />

      {/* Pagination Bar */}
      {!isCentersLoading && (
        <QuestionListPagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onPageSelect={handlePageSelect}
          maxPageReached={totalPages}
          totalPages={totalPages}
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
