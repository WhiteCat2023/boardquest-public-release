import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface LeaderboardToolbarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  timeHorizon: string;
  onTimeHorizonChange: (timeHorizon: string) => void;
}

export default function LeaderboardToolbar({
  searchTerm,
  onSearchChange,
  timeHorizon,
  onTimeHorizonChange,
}: LeaderboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 px-3 bg-card border border-border/80 rounded-xl shadow-2xs font-sans w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search candidate by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-8.5 bg-muted/30 border border-border/80 rounded-lg text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
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

      {/* Right Side: Time Horizon Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <Select value={timeHorizon} onValueChange={onTimeHorizonChange}>
          <SelectTrigger className="h-8.5 w-[125px] sm:w-[130px] bg-muted/30 border-border/80 rounded-lg text-xs font-semibold text-foreground">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all-time">All-Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
