import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BADGE_TYPES } from "../badge-editor/badgeEditorConstants";

interface BadgesFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedTier: string;
  onTierChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onAddBadge: () => void;
}

export default function BadgesFilterToolbar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTier,
  onTierChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
  onAddBadge,
}: BadgesFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl border border-border/80 bg-card shadow-xs w-full">
      <div className="flex flex-wrap flex-1 items-center gap-2">
        {/* Search Box */}
        <div className="relative flex-1 sm:w-64 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search badges, rules..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 h-9 text-xs font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
        <Select value={selectedTier} onValueChange={onTierChange}>
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
        <Select value={selectedStatus} onValueChange={onStatusChange}>
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
            onClick={onResetFilters}
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
  );
}
