import type { ReviewCenterRepresentative } from "../types/types";
import { useState } from "react";
import { toast } from "sonner";
import {
  useReviewCenters,
  useDeleteReviewCenter,
} from "@/features/review-center";

import ReviewCenterHeader from "./ReviewCenterHeader";
import ReviewCenterFilters from "./ReviewCenterFilters";
import ReviewCenterGrid from "./ReviewCenterGrid";
import AddEditReviewCenterModal from "./AddEditReviewCenterModal";
import ViewReviewCenterModal from "./ViewReviewCenterModal";
import DeleteReviewCenterDialog from "./DeleteReviewCenterDialog";

export default function ReviewCenterManagement() {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");

  const { data: rawReviewCenters = [], isLoading: isCentersLoading } = useReviewCenters({
    search: searchTerm,
    location: selectedLocation,
    company: selectedCompany,
  });
  const deleteCenterMutation = useDeleteReviewCenter();

  const reviewCenters = Array.isArray(rawReviewCenters) ? rawReviewCenters : [];

  // Modals & Dialogs State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewCenterRepresentative | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ReviewCenterRepresentative | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    item: ReviewCenterRepresentative | null;
  }>({
    isOpen: false,
    item: null,
  });

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
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedLocation !== "ALL" ||
    selectedCompany !== "ALL";

  // Directory Action Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: ReviewCenterRepresentative) => {
    setEditingItem(item);
    setIsAddEditOpen(true);
  };

  const handleOpenView = (item: ReviewCenterRepresentative) => {
    setViewingItem(item);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (item: ReviewCenterRepresentative) => {
    setConfirmDelete({
      isOpen: true,
      item,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete.item) return;

    deleteCenterMutation.mutate(confirmDelete.item.id, {
      onSuccess: () => {
        toast.success(`Review Center partner "${confirmDelete.item?.companyName || confirmDelete.item?.name}" removed.`);
        setConfirmDelete({ isOpen: false, item: null });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to remove review center.");
        setConfirmDelete({ isOpen: false, item: null });
      },
    });
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <ReviewCenterHeader onAddClick={handleOpenAdd} />

      {/* Search & Filters Bar Component */}
      <ReviewCenterFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        uniqueCompanies={uniqueCompanies}
        uniqueLocations={uniqueLocations}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Cards Grid Component */}
      <ReviewCenterGrid
        items={reviewCenters}
        isLoading={isCentersLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add / Edit Review Center Modal */}
      <AddEditReviewCenterModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        initialData={editingItem}
      />

      {/* View Details Modal */}
      <ViewReviewCenterModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        reviewCenter={viewingItem}
        onEditClick={(item) => {
          setIsViewOpen(false);
          handleOpenEdit(item);
        }}
      />

      {/* Confirm Delete / Deactivate Dialog */}
      <DeleteReviewCenterDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete({ isOpen: open, item: null })}
        item={confirmDelete.item}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
