import { Search, Bell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubjectOption {
  id: string;
  name: string;
}

interface EncodingTrackerFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedSubject: string;
  onSubjectChange: (val: string) => void;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  subjects: SubjectOption[];
  schoolYear?: string;
  onNudgeAllClick: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  incompleteCount: number;
}

export function EncodingTrackerFilters({
  search,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  subjects,
  onNudgeAllClick,
  onResetFilters,
  hasActiveFilters,
  incompleteCount,
}: EncodingTrackerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card border border-border/70 rounded-xl p-3 shadow-2xs font-sans">
      {/* Search & Subject select */}
      <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search subject or assigned teacher..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs bg-background"
          />
        </div>


        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Bulk Nudge action */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onNudgeAllClick}
          disabled={incompleteCount === 0}
          className="h-9 text-xs gap-1.5 text-amber-600 border-amber-300 dark:border-amber-900/60 hover:bg-amber-500/10 cursor-pointer disabled:cursor-not-allowed"
        >
          <Bell className="w-3.5 h-3.5" />
          Nudge Incomplete ({incompleteCount})
        </Button>
      </div>
    </div>
  );
}

