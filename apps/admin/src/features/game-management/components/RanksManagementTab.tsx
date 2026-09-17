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
  LayoutGrid,
  List,
  ChevronRight,
  GraduationCap,
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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
      `level ${r.minLevel}`.includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "active" && r.isActive) ||
      (selectedStatus === "inactive" && !r.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rank title, level, criteria..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 h-9 text-xs font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Rank Button */}
          <Button
            onClick={onAddRank}
            className="h-9 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Rank Tier
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-border/60 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredRanks.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-amber-500" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No rank tiers found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {searchTerm || selectedStatus !== "ALL"
              ? "No rank tiers match your current filter criteria."
              : "No rank progression tiers have been configured yet."}
          </p>
          <Button
            onClick={onAddRank}
            variant="outline"
            className="mt-4 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Rank
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRanks.map((rank) => {
            const IconComp = ICON_MAP[rank.icon] || Award;
            const studentCount = rank.studentCount ?? 0;

            return (
              <Card
                key={rank.id}
                className={`border-border/80 transition-all duration-200 overflow-hidden relative group hover:shadow-md ${
                  rank.isActive ? "bg-card" : "bg-card/50 opacity-75"
                }`}
              >
                {/* Accent Color Header Line */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: rank.color }}
                />

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Icon Avatar */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{
                          backgroundColor: rank.color,
                          boxShadow: `0 8px 20px -4px ${rank.color}40`,
                        }}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-foreground tracking-tight">
                            {rank.title}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              rank.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {rank.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {rank.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Level & XP Chips */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border/80">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>
                        Level {rank.minLevel}{" "}
                        {rank.maxLevel ? `– ${rank.maxLevel}` : "+"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <span>{rank.minXp.toLocaleString()} Min XP</span>
                    </div>

                    {/* Enrolled Students Badge */}
                    <button
                      type="button"
                      onClick={() => setInspectingRank(rank)}
                      className="ml-auto flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent border border-border/80 transition-all cursor-pointer"
                      title="Inspect enrolled students"
                    >
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{studentCount} Students</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`toggle-${rank.id}`}
                        checked={rank.isActive}
                        onCheckedChange={() => onToggleActive(rank.id)}
                      />
                      <label
                        htmlFor={`toggle-${rank.id}`}
                        className="text-[11px] text-muted-foreground font-medium cursor-pointer"
                      >
                        {rank.isActive ? "Active in Game" : "Disabled"}
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInspectingRank(rank)}
                        className="h-8 px-2.5 text-xs font-semibold cursor-pointer"
                      >
                        Students
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditRank(rank)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Rank"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingRank(rank)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete Rank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Tier & Badge</th>
                  <th className="py-3 px-4">Level Bracket</th>
                  <th className="py-3 px-4">Min Required XP</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRanks.map((rank) => {
                  const IconComp = ICON_MAP[rank.icon] || Award;
                  const studentCount = rank.studentCount ?? 0;

                  return (
                    <tr
                      key={rank.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: rank.color }}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {rank.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                              {rank.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-bold border border-border">
                          Level {rank.minLevel}{" "}
                          {rank.maxLevel ? `– ${rank.maxLevel}` : "+"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-primary">
                        {rank.minXp.toLocaleString()} XP
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setInspectingRank(rank)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-bold hover:bg-accent border border-border transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{studentCount} Students</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rank.isActive}
                            onCheckedChange={() => onToggleActive(rank.id)}
                          />
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                              rank.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {rank.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEditRank(rank)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingRank(rank)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Delete"
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
        </div>
      )}

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
              className="text-xs"
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
              className="text-xs"
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
              className="text-xs font-bold"
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
