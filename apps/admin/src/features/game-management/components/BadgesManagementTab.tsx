import { useState } from "react";
import { showFeedback } from "@/components/modal";
import type { GameBadge } from "../types/types";
import { BadgeEditorModal } from "./BadgeEditorModal";
import {
  useGameBadges,
  useCreateBadge,
  useUpdateBadge,
  useToggleBadgeActive,
  useDeleteBadge,
} from "../api/useGameManagement";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import { BadgesFilterToolbar, BadgesTable, DeleteBadgeDialog } from "./badges";

interface BadgesManagementTabProps {
  badges?: GameBadge[];
  isLoading?: boolean;
  onAddBadge?: () => void;
  onEditBadge?: (badge: GameBadge) => void;
  onDeleteBadge?: (id: string) => void;
  onToggleActive?: (id: string) => void;
}

export function BadgesManagementTab({
  badges: propBadges,
  isLoading: propIsLoading,
  onAddBadge,
  onEditBadge,
  onDeleteBadge,
  onToggleActive,
}: BadgesManagementTabProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrorUrls, setImageErrorUrls] = useState<Record<string, boolean>>(
    {},
  );

  const ITEMS_PER_PAGE = 10;

  // Self-contained query & mutations
  const { data: serverBadges, isLoading: isBadgesLoading } = useGameBadges({
    search: searchTerm,
    category: selectedCategory,
    badgeType: selectedTier,
    status: selectedStatus,
  });

  const createBadgeMutation = useCreateBadge();
  const updateBadgeMutation = useUpdateBadge();
  const toggleBadgeMutation = useToggleBadgeActive();
  const deleteBadgeMutation = useDeleteBadge();

  // Modal states
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<GameBadge | null>(null);
  const [deletingBadge, setDeletingBadge] = useState<GameBadge | null>(null);

  // Handlers
  const handleAddBadge = () => {
    if (onAddBadge) return onAddBadge();
    setEditingBadge(null);
    setIsBadgeModalOpen(true);
  };

  const handleEditBadge = (badge: GameBadge) => {
    if (onEditBadge) return onEditBadge(badge);
    setEditingBadge(badge);
    setIsBadgeModalOpen(true);
  };

  const handleDeleteBadge = async (id: string) => {
    if (onDeleteBadge) return onDeleteBadge(id);
    try {
      await deleteBadgeMutation.mutateAsync(id);
      showFeedback.success("Gamification badge deleted successfully.");
    } catch (err: any) {
      showFeedback.error(err?.response?.data?.message || "Failed to delete badge.");
    }
  };

  const handleToggleActive = async (id: string) => {
    if (onToggleActive) return onToggleActive(id);
    try {
      await toggleBadgeMutation.mutateAsync(id);
      showFeedback.info("Badge status updated.");
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to toggle badge status.",
      );
    }
  };

  const handleSaveBadge = async (badgeData: GameBadge) => {
    try {
      if (editingBadge && editingBadge.id) {
        await updateBadgeMutation.mutateAsync({
          id: editingBadge.id,
          data: badgeData,
        });
        showFeedback.success("Badge updated successfully!");
      } else {
        await createBadgeMutation.mutateAsync(badgeData);
        setCurrentPage(1);
        showFeedback.success("New gamification badge created!");
      }
      setIsBadgeModalOpen(false);
    } catch (err: any) {
      showFeedback.error(err?.response?.data?.message || "Failed to save badge.");
    }
  };

  const isLoading = propIsLoading ?? isBadgesLoading;
  const filteredBadges = serverBadges || propBadges || [];
  const total = filteredBadges.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBadges = filteredBadges.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleImageError = (url?: string | null) => {
    if (!url) return;
    setImageErrorUrls((prev) => ({ ...prev, [url]: true }));
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedCategory !== "ALL" ||
    selectedTier !== "ALL" ||
    selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedTier("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Search & Filter Toolbar */}
      <BadgesFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        selectedTier={selectedTier}
        onTierChange={(val) => {
          setSelectedTier(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        onAddBadge={handleAddBadge}
      />

      {/* Badges Table View */}
      <BadgesTable
        badges={paginatedBadges}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        imageErrorUrls={imageErrorUrls}
        onImageError={handleImageError}
        onResetFilters={handleResetFilters}
        onAddBadge={handleAddBadge}
        onEditBadge={handleEditBadge}
        onDeleteBadge={(id) => {
          const badgeToDelete = filteredBadges.find((b) => b.id === id);
          if (badgeToDelete) {
            setDeletingBadge(badgeToDelete);
          } else {
            handleDeleteBadge(id);
          }
        }}
        onToggleActive={handleToggleActive}
        pagination={
          !isLoading && filteredBadges.length > 0 ? (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBadges.length}
              pageSize={ITEMS_PER_PAGE}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              onNext={() => hasNextPage && setCurrentPage((p) => p + 1)}
              onPrevious={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
              itemLabel="badges"
              variant="table-footer"
            />
          ) : null
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteBadgeDialog
        deletingBadge={deletingBadge}
        onClose={() => setDeletingBadge(null)}
        onConfirm={handleDeleteBadge}
        isPending={deleteBadgeMutation.isPending}
      />

      {/* Badge Modal Editor */}
      <BadgeEditorModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        badge={editingBadge}
        onSave={handleSaveBadge}
        isSaving={
          createBadgeMutation.isPending || updateBadgeMutation.isPending
        }
      />
    </div>
  );
}

export default BadgesManagementTab;
