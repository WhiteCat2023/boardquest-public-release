import { Search, Flame, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SecondaryNavTabs } from "@/components/custom/tabs";

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
      <SecondaryNavTabs
        tabs={[
          { id: "ALL", label: "ALL" },
          { id: "INFO", label: "INFO", icon: Info, tone: "info" },
          { id: "WARN", label: "WARN", icon: AlertTriangle, tone: "warning" },
          { id: "ERROR", label: "ERROR", icon: AlertCircle, tone: "danger" },
          { id: "FATAL", label: "FATAL", icon: Flame, tone: "danger" },
        ]}
        activeTab={selectedLevel}
        onTabChange={onSelectLevel}
      />

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
