import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Trophy,
  Sparkles,
  Award,
  Flame,
  Zap,
  Crown,
  Gem,
  Medal,
  Edit2,
  Trash2,
  Target,
  ShieldCheck,
  Rocket,
  Star,
  Heart,
  Skull,
  Compass,
  BookOpen,
  Swords,
  Flag,
  Feather,
  X,
  Users,
} from "lucide-react";
import type { GameBadge } from "../types/types";
import { BADGE_TYPES } from "./BadgeEditorModal";
import { useGameBadges } from "../api/useGameManagement";

interface BadgesManagementTabProps {
  badges: GameBadge[];
  isLoading?: boolean;
  onAddBadge: () => void;
  onEditBadge: (badge: GameBadge) => void;
  onDeleteBadge: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Medal,
  Trophy,
  Sparkles,
  Flame,
  Award,
  Crown,
  Zap,
  Gem,
  Target,
  ShieldCheck,
  Rocket,
  Star,
  Heart,
  Skull,
  Compass,
  BookOpen,
  Swords,
  Flag,
  Feather,
};

export function BadgesManagementTab({
  badges,
  isLoading = false,
  onAddBadge,
  onEditBadge,
  onDeleteBadge,
  onToggleActive,
}: BadgesManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [imageErrorUrls, setImageErrorUrls] = useState<Record<string, boolean>>({});

  const { data: serverBadges } = useGameBadges({
    search: searchTerm,
    category: selectedCategory,
    badgeType: selectedTier,
    status: selectedStatus,
  });

  const filteredBadges = serverBadges || badges;

  const handleImageError = (url?: string | null) => {
    if (!url) return;
    setImageErrorUrls((prev) => ({ ...prev, [url]: true }));
  };

  const getTierMeta = (badgeOrType?: GameBadge | string) => {
    if (!badgeOrType) return BADGE_TYPES[0];
    if (typeof badgeOrType === "string") {
      return BADGE_TYPES.find((b) => b.type === badgeOrType) || BADGE_TYPES[0];
    }
    const badge = badgeOrType;
    const rawType = (badge.badgeType || badge.tier || "").toLowerCase();
    const match = BADGE_TYPES.find((b) => b.type.toLowerCase() === rawType);
    if (match) return match;

    const c = (badge.color || "").toLowerCase();
    if (c.includes("ffd700") || c.includes("gold") || c.includes("amber-500")) {
      return BADGE_TYPES.find((b) => b.type === "gold") || BADGE_TYPES[0];
    }
    if (c.includes("c0c0c0") || c.includes("silver") || c.includes("slate")) {
      return BADGE_TYPES.find((b) => b.type === "silver") || BADGE_TYPES[0];
    }
    if (c.includes("cd7f32") || c.includes("bronze") || c.includes("amber-600")) {
      return BADGE_TYPES.find((b) => b.type === "bronze") || BADGE_TYPES[0];
    }
    if (c.includes("ff5722") || c.includes("orange") || c.includes("fire")) {
      return BADGE_TYPES.find((b) => b.type === "fire") || BADGE_TYPES[0];
    }
    if (c.includes("00e5ff") || c.includes("cyan") || c.includes("speed")) {
      return (
        BADGE_TYPES.find((b) => (b.type as string) === "speed") ||
        BADGE_TYPES.find((b) => b.type === "lightning") ||
        BADGE_TYPES[0]
      );
    }
    if (c.includes("9c27b0") || c.includes("purple") || c.includes("boss")) {
      return (
        BADGE_TYPES.find((b) => (b.type as string) === "master") ||
        BADGE_TYPES.find((b) => b.type === "cosmic") ||
        BADGE_TYPES[0]
      );
    }
    return BADGE_TYPES[0];
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
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Search & Filter Toolbar - Full Width & Compact */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl border border-border/80 bg-card shadow-xs w-full">
        <div className="flex flex-wrap flex-1 items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search badges, rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-7 h-9 text-xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36 h-9 text-xs font-medium">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="PERFORMANCE">🏆 Performance</SelectItem>
              <SelectItem value="SPEED">⚡ Speed</SelectItem>
              <SelectItem value="MASTERY">🌟 Mastery</SelectItem>
              <SelectItem value="SPECIAL">✨ Special</SelectItem>
              <SelectItem value="STREAK">🔥 Streak</SelectItem>
              <SelectItem value="QUEST">⚔️ Quest</SelectItem>
              <SelectItem value="BOSS">👑 Boss</SelectItem>
              <SelectItem value="SUBJECT">📚 Subject</SelectItem>
              <SelectItem value="EXAM">⚡ Exam</SelectItem>
            </SelectContent>
          </Select>

          {/* Tier Filter */}
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-32 h-9 text-xs font-medium">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              {BADGE_TYPES.map((bt) => (
                <SelectItem key={bt.type} value={bt.type}>
                  <span className={bt.color}>{bt.badgeTag}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-28 h-9 text-xs font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Disabled</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 text-xs text-muted-foreground hover:text-foreground px-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onAddBadge}
            size="sm"
            className="h-9 text-xs font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Badge
          </Button>
        </div>
      </div>

      {/* Badges Compact Full-Width Table View */}
      <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2.5 px-4 font-extrabold">Badge & Artwork</th>
                <th className="py-2.5 px-3 font-extrabold">Tier</th>
                <th className="py-2.5 px-3 font-extrabold">Category</th>
                <th className="py-2.5 px-3 font-extrabold">XP Reward</th>
                <th className="py-2.5 px-3 font-extrabold">Unlock Rule</th>
                <th className="py-2.5 px-3 font-extrabold">Unlocked</th>
                <th className="py-2.5 px-3 font-extrabold">Status</th>
                <th className="py-2.5 px-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-muted rounded w-28" />
                          <div className="h-2.5 bg-muted rounded w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-muted rounded-full w-14" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-16" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-12" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-24" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-16" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-muted rounded-full w-10" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-7 bg-muted rounded w-14 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredBadges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground border border-border flex items-center justify-center">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        {hasActiveFilters ? "No matching badges found" : "No badges created yet"}
                      </h3>
                      <p className="text-xs text-muted-foreground text-center">
                        {hasActiveFilters
                          ? "Try clearing or modifying your search and filter criteria."
                          : "Create your first gamified achievement badge to award student progress."}
                      </p>
                      {hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2 h-8 text-xs cursor-pointer"
                        >
                          Clear All Filters
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={onAddBadge}
                          className="mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create First Badge
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBadges.map((badge) => {
                  const tierMeta = getTierMeta(badge);
                  const IconComp = ICON_MAP[badge.icon || badge.iconName || ""] || Trophy;
                  const photoUrl = badge.spriteUrl || badge.imageUrl;
                  const hasCustomPhoto = Boolean(photoUrl && !imageErrorUrls[photoUrl]);
                  const displayName = badge.name || badge.title;
                  const displayXp = badge.xpReward ?? badge.xp ?? 50;

                  return (
                    <tr
                      key={badge.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Badge Artwork & Title */}
                      <td className="py-2.5 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {hasCustomPhoto ? (
                              <div
                                className={`w-9 h-9 rounded-xl overflow-hidden border bg-background shadow-2xs flex items-center justify-center ${tierMeta.borderColor}`}
                              >
                                <img
                                  src={photoUrl!}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(photoUrl)}
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-xl border bg-background/90 shadow-2xs flex items-center justify-center ${tierMeta.color} ${tierMeta.borderColor}`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-bold text-xs ${tierMeta.color}`}>
                                {displayName}
                              </span>
                              {badge.badgeId && (
                                <span
                                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border/50"
                                  title={`Slug: ${badge.badgeId}`}
                                >
                                  {badge.badgeId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
                              {badge.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-background/80 ${tierMeta.color} ${tierMeta.borderColor}`}
                        >
                          {tierMeta.badgeTag}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold border border-border">
                          {badge.category}
                        </span>
                      </td>

                      {/* XP Reward */}
                      <td className="py-2.5 px-3 font-extrabold text-primary whitespace-nowrap">
                        +{displayXp} XP
                      </td>

                      {/* Unlock Rule */}
                      <td className="py-2.5 px-3">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/40 border border-border text-foreground truncate max-w-[200px] inline-block"
                          title={
                            badge.unlockCondition ||
                            `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`
                          }
                        >
                          {badge.unlockCondition ||
                            `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
                        </span>
                      </td>

                      {/* Unlocked Count */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{badge.unlockedCount || 0} Students</span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={badge.isActive}
                            onCheckedChange={() => onToggleActive(badge.id)}
                          />
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${
                              badge.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {badge.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditBadge(badge)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                            title="Edit Badge"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteBadge(badge.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg"
                            title="Delete Badge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
