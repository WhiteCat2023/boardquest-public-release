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
  selectedStatus: string;
  onStatusChange: (val: string) => void;
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
  selectedStatus,
  onStatusChange,
  subjects,
  schoolYear,
  onNudgeAllClick,
  onResetFilters,
  hasActiveFilters,
  incompleteCount,
}: EncodingTrackerFiltersProps) {
  const statusTabs = [
    { key: "ALL", label: "All" },
    { key: "INCOMPLETE", label: "Incomplete Only" },
    { key: "OVERDUE", label: "Overdue", badgeClass: "bg-rose-500/10 text-rose-500" },
    { key: "NOT_STARTED", label: "Not Started", badgeClass: "bg-slate-500/10 text-slate-400" },
    { key: "IN_PROGRESS", label: "In Progress", badgeClass: "bg-amber-500/10 text-amber-500" },
    { key: "COMPLETED", label: "Completed", badgeClass: "bg-emerald-500/10 text-emerald-500" },
  ];

  return (
    <div className="flex flex-col gap-3 bg-card border border-border/70 rounded-xl p-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search & Subject select */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search faculty name, email, employee ID..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
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
            className="h-9 text-xs gap-1.5 text-amber-600 border-amber-300 dark:border-amber-900/60 hover:bg-amber-500/10"
          >
            <Bell className="w-3.5 h-3.5" />
            Nudge Incomplete ({incompleteCount})
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-t border-border/40 pt-2.5">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
