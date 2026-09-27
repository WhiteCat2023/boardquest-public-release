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

interface RanksFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onAddRank: () => void;
}

export default function RanksFilterToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
  onAddRank,
}: RanksFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl border border-border/80 bg-card shadow-xs w-full">
      <div className="flex flex-wrap flex-1 items-center gap-2">
        {/* Search Box */}
        <div className="relative flex-1 sm:w-72 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rank title, level, criteria..."
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

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
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
          onClick={onAddRank}
          size="sm"
          className="h-9 text-xs font-bold gap-1.5 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Rank Tier
        </Button>
      </div>
    </div>
  );
}
