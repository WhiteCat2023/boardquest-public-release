import { Search, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewCenterStudentsFilterToolbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedSchoolYear: string;
  onSchoolYearChange: (sy: string) => void;
  schoolYears: string[];
  selectedGameStatus: string;
  onGameStatusChange: (status: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function ReviewCenterStudentsFilterToolbar({
  searchTerm,
  onSearchTermChange,
  selectedSchoolYear,
  onSchoolYearChange,
  schoolYears,
  selectedGameStatus,
  onGameStatusChange,
  onResetFilters,
  hasActiveFilters,
}: ReviewCenterStudentsFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-2xs w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search enrolled candidates by name, email, ID..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-9 pr-8 h-9 bg-muted/30 border border-border/80 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchTermChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* School Year Filter */}
        <Select value={selectedSchoolYear} onValueChange={onSchoolYearChange}>
          <SelectTrigger className="h-9 w-[140px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
            <SelectValue placeholder="All School Years" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All School Years</SelectItem>
            {schoolYears.map((sy) => (
              <SelectItem key={sy} value={sy} className="text-xs">
                S.Y. {sy}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Game Status Filter */}
        <Select value={selectedGameStatus} onValueChange={onGameStatusChange}>
          <SelectTrigger className="h-9 w-[145px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
            <SelectValue placeholder="Game Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Game Status</SelectItem>
            <SelectItem value="REGISTERED">Playing Game</SelectItem>
            <SelectItem value="UNREGISTERED">Not in Game Yet</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1 cursor-pointer px-2.5"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
