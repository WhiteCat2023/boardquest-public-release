import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommentFilterToolbarProps {
  filter: "ALL" | "OPEN" | "RESOLVED";
  onFilterChange: (filter: "ALL" | "OPEN" | "RESOLVED") => void;
  totalCount: number;
  unresolvedCount: number;
  resolvedCount: number;
  showingCount: number;
  filteredCount: number;
}

export default function CommentFilterToolbar({
  filter,
  onFilterChange,
  totalCount,
  unresolvedCount,
  resolvedCount,
  showingCount,
  filteredCount,
}: CommentFilterToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
      <div className="flex items-center gap-1.5">
        <Filter size={13} className="text-muted-foreground shrink-0" />
        <span className="text-[11px] font-semibold text-muted-foreground">Filter:</span>
        <Select
          value={filter}
          onValueChange={(val: any) => onFilterChange(val)}
        >
          <SelectTrigger className="h-7 w-[135px] bg-muted/40 border-border rounded-md text-[11px] font-semibold text-foreground px-2">
            <SelectValue placeholder="Filter comments" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Comments ({totalCount})</SelectItem>
            <SelectItem value="OPEN">Open Comments ({unresolvedCount})</SelectItem>
            <SelectItem value="RESOLVED">Resolved ({resolvedCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
        Showing {showingCount} of {filteredCount}
      </span>
    </div>
  );
}
