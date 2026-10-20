import { useState } from "react";
import { showFeedback } from "@/components/modal";
import type { RankTier } from "../types/types";
import {
  useGameRanks,
  useCreateRank,
  useUpdateRank,
  useToggleRankActive,
  useDeleteRank,
} from "../api/useGameManagement";
import { RankEditorModal } from "./RankEditorModal";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import {
  RanksFilterToolbar,
  RanksTable,
  RankStudentsModal,
  DeleteRankModal,
} from "./ranks";

interface RanksManagementTabProps {
  ranks?: RankTier[];
  isLoading?: boolean;
  onAddRank?: () => void;
  onEditRank?: (rank: RankTier) => void;
  onDeleteRank?: (id: string) => void;
  onToggleActive?: (id: string) => void;
}

export function RanksManagementTab({
  ranks: propRanks,
  isLoading: propIsLoading,
  onAddRank,
  onEditRank,
  onDeleteRank,
  onToggleActive,
}: RanksManagementTabProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modals state
  const [inspectingRank, setInspectingRank] = useState<RankTier | null>(null);
  const [deletingRank, setDeletingRank] = useState<RankTier | null>(null);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<RankTier | null>(null);

  // Collocated Query & Mutations
  const { data: serverRanks = [], isLoading: isServerRanksLoading } =
    useGameRanks();
  const createRankMutation = useCreateRank();
  const updateRankMutation = useUpdateRank();
  const toggleRankMutation = useToggleRankActive();
  const deleteRankMutation = useDeleteRank();

  // Handlers
  const handleAddRank = () => {
    if (onAddRank) return onAddRank();
    setEditingRank(null);
    setIsRankModalOpen(true);
  };

  const handleEditRank = (rank: RankTier) => {
    if (onEditRank) return onEditRank(rank);
    setEditingRank(rank);
    setIsRankModalOpen(true);
  };

  const handleDeleteRank = async (id: string) => {
    if (onDeleteRank) return onDeleteRank(id);
    try {
      await deleteRankMutation.mutateAsync(id);
      showFeedback.success("Aspirant rank tier deleted successfully.");
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to delete rank tier.",
      );
    }
  };

  const handleToggleRankActive = async (id: string) => {
    if (onToggleActive) return onToggleActive(id);
    try {
      await toggleRankMutation.mutateAsync(id);
      showFeedback.info("Rank tier active status updated.");
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to toggle rank status.",
      );
    }
  };

  const handleSaveRank = async (rankData: Partial<RankTier>) => {
    try {
      if (editingRank && editingRank.id) {
        await updateRankMutation.mutateAsync({
          id: editingRank.id,
          data: rankData,
        });
        showFeedback.success("Rank tier updated successfully!");
      } else {
        await createRankMutation.mutateAsync(rankData);
        showFeedback.success("New Aspirant rank tier created!");
      }
      setIsRankModalOpen(false);
    } catch (err: any) {
      showFeedback.error(err?.response?.data?.message || "Failed to save rank tier.");
    }
  };

  const isLoading = propIsLoading ?? isServerRanksLoading;
  const ranks = propRanks ?? serverRanks;

  // Filter ranks
  const filteredRanks = ranks.filter((r) => {
    const matchesSearch =
      !searchTerm.trim() ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rankId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `level ${r.minLevel}`.includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "active" && r.isActive) ||
      (selectedStatus === "inactive" && !r.isActive);

    return matchesSearch && matchesStatus;
  });

  const total = filteredRanks.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRanks = filteredRanks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const hasActiveFilters = Boolean(searchTerm) || selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Search & Filter Toolbar */}
      <RanksFilterToolbar
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(v) => {
          setSelectedStatus(v);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        onAddRank={handleAddRank}
      />

      {/* Ranks Table View */}
      <RanksTable
        ranks={paginatedRanks}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onAddRank={handleAddRank}
        onEditRank={handleEditRank}
        onDeleteRank={setDeletingRank}
        onToggleRankActive={handleToggleRankActive}
        onInspectStudents={setInspectingRank}
        pagination={
          !isLoading && filteredRanks.length > 0 ? (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRanks.length}
              pageSize={ITEMS_PER_PAGE}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              onNext={() => hasNextPage && setCurrentPage((p) => p + 1)}
              onPrevious={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
              itemLabel="rank tiers"
              variant="table-footer"
            />
          ) : null
        }
      />

      {/* Real Enrolled Students Inspection Modal */}
      <RankStudentsModal
        rank={inspectingRank}
        onClose={() => setInspectingRank(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRankModal
        deletingRank={deletingRank}
        onClose={() => setDeletingRank(null)}
        onConfirm={handleDeleteRank}
        isPending={deleteRankMutation.isPending}
      />

      {/* Rank CMS Modal Editor */}
      <RankEditorModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        rank={editingRank}
        onSave={handleSaveRank}
        isSaving={createRankMutation.isPending || updateRankMutation.isPending}
      />
    </div>
  );
}

export default RanksManagementTab;
