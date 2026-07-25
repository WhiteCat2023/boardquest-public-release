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

interface ReviewCenterFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCompany: string;
  onCompanyChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  uniqueCompanies: string[];
  uniqueLocations: string[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export default function ReviewCenterFilters({
  searchTerm,
  onSearchChange,
  selectedCompany,
  onCompanyChange,
  selectedLocation,
  onLocationChange,
  uniqueCompanies,
  uniqueLocations,
  hasActiveFilters,
  onResetFilters,
}: ReviewCenterFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs font-sans">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder="Search review center, representative, email, location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-9 h-10 bg-muted/40 border border-border rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Company / Organization Filter */}
        <Select value={selectedCompany} onValueChange={onCompanyChange}>
          <SelectTrigger className="h-10 w-[170px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Organizations</SelectItem>
            {uniqueCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="h-10 w-[150px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
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
            className="h-10 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1.5 cursor-pointer px-3"
          >
            <RotateCcw size={13} />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
