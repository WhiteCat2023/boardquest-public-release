import { Search, RotateCcw, X, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewCenterFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  uniqueLocations: string[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export default function ReviewCenterFilters({
  searchTerm,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  uniqueLocations,
  hasActiveFilters,
  onResetFilters,
  viewMode = "list",
  onViewModeChange,
}: ReviewCenterFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3.5 rounded-xl shadow-2xs font-sans">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search review center, representative, email, location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-8 bg-muted/30 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter Controls & View Mode */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table List View"
              aria-label="Table List View"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Cards Grid View"
              aria-label="Cards Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        )}

        {/* Location Filter */}
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="h-8 w-[135px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Locations</SelectItem>
            {uniqueLocations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
