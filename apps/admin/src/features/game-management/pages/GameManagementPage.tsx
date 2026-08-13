import { useState } from "react";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { GameConfigTab } from "../components/GameConfigTab";
import { BadgeEditorModal } from "../components/BadgeEditorModal";
import { Gamepad2, Award, Sliders } from "lucide-react";
import { toast } from "sonner";
import type { GameBadge } from "../types/types";

const INITIAL_BADGES: GameBadge[] = [
  {
    id: "first_step",
    title: "First Step",
    badgeType: "bronze",
    category: "Progression",
    description: "Enrolled & completed initial evaluation quest",
    xp: 100,
    iconName: "Medal",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    isActive: true,
    unlockedCount: 42,
    triggerRule: { type: "level", threshold: 1 },
  },
  {
    id: "sharp_mind",
    title: "Sharp Mind",
    badgeType: "silver",
    category: "Excellence",
    description: "Achieved high accuracy (>=80%) on diagnostic evaluations",
    xp: 200,
    iconName: "Sparkles",
    color: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    isActive: true,
    unlockedCount: 28,
    triggerRule: { type: "accuracy", threshold: 80 },
  },
  {
    id: "on_fire",
    title: "On Fire",
    badgeType: "fire",
    category: "Consistency",
    description: "Maintained an active evaluation streak (>=3 days)",
    xp: 200,
    iconName: "Flame",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    isActive: true,
    unlockedCount: 35,
    triggerRule: { type: "streak", threshold: 3 },
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    badgeType: "gold",
    category: "Precision",
    description: "Scored top marks (>=90%) in board subject evaluations",
    xp: 300,
    iconName: "Award",
    color: "text-amber-500 dark:text-amber-300",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/30",
    isActive: true,
    unlockedCount: 19,
    triggerRule: { type: "score", threshold: 90 },
  },
  {
    id: "subject_master",
    title: "Subject Master",
    badgeType: "crown",
    category: "Subject Mastery",
    description: "Achieved mastery proficiency (>=75%) in major board subject",
    xp: 400,
    iconName: "Crown",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    isActive: true,
    unlockedCount: 14,
    triggerRule: { type: "mastery", threshold: 75 },
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    badgeType: "lightning",
    category: "Dedication",
    description: "Maintained an extended study streak (>=7 days) & accumulated XP",
    xp: 500,
    iconName: "Zap",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    isActive: true,
    unlockedCount: 8,
    triggerRule: { type: "streak", threshold: 7 },
  },
  {
    id: "decennial",
    title: "Decennial Scholar",
    badgeType: "diamond",
    category: "Elite Status",
    description: "Reached elite academic level status (Level 10+ or XP >= 1000)",
    xp: 1000,
    iconName: "Gem",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    isActive: true,
    unlockedCount: 3,
    triggerRule: { type: "level", threshold: 10 },
  },
];

export function GameManagementPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "config">("badges");
  const [badges, setBadges] = useState<GameBadge[]>(INITIAL_BADGES);
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

  const handleDeleteBadge = (id: string) => {
    setBadges((prev) => prev.filter((b) => b.id !== id));
    toast.success("Gamification badge deleted.");
  };

  const handleToggleActive = (id: string) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    toast.info("Badge status toggled.");
  };

  const handleSaveBadge = (badgeData: GameBadge) => {
    setBadges((prev) => {
      const exists = prev.some((b) => b.id === badgeData.id);
      if (exists) {
        return prev.map((b) => (b.id === badgeData.id ? badgeData : b));
      }
      return [...prev, badgeData];
    });
    toast.success(
      editingBadge ? "Badge updated successfully!" : "New gamification badge created!"
    );
  };

  return (
    <div className="p-4 sm:p-5 max-w-7xl mx-auto space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Game Content Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure gamification badges, XP rules, and scoring thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Badges ({badges.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "config"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> XP Engine Rules
        </button>
      </div>

      <div>
        {activeTab === "badges" && (
          <BadgesManagementTab
            badges={badges}
            onAddBadge={handleAddBadge}
            onEditBadge={handleEditBadge}
            onDeleteBadge={handleDeleteBadge}
            onToggleActive={handleToggleActive}
          />
        )}

        {activeTab === "config" && <GameConfigTab />}
      </div>

      {/* Badge Modal Editor */}
      <BadgeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        badge={editingBadge}
        onSave={handleSaveBadge}
      />
    </div>
  );
}

export default GameManagementPage;
