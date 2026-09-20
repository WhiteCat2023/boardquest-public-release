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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Crown,
  Trophy,
  Star,
  Award,
  Medal,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  Gem,
  Sparkles,
  Rocket,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  X,
  Gift,
} from "lucide-react";
import type { RankTier } from "../types/types";
import { useRankStudents } from "../api/useGameManagement";

interface RanksManagementTabProps {
  ranks: RankTier[];
  isLoading?: boolean;
  onAddRank: () => void;
  onEditRank: (rank: RankTier) => void;
  onDeleteRank: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Award,
  Star,
  Trophy,
  Crown,
  Medal,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  Gem,
  Sparkles,
  Rocket,
};

export function RanksManagementTab({
  ranks,
  isLoading = false,
  onAddRank,
  onEditRank,
  onDeleteRank,
  onToggleActive,
}: RanksManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Inspect Students Modal State
  const [inspectingRank, setInspectingRank] = useState<RankTier | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  // Delete Confirmation Modal State
  const [deletingRank, setDeletingRank] = useState<RankTier | null>(null);

  // Hook for inspecting real students
  const { data: rankStudentsData, isLoading: isStudentsLoading } = useRankStudents(
    inspectingRank ? inspectingRank.id : null,
    { search: studentSearch }
  );

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

  const hasActiveFilters = Boolean(searchTerm) || selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Search & Filter Toolbar - Full Width & Compact */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl border border-border/80 bg-card shadow-xs w-full">
        <div className="flex flex-wrap flex-1 items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rank title, level, criteria..."
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

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 h-9 text-xs font-medium">
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
            onClick={onAddRank}
            size="sm"
            className="h-9 text-xs font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Rank Tier
          </Button>
        </div>
      </div>

      {/* Ranks Compact Full-Width Table View */}
      <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2.5 px-4 font-extrabold">Rank Tier & Artwork</th>
                <th className="py-2.5 px-3 font-extrabold">Level Bracket</th>
                <th className="py-2.5 px-3 font-extrabold">Min Required XP</th>
                <th className="py-2.5 px-3 font-extrabold">Perks & Perks</th>
                <th className="py-2.5 px-3 font-extrabold">Enrolled Students</th>
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
                      <div className="h-4 bg-muted rounded-full w-20" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-16" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 bg-muted rounded w-28" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-6 bg-muted rounded-lg w-24" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-muted rounded-full w-10" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="h-7 bg-muted rounded w-14 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredRanks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground border border-border flex items-center justify-center">
                        <Crown className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        {hasActiveFilters ? "No matching rank tiers found" : "No rank tiers created yet"}
                      </h3>
                      <p className="text-xs text-muted-foreground text-center">
                        {hasActiveFilters
                          ? "Try clearing or modifying your search and filter criteria."
                          : "Configure your first Aspirant rank tier to establish player progression."}
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
                          onClick={onAddRank}
                          className="mt-2 h-8 text-xs font-bold gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create First Rank Tier
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRanks.map((rank) => {
                  const IconComp = ICON_MAP[rank.icon] || Award;
                  const studentCount = rank.studentCount ?? 0;
                  const perksList = Array.isArray(rank.perks) ? rank.perks : [];

                  return (
                    <tr
                      key={rank.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Rank Artwork & Title */}
                      <td className="py-2.5 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: rank.color || "#3B82F6" }}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-foreground">
                                {rank.title}
                              </span>
                              {rank.rankId && (
                                <span
                                  className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border/50"
                                  title={`Slug: ${rank.rankId}`}
                                >
                                  {rank.rankId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs sm:max-w-md">
                              {rank.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Level Bracket */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold border border-border text-foreground">
                          Level {rank.minLevel}{" "}
                          {rank.maxLevel ? `– ${rank.maxLevel}` : "+"}
                        </span>
                      </td>

                      {/* Min Required XP */}
                      <td className="py-2.5 px-3 font-extrabold text-primary whitespace-nowrap">
                        {rank.minXp.toLocaleString()} XP
                      </td>

                      {/* Perks & Benefits */}
                      <td className="py-2.5 px-3">
                        {perksList.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {perksList.slice(0, 2).map((perk, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/50 truncate max-w-[130px]"
                                title={perk}
                              >
                                {perk}
                              </span>
                            ))}
                            {perksList.length > 2 && (
                              <span
                                className="text-[9px] font-bold text-muted-foreground px-1"
                                title={perksList.slice(2).join(", ")}
                              >
                                +{perksList.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">
                            No perks set
                          </span>
                        )}
                      </td>

                      {/* Enrolled Students */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectingRank(rank)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-accent border border-border transition-all cursor-pointer text-[11px]"
                          title="Inspect enrolled students"
                        >
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{studentCount} Students</span>
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rank.isActive}
                            onCheckedChange={() => onToggleActive(rank.id)}
                          />
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${
                              rank.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {rank.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEditRank(rank)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                            title="Edit Rank"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingRank(rank)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer rounded-lg"
                            title="Delete Rank"
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

      {/* Real Enrolled Students Inspection Modal */}
      <Dialog
        open={Boolean(inspectingRank)}
        onOpenChange={(open) => !open && setInspectingRank(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 border-border/80 bg-card overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: inspectingRank?.color || "#3B82F6" }}
              >
                {inspectingRank &&
                  React.createElement(ICON_MAP[inspectingRank.icon] || Award, {
                    className: "w-5 h-5",
                  })}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {inspectingRank?.title} — Enrolled Students
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Real MongoDB student records currently in Level{" "}
                  {inspectingRank?.minLevel}{" "}
                  {inspectingRank?.maxLevel
                    ? `– ${inspectingRank.maxLevel}`
                    : "+"}
                  .
                </DialogDescription>
              </div>
            </div>

            {/* Student Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name or email..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5">
            {isStudentsLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            ) : !rankStudentsData?.students || rankStudentsData.students.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-foreground">
                  No students in this rank tier yet
                </h5>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mt-1">
                  Students will automatically appear here when they reach Level{" "}
                  {inspectingRank?.minLevel} through gameplay and study quizzes.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Total Students: {rankStudentsData.students.length}
                </div>
                {rankStudentsData.students.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {st.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {st.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-xs font-extrabold text-foreground">
                          Level {st.level}
                        </div>
                        <div className="text-[10px] font-bold text-primary">
                          {st.xp?.toLocaleString() || 0} XP
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInspectingRank(null)}
              className="text-xs cursor-pointer"
            >
              Close Directory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingRank)}
        onOpenChange={(open) => !open && setDeletingRank(null)}
      >
        <DialogContent className="sm:max-w-md border-border/80 bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Rank Tier
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete the rank tier{" "}
              <strong className="text-foreground">
                "{deletingRank?.title}"
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingRank(null)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (deletingRank) {
                  onDeleteRank(deletingRank.id);
                  setDeletingRank(null);
                }
              }}
              className="text-xs font-bold cursor-pointer"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RanksManagementTab;
