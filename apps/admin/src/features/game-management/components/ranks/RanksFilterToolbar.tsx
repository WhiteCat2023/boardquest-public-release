import { Search, Plus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RanksFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onAddRank: () => void;
}

export default function RanksFilterToolbar({
  searchTerm,
  onSearchChange,
  onResetFilters,
  hasActiveFilters,
  onAddRank,
}: RanksFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 px-3 rounded-xl border border-border/80 bg-card shadow-2xs w-full font-sans">
      <div className="flex flex-wrap flex-1 items-center gap-2">
        {/* Search Box */}
        <div className="relative flex-1 sm:max-w-md min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rank title, level, criteria..."
            className="pl-8 pr-7 h-8.5 text-xs font-medium bg-muted/30 border-border rounded-lg"
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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-2.5 cursor-pointer gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </Button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={onAddRank}
          size="sm"
          className="h-8.5 text-xs font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Create Rank Tier
        </Button>
      </div>
    </div>
  );
}
