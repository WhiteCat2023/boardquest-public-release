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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 border border-border rounded-2xl shadow-2xs font-sans">
      {/* Log Level Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
        {(["ALL", "INFO", "WARN", "ERROR", "FATAL"] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => onSelectLevel(lvl)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {lvl === "FATAL" && <Flame size={12} className="text-red-400" />}
            {lvl === "ERROR" && <AlertCircle size={12} />}
            {lvl === "WARN" && <AlertTriangle size={12} />}
            {lvl === "INFO" && <Info size={12} />}
            {lvl}
          </button>
        ))}
      </div>

      {/* Search Keyword Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder="Search log messages, actions, sources, or users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-10 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
