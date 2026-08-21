import { useState } from "react";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { GameConfigTab } from "../components/GameConfigTab";
import { LeaderboardOverviewTab } from "../components/LeaderboardOverviewTab";
import { BadgeEditorModal } from "../components/BadgeEditorModal";
import { Gamepad2, Award, Sliders, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  useGameBadges,
  useCreateBadge,
  useUpdateBadge,
  useToggleBadgeActive,
  useDeleteBadge,
} from "../api/useGameManagement";
import type { GameBadge } from "../types/types";

export function GameManagementPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "config" | "leaderboard">("badges");

  const { data: badges = [], isLoading: isBadgesLoading } = useGameBadges();
  const createBadgeMutation = useCreateBadge();
  const updateBadgeMutation = useUpdateBadge();
  const toggleBadgeMutation = useToggleBadgeActive();
  const deleteBadgeMutation = useDeleteBadge();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<GameBadge | null>(null);

  const handleAddBadge = () => {
    setEditingBadge(null);
    setIsModalOpen(true);
  };

  const handleEditBadge = (badge: GameBadge) => {
    setEditingBadge(badge);
    setIsModalOpen(true);
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
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save badge.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/90 shadow-xs backdrop-blur-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/25 shadow-sm">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Game Content Management
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/25">
                <Sparkles className="w-3 h-3" /> Gamified
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure gamification badges, Cloudinary artwork, XP engine rules, and scoring thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Award className="w-4 h-4" /> Badges Catalog ({badges.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "config"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Sliders className="w-4 h-4" /> XP Engine Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Trophy className="w-4 h-4" /> Student Leaderboard
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

        {activeTab === "config" && <GameConfigTab />}

        {activeTab === "leaderboard" && <LeaderboardOverviewTab />}
      </div>

      {/* Badge Modal Editor */}
      <BadgeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge={editingBadge}
        onSave={handleSaveBadge}
        isSaving={createBadgeMutation.isPending || updateBadgeMutation.isPending}
      />
    </div>
  );
}

export default GameManagementPage;
