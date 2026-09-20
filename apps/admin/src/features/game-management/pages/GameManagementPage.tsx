import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { RanksManagementTab } from "../components/RanksManagementTab";
import { BadgeEditorModal } from "../components/BadgeEditorModal";
import { RankEditorModal } from "../components/RankEditorModal";
import GameManagementHeader from "../components/GameManagementHeader";
import { Award, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  useGameBadges,
  useCreateBadge,
  useUpdateBadge,
  useToggleBadgeActive,
  useDeleteBadge,
  useGameRanks,
  useCreateRank,
  useUpdateRank,
  useToggleRankActive,
  useDeleteRank,
} from "../api/useGameManagement";
import type { GameBadge, RankTier } from "../types/types";

export function GameManagementPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isRanksRoute = location.pathname.includes("rank");
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "ranks" || isRanksRoute ? "ranks" : "badges";

  const [activeTab, setActiveTab] = useState<"badges" | "ranks">(
    initialTab
  );

  useEffect(() => {
    const p = searchParams.get("tab");
    if (p === "ranks" || location.pathname.includes("rank")) {
      setActiveTab("ranks");
    } else if (p === "badges") {
      setActiveTab("badges");
    }
  }, [searchParams, location.pathname]);

  // Badges Data & Mutations
  const { data: badges = [], isLoading: isBadgesLoading } = useGameBadges();
  const createBadgeMutation = useCreateBadge();
  const updateBadgeMutation = useUpdateBadge();
  const toggleBadgeMutation = useToggleBadgeActive();
  const deleteBadgeMutation = useDeleteBadge();

  // Ranks Data & Mutations
  const { data: ranks = [], isLoading: isRanksLoading } = useGameRanks();
  const createRankMutation = useCreateRank();
  const updateRankMutation = useUpdateRank();
  const toggleRankMutation = useToggleRankActive();
  const deleteRankMutation = useDeleteRank();

  // Badge Modal State
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<GameBadge | null>(null);

  // Rank Modal State
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<RankTier | null>(null);

  // Badge Handlers
  const handleAddBadge = () => {
    setEditingBadge(null);
    setIsBadgeModalOpen(true);
  };

  const handleEditBadge = (badge: GameBadge) => {
    setEditingBadge(badge);
    setIsBadgeModalOpen(true);
  };

  const handleDeleteBadge = async (id: string) => {
    try {
      await deleteBadgeMutation.mutateAsync(id);
      toast.success("Gamification badge deleted successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete badge.");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleBadgeMutation.mutateAsync(id);
      toast.info("Badge status updated.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle badge status.");
    }
  };

  const handleSaveBadge = async (badgeData: GameBadge) => {
    try {
      if (editingBadge && editingBadge.id) {
        await updateBadgeMutation.mutateAsync({
          id: editingBadge.id,
          data: badgeData,
        });
        toast.success("Badge updated successfully!");
      } else {
        await createBadgeMutation.mutateAsync(badgeData);
        toast.success("New gamification badge created!");
      }
      setIsBadgeModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save badge.");
    }
  };

  // Rank CMS Handlers
  const handleAddRank = () => {
    setEditingRank(null);
    setIsRankModalOpen(true);
  };

  const handleEditRank = (rank: RankTier) => {
    setEditingRank(rank);
    setIsRankModalOpen(true);
  };

  const handleDeleteRank = async (id: string) => {
    try {
      await deleteRankMutation.mutateAsync(id);
      toast.success("Aspirant rank tier deleted successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete rank tier.");
    }
  };

  const handleToggleRankActive = async (id: string) => {
    try {
      await toggleRankMutation.mutateAsync(id);
      toast.info("Rank tier active status updated.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle rank status.");
    }
  };

  const handleSaveRank = async (rankData: Partial<RankTier>) => {
    try {
      if (editingRank && editingRank.id) {
        await updateRankMutation.mutateAsync({
          id: editingRank.id,
          data: rankData,
        });
        toast.success("Rank tier updated successfully!");
      } else {
        await createRankMutation.mutateAsync(rankData);
        toast.success("New Aspirant rank tier created!");
      }
      setIsRankModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save rank tier.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <GameManagementHeader />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Award className="w-4 h-4" /> Badges Catalog
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ranks")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ranks"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" /> Aspirant Ranks 
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "badges" && (
          <BadgesManagementTab
            badges={badges}
            isLoading={isBadgesLoading}
            onAddBadge={handleAddBadge}
            onEditBadge={handleEditBadge}
            onDeleteBadge={handleDeleteBadge}
            onToggleActive={handleToggleActive}
          />
        )}

        {activeTab === "ranks" && (
          <RanksManagementTab
            ranks={ranks}
            isLoading={isRanksLoading}
            onAddRank={handleAddRank}
            onEditRank={handleEditRank}
            onDeleteRank={handleDeleteRank}
            onToggleActive={handleToggleRankActive}
          />
        )}
      </div>

      {/* Badge Modal Editor */}
      <BadgeEditorModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        badge={editingBadge}
        onSave={handleSaveBadge}
        isSaving={createBadgeMutation.isPending || updateBadgeMutation.isPending}
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

export default GameManagementPage;

