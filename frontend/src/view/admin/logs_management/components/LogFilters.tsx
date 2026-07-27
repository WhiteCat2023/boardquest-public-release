import { Search, Flame, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LogFiltersProps {
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function LogFilters({
  selectedLevel,
  onSelectLevel,
  searchTerm,
  onSearchChange,
}: LogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-card p-2.5 px-3.5 border border-border rounded-xl shadow-2xs font-sans">
      {/* Log Level Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
        {(["ALL", "INFO", "WARN", "ERROR", "FATAL"] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => onSelectLevel(lvl)}
            className={`px-3 h-8 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedLevel === lvl
                ? lvl === "FATAL"
                  ? "bg-purple-950 text-white shadow-xs"
                  : lvl === "ERROR"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : lvl === "WARN"
                  ? "bg-amber-500 text-white shadow-xs"
                  : lvl === "INFO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {lvl === "FATAL" && <Flame size={11} className="text-red-400" />}
            {lvl === "ERROR" && <AlertCircle size={11} />}
            {lvl === "WARN" && <AlertTriangle size={11} />}
            {lvl === "INFO" && <Info size={11} />}
            {lvl}
          </button>
        ))}
      </div>

      {/* Search Keyword Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <Input
          type="text"
          placeholder="Search log messages, actions, sources, or users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-3 h-8 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
