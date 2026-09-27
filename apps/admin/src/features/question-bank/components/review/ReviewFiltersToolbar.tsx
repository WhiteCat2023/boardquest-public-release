import React from "react";
import { Search, RotateCcw, LayoutList, Columns2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewFiltersToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  viewMode: "table" | "workspace";
  onViewModeChange: (mode: "table" | "workspace") => void;
  hasQuestions: boolean;
}

export function ReviewFiltersToolbar({
  searchTerm,
  onSearchTermChange,
  selectedStatus,
  onStatusChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedType,
  onTypeChange,
  onResetFilters,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  hasQuestions,
}: ReviewFiltersToolbarProps) {
  return (
    <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs font-sans">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search pending questions wording..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-8 pr-3 h-8 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground w-full"
        />
      </div>

      {/* Filter Dropdowns & Mode Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 w-full sm:w-[140px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            <SelectItem value="PENDING_REVISION">Pending Revision</SelectItem>
          </SelectContent>
        </Select>

        {/* Difficulty */}
        <Select
          value={selectedDifficulty}
          onValueChange={onDifficultyChange}
        >
          <SelectTrigger className="h-8 w-full sm:w-[120px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground cursor-pointer">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Difficulty</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Question Type */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="h-8 w-full sm:w-[130px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground cursor-pointer">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="MCQ">Multiple Choice</SelectItem>
            <SelectItem value="TRUE_FALSE">True / False</SelectItem>
            <SelectItem value="SHORT_ANSWER">Identification</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
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

        {/* View Mode Switcher Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
            title="Show Questions Table"
          >
            <LayoutList size={13} />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("workspace")}
            disabled={!hasQuestions}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer disabled:opacity-40 ${
              viewMode === "workspace"
                ? "bg-card text-foreground shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
            title="Show Review Workspace"
          >
            <Columns2 size={13} />
            <span>Review Desk</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewFiltersToolbar;
