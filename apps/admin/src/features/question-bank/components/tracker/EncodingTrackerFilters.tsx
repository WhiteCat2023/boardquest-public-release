import { Search, Bell, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      {/* Search, Subject filter & summary */}
      <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search subject or teacher..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs bg-background"
          />
        </div>

        {/* Subject dropdown */}
        {subjects.length > 0 && (
          <Select
            value={selectedSubject}
            onValueChange={onSubjectChange}
          >
            <SelectTrigger className="h-9 text-xs w-auto min-w-[140px] max-w-[200px] bg-background">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="font-sans text-xs">
              <SelectItem value="ALL" className="text-xs">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id} className="text-xs">
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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

        {/* Summary chip */}
        {incompleteCount > 0 && (
          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 border border-border/60 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 text-amber-500" />
            {incompleteCount} incomplete
          </span>
        )}
      </div>

      {/* Bulk Nudge action */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onNudgeAllClick}
          disabled={incompleteCount === 0}
          className={`h-9 text-xs gap-1.5 text-amber-600 border-amber-300 dark:border-amber-900/60 hover:bg-amber-500/10 cursor-pointer disabled:cursor-not-allowed ${
            incompleteCount > 0 ? "shadow-amber-500/20 shadow-sm" : ""
          }`}
        >
          <Bell className={`w-3.5 h-3.5 ${incompleteCount > 0 ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""}`} />
          Nudge Incomplete ({incompleteCount})
        </Button>
      </div>
    </div>
  );
}
