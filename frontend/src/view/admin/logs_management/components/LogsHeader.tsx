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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <ScrollText className="text-primary" size={26} />
          System Audit & Logs Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
          Monitor application events across industry-standard levels:
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <span className="size-2 rounded-full bg-blue-500" /> INFO
            <span className="size-2 rounded-full bg-amber-500 ml-1" /> WARN
            <span className="size-2 rounded-full bg-red-600 ml-1" /> ERROR
            <span className="size-2 rounded-full bg-purple-700 ml-1" /> FATAL
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="h-10 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>

        <Button
          variant="outline"
          onClick={onExportCSV}
          className="h-10 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <Download size={14} />
          Export CSV
        </Button>

        <Button
          onClick={onOpenClearDialog}
          className="h-10 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
        >
          <Trash2 size={14} />
          Clear Logs
        </Button>
      </div>
    </div>
  );
}
