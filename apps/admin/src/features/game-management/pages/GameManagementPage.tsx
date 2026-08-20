import { useState, useEffect, useMemo } from "react";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { GameConfigTab } from "../components/GameConfigTab";
import { LeaderboardOverviewTab } from "../components/LeaderboardOverviewTab";
import { BadgeEditorModal } from "../components/BadgeEditorModal";
import { Gamepad2, Award, Sliders, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStudents } from "@/features/students";
import type { GameBadge } from "../types/types";

const LOCAL_STORAGE_KEY = "boardquest_game_badges_v1";

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
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    isActive: true,
    unlockedCount: 0,
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
    color: "text-slate-500 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    glowColor: "shadow-slate-400/10",
    isActive: true,
    unlockedCount: 0,
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
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/40",
    glowColor: "shadow-orange-500/20",
    isActive: true,
    unlockedCount: 0,
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
    borderColor: "border-amber-400/40",
    glowColor: "shadow-amber-400/20",
    isActive: true,
    unlockedCount: 0,
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
    color: "text-purple-500 dark:text-purple-300",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    isActive: true,
    unlockedCount: 0,
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
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/15",
    borderColor: "border-indigo-500/40",
    glowColor: "shadow-indigo-500/20",
    isActive: true,
    unlockedCount: 0,
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
    color: "text-cyan-500 dark:text-cyan-300",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
    isActive: true,
    unlockedCount: 0,
    triggerRule: { type: "level", threshold: 10 },
  },
];

export function GameManagementPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "config" | "leaderboard">("badges");
  const { data: studentsData } = useStudents();
  const rawStudents = studentsData?.students || [];

  const [badges, setBadges] = useState<GameBadge[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading saved badges:", e);
    }
    return INITIAL_BADGES;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<GameBadge | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(badges));
    } catch (e) {
      console.error("Error saving badges to localStorage:", e);
    }
  }, [badges]);

  // Compute live unlock counts from real database students
  const badgesWithRealCounts = useMemo(() => {
    return badges.map((badge) => {
      let realCount = 0;
      rawStudents.forEach((student: any) => {
        const hasAchievementBadge =
          Array.isArray(student.achievements) &&
          student.achievements.some(
            (a: any) =>
              (a.badge && a.badge.toLowerCase() === badge.id.toLowerCase()) ||
              (a.task && a.task.toLowerCase().includes(badge.title.toLowerCase()))
          );

        const matchesTrigger = (() => {
          if (!badge.triggerRule) return false;
          const { type, threshold } = badge.triggerRule;
          if (type === "level" && (student.level || 1) >= threshold) return true;
          if (type === "xp" && (student.xp || 0) >= threshold) return true;
          if (type === "streak" && (student.streak || 0) >= threshold) return true;
          return false;
        })();

        if (hasAchievementBadge || matchesTrigger) {
          realCount++;
        }
      });

      return {
        ...badge,
        unlockedCount: realCount,
      };
    });
  }, [badges, rawStudents]);

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
      return [badgeData, ...prev];
    });
    toast.success(
      editingBadge ? "Badge updated successfully!" : "New gamification badge created!"
    );
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
          <Award className="w-4 h-4" /> Badges Catalog ({badgesWithRealCounts.length})
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
            badges={badgesWithRealCounts}
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
      />
    </div>
  );
}

export default GameManagementPage;
