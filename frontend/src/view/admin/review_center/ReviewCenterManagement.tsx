import { useState } from "react";
import { toast } from "sonner";
import {
  useReviewCenters,
  useDeleteReviewCenter,
} from "./hooks/useReviewCenter";
import type { ReviewCenterRepresentative } from "./types";
import ReviewCenterHeader from "./components/ReviewCenterHeader";
import ReviewCenterFilters from "./components/ReviewCenterFilters";
import ReviewCenterGrid from "./components/ReviewCenterGrid";
import AddEditReviewCenterModal from "./components/AddEditReviewCenterModal";
import ViewReviewCenterModal from "./components/ViewReviewCenterModal";
import DeleteReviewCenterDialog from "./components/DeleteReviewCenterDialog";

export default function ReviewCenterManagement() {
  const { data: rawReviewCenters = [], isLoading: isCentersLoading } = useReviewCenters();
  const deleteCenterMutation = useDeleteReviewCenter();

  const reviewCenters = Array.isArray(rawReviewCenters) ? rawReviewCenters : [];

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL");

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

  // Unique lists for directory filter dropdowns
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

  // Directory Safe Filtering Logic
  const filteredReviewCenters = reviewCenters.filter((rc) => {
    if (!rc) return false;

    const term = searchTerm.toLowerCase().trim();
    const name = rc.name || "";
    const email = rc.email || "";
    const companyName = rc.companyName || "";
    const employeeId = rc.employeeId || "";
    const location = rc.location || "";

    const matchSearch =
      !term ||
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      companyName.toLowerCase().includes(term) ||
      employeeId.toLowerCase().includes(term) ||
      location.toLowerCase().includes(term);

    const loc = location || "Philippines";
    const matchLocation =
      selectedLocation === "ALL" ||
      loc.toLowerCase() === selectedLocation.toLowerCase();

    const matchCompany =
      selectedCompany === "ALL" ||
      companyName.toLowerCase() === selectedCompany.toLowerCase();

    return matchSearch && matchLocation && matchCompany;
  });

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

    const { id, companyName, name } = confirmDelete.item;
    deleteCenterMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Removed ${companyName || "Review Center"} (${name || "Representative"}) from directory.`);
        setConfirmDelete({ isOpen: false, item: null });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to remove review center.");
        setConfirmDelete({ isOpen: false, item: null });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
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
        items={filteredReviewCenters}
        isLoading={isCentersLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Add / Edit Modal Component */}
      <AddEditReviewCenterModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        initialData={editingItem}
      />

      {/* View Profile Modal Component */}
      <ViewReviewCenterModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        reviewCenter={viewingItem}
        onEditClick={handleOpenEdit}
      />

      {/* Delete Dialog Component */}
      <DeleteReviewCenterDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, isOpen: open }))}
        item={confirmDelete.item}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
