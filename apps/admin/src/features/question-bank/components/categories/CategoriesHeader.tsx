import React from "react";
import { Search, Plus, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoriesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalCount: number;
  isTeacher?: boolean;
  canManage?: boolean;
  onOpenAddModal?: () => void;
}

export function CategoriesHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalCount,
  isTeacher = false,
  canManage = false,
  onOpenAddModal,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs font-sans w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search subject or keywords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-8.5 bg-muted/30 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground w-full"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Action Controls & Stats */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Cards View"
            aria-label="Cards View"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
            aria-label="List View"
          >
            <List size={14} />
          </button>
        </div>

        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
          {isTeacher ? "Handled Subjects" : "Total Subjects"}: {totalCount}
        </span>

        {canManage && onOpenAddModal && (
          <Button
            onClick={onOpenAddModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 h-8.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Add Subject
          </Button>
        )}
      </div>
    </div>
  );
}

export default CategoriesHeader;
