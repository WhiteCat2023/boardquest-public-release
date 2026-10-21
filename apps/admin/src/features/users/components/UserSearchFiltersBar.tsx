import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RoleType } from "@/features/users/types/types";
import { getManagedRolesForFilter } from "@/features/users/utils/userUtils";

interface UserSearchFiltersBarProps {
  currentUserRole?: RoleType | string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedRole: string;
  onRoleChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onResetFilters: () => void;
  showRoleFilter?: boolean;
  isExternalTab?: boolean;
}

export default function UserSearchFiltersBar({
  currentUserRole,
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  showRoleFilter: propShowRoleFilter,
  isExternalTab = false,
}: UserSearchFiltersBarProps) {
  const roleFilterOptions = getManagedRolesForFilter(currentUserRole);
  const showRoleFilter =
    propShowRoleFilter !== undefined
      ? propShowRoleFilter
      : !isExternalTab && roleFilterOptions.length > 0;

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    (showRoleFilter && selectedRole !== "ALL") ||
    selectedStatus !== "ALL";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder={
            isExternalTab
              ? "Search by name, email, employee ID, company..."
              : "Search by name, email, employee ID..."
          }
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-8.5 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg text-xs focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground transition-colors w-full"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-muted"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5 shrink-0"
        >
          <RotateCcw size={12} />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
