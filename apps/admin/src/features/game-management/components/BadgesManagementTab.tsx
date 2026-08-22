import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
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
  Layers,
  Users,
  ImageIcon,
} from "lucide-react";
import type { GameBadge, BadgeCategory, BadgeType } from "../types/types";
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [imageErrorUrls, setImageErrorUrls] = useState<Record<string, boolean>>(
    {},
  );

  const { data: serverBadges } = useGameBadges({
    search: searchTerm,
    category: selectedCategory,
    badgeType: selectedTier,
    status: selectedStatus,
  });

  const filteredBadges = serverBadges || badges;

  const totalBadges = badges.length;
  const activeBadges = badges.filter((b) => b.isActive).length;
  const totalXPPool = badges.reduce((acc, b) => acc + (b.xpReward || b.xp || 0), 0);
  const totalUnlockedAcrossAll = badges.reduce(
    (acc, b) => acc + (b.unlockedCount || 0),
    0,
  );

  const handleImageError = (url?: string | null) => {
    if (!url) return;
    setImageErrorUrls((prev) => ({ ...prev, [url]: true }));
  };

  const getTierMeta = (type?: string) => {
    return BADGE_TYPES.find((b) => b.type === type) || BADGE_TYPES[0];
  };

  return (
    <div className="space-y-4">
      {/* Top Gamification Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Badges */}
        <Card className="bg-card/90 border-border/80 shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/15 transition-all" />
          <CardContent className="p-3.5 flex items-center justify-between relative">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Total Badges
              </p>
              <h3 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
                {totalBadges}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeBadges} Active
                in Production
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/25 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* XP Reward Pool */}
        <Card className="bg-card/90 border-border/80 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/15 transition-all" />
          <CardContent className="p-3.5 flex items-center justify-between relative">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                XP Reward Pool
              </p>
              <h3 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
                {totalXPPool.toLocaleString()}{" "}
                <span className="text-sm font-bold text-amber-500">XP</span>
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Milestone gamification rewards
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Unlocked Badges */}
        <Card className="bg-card/90 border-border/80 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/15 transition-all" />
          <CardContent className="p-3.5 flex items-center justify-between relative">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Candidate Unlocks
              </p>
              <h3 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
                {totalUnlockedAcrossAll.toLocaleString()}
              </h3>
              <p className="text-[11px] text-indigo-500 font-semibold flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" /> Earned by Aspirants
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card className="bg-card/90 border-border/80 shadow-xs relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/15 transition-all" />
          <CardContent className="p-3.5 flex items-center justify-between relative">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Configured Tiers
              </p>
              <h3 className="text-2xl font-black text-foreground mt-0.5 tracking-tight">
                {BADGE_TYPES.length} Tiers
              </h3>
              <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5 truncate max-w-[150px]">
                Bronze to Cosmic Tier
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 shadow-xs">
              <Gem className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
        <div className="flex flex-wrap flex-1 items-center gap-2 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search badges, rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-7 h-8.5 text-xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-36 h-8.5 text-xs font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="QUEST">⚔️ Quest</SelectItem>
              <SelectItem value="STREAK">🔥 Streak</SelectItem>
              <SelectItem value="BOSS">👑 Boss</SelectItem>
              <SelectItem value="SUBJECT">📚 Subject</SelectItem>
              <SelectItem value="EXAM">⚡ Exam</SelectItem>
            </SelectContent>
          </Select>

          {/* Tier Filter */}
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-32 h-8.5 text-xs font-semibold">
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
            <SelectTrigger className="w-28 h-8.5 text-xs font-semibold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Disabled</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm ||
            selectedCategory !== "ALL" ||
            selectedTier !== "ALL" ||
            selectedStatus !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedTier("ALL");
                setSelectedStatus("ALL");
              }}
              className="h-8.5 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-border/80 p-0.5 bg-accent/40">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Badge Button */}
          <Button
            onClick={onAddBadge}
            size="sm"
            className="h-8.5 text-xs font-bold gap-1.5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add Badge
          </Button>
        </div>
      </div>

      {/* Badges Grid View */}
      {viewMode === "grid" ? (
        filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
            {filteredBadges.map((badge) => {
              const tierMeta = getTierMeta(badge.badgeType);
              const IconComp = ICON_MAP[badge.icon || badge.iconName || ""] || Trophy;
              const photoUrl = badge.spriteUrl || badge.imageUrl;
              const hasCustomPhoto = Boolean(
                photoUrl && !imageErrorUrls[photoUrl],
              );
              const displayName = badge.name || badge.title;
              const displayXp = badge.xpReward ?? badge.xp ?? 50;

              return (
                <Card
                  key={badge.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border ${tierMeta.borderColor} ${tierMeta.bgColor} bg-card/95 rounded-2xl flex flex-col justify-between`}
                >
                  {/* Subtle Top Ambient Glow Accent */}
                  <div
                    className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-25 bg-gradient-to-br ${tierMeta.gradient} pointer-events-none group-hover:opacity-45 transition-opacity`}
                  />

                  <CardContent className="p-3.5 flex flex-col items-center text-center gap-2.5 h-full relative">
                    {/* Top Row: Tier Tag & XP Pill */}
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[8px] font-extrabold tracking-wider uppercase bg-background/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground shadow-2xs">
                        {tierMeta.badgeTag}
                      </span>
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shadow-2xs">
                        +{displayXp} XP
                      </span>
                    </div>

                    {/* Badge Visual: Cloudinary Image or Fallback Icon */}
                    <div className="my-1 relative">
                      {hasCustomPhoto ? (
                        <div
                          className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-md bg-background flex items-center justify-center p-0.5 transition-transform group-hover:scale-105 ${tierMeta.borderColor}`}
                        >
                          <img
                            src={photoUrl!}
                            alt={displayName}
                            className="w-full h-full object-cover rounded-xl"
                            onError={() => handleImageError(photoUrl)}
                          />
                        </div>
                      ) : (
                        <div
                          className={`p-3.5 rounded-2xl border-2 bg-background/90 shadow-md transition-transform group-hover:scale-105 ${tierMeta.color} ${tierMeta.borderColor}`}
                        >
                          <IconComp className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    {/* Title & Category & Description */}
                    <div className="w-full space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block truncate">
                        {badge.category}
                      </span>
                      <h4
                        className={`text-xs font-black tracking-tight ${tierMeta.color} truncate`}
                        title={displayName}
                      >
                        {displayName}
                      </h4>
                      <p
                        className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed min-h-[28px] px-1"
                        title={badge.description}
                      >
                        {badge.description}
                      </p>
                    </div>

                    {/* Trigger Rule / Unlock Condition */}
                    <div className="w-full pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold gap-1">
                      <span className="text-muted-foreground shrink-0">Unlock:</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-background/70 border border-border/70 text-foreground truncate max-w-[130px]"
                        title={badge.unlockCondition || `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
                      >
                        {badge.unlockCondition || `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
                      </span>
                    </div>

                    {/* Unlock Count & Active Switch */}
                    <div className="w-full flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        {badge.unlockedCount || 0} Unlocked
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold ${
                            badge.isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {badge.isActive ? "Active" : "Off"}
                        </span>
                        <Switch
                          checked={badge.isActive}
                          onCheckedChange={() => onToggleActive(badge.id)}
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="w-full pt-2 border-t border-border/40 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditBadge(badge)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                        title="Edit Badge"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBadge(badge.id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                        title="Delete Badge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-border/80 p-8 flex flex-col items-center justify-center text-center gap-2 bg-card/60 rounded-2xl">
            <div className="p-3 rounded-2xl bg-accent text-muted-foreground">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">
              No Badges Match Your Filters
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query or filter options to locate
              gamification badges.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedTier("ALL");
                setSelectedStatus("ALL");
              }}
              className="mt-2 text-xs"
            >
              Reset All Filters
            </Button>
          </Card>
        )
      ) : (
        /* Badges Table View */
        <Card className="border-border/80 shadow-xs overflow-hidden rounded-2xl bg-card/95">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-accent/50 text-muted-foreground text-[10px] uppercase font-extrabold border-b border-border">
                <tr>
                  <th className="py-3 px-3.5">Badge & Artwork</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">XP Reward</th>
                  <th className="py-3 px-3">Unlock Rule</th>
                  <th className="py-3 px-3">Unlocked</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBadges.map((badge) => {
                  const tierMeta = getTierMeta(badge.badgeType);
                  const IconComp = ICON_MAP[badge.icon || badge.iconName || ""] || Trophy;
                  const photoUrl = badge.spriteUrl || badge.imageUrl;
                  const hasCustomPhoto = Boolean(
                    photoUrl && !imageErrorUrls[photoUrl],
                  );
                  const displayName = badge.name || badge.title;
                  const displayXp = badge.xpReward ?? badge.xp ?? 50;

                  return (
                    <tr
                      key={badge.id}
                      className="hover:bg-accent/25 transition-colors group"
                    >
                      {/* Badge Artwork & Title */}
                      <td className="py-2.5 px-3.5 font-medium flex items-center gap-3">
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
                              className={`p-2 rounded-xl border bg-background/90 shadow-2xs ${tierMeta.color} ${tierMeta.borderColor}`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            className={`font-bold text-xs ${tierMeta.color}`}
                          >
                            {displayName}
                          </div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                            {badge.description}
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-background/80 ${tierMeta.color} ${tierMeta.borderColor}`}
                        >
                          {tierMeta.badgeTag}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-[11px] font-semibold text-muted-foreground">
                        {badge.category}
                      </td>

                      {/* XP Reward */}
                      <td className="py-2.5 px-3 font-extrabold text-primary">
                        +{displayXp} XP
                      </td>

                      {/* Unlock Rule */}
                      <td className="py-2.5 px-3">
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background border border-border/80 text-foreground truncate max-w-[140px] inline-block"
                          title={badge.unlockCondition || `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
                        >
                          {badge.unlockCondition || `${badge.triggerRule?.type || "Rule"} >= ${badge.triggerRule?.threshold || 0}`}
                        </span>
                      </td>

                      {/* Unlocked */}
                      <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                        {badge.unlockedCount || 0} students
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <Switch
                          checked={badge.isActive}
                          onCheckedChange={() => onToggleActive(badge.id)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditBadge(badge)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit Badge"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteBadge(badge.id)}
                            className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                            title="Delete Badge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
