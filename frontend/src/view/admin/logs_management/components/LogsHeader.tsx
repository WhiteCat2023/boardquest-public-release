import { ScrollText, RefreshCw, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogsHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
  onOpenClearDialog: () => void;
}

export default function LogsHeader({
  isLoading,
  onRefresh,
  onExportCSV,
  onOpenClearDialog,
}: LogsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ScrollText className="text-primary size-5" />
          System Audit & Logs Management
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
          Monitor application events across levels:
          <span className="inline-flex items-center gap-1 font-semibold text-foreground text-[11px]">
            <span className="size-1.5 rounded-full bg-blue-500" /> INFO
            <span className="size-1.5 rounded-full bg-amber-500 ml-1" /> WARN
            <span className="size-1.5 rounded-full bg-red-600 ml-1" /> ERROR
            <span className="size-1.5 rounded-full bg-purple-700 ml-1" /> FATAL
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="h-8 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-lg px-3 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>

        <Button
          variant="outline"
          onClick={onExportCSV}
          className="h-8 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-lg px-3 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Download size={13} />
          Export CSV
        </Button>

        <Button
          onClick={onOpenClearDialog}
          className="h-8 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg px-3 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
        >
          <Trash2 size={13} />
          Clear Logs
        </Button>
      </div>
    </div>
  );
}
