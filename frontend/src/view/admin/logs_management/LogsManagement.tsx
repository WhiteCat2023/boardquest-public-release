import { useState } from "react";
import {
  ScrollText,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Info,
  AlertTriangle,
  AlertCircle,
  Flame,
  ChevronDown,
  ChevronUp,
  Terminal,
  User,
  Globe,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useLogs,
  useLogStats,
  useClearLogs,
} from "./hooks/useLogs";
import type { LogLevelType, LogItem } from "./hooks/useLogs";

export default function LogsManagement() {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const { data: rawLogs = [], isLoading: isLogsLoading, refetch } = useLogs({
    level: selectedLevel,
    search: searchTerm,
  });

  const { data: stats, isLoading: isStatsLoading } = useLogStats();
  const clearLogsMutation = useClearLogs();

  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  const handleToggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const handleCopyMetadata = (id: string, metadata: string) => {
    navigator.clipboard.writeText(metadata);
    setCopiedId(id);
    toast.success("Copied log metadata to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmClear = () => {
    clearLogsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Cleared system audit logs.");
        setIsConfirmClearOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to clear logs.");
        setIsConfirmClearOpen(false);
      },
    });
  };

  // Export visible logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No log entries available to export.");
      return;
    }

    const headers = ["ID", "Level", "Timestamp", "Action", "Source", "User Email", "IP Address", "Message", "Metadata"];
    const rows = logs.map((l) => [
      l.id,
      l.level,
      new Date(l.createdAt).toISOString(),
      `"${l.action || ""}"`,
      `"${l.source || ""}"`,
      `"${l.userEmail || ""}"`,
      `"${l.ipAddress || ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.metadata || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_logs_${selectedLevel.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${logs.length} log records to CSV.`);
  };

  // Render log level badges
  const renderLevelBadge = (level: LogLevelType) => {
    switch (level) {
      case "FATAL":
        return (
          <Badge className="bg-purple-950 text-purple-200 border border-purple-700/60 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
            <Flame size={12} className="text-red-400 fill-red-400" />
            FATAL
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <AlertCircle size={12} className="text-primary" />
            ERROR
          </Badge>
        );
      case "WARN":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <AlertTriangle size={12} className="text-amber-500" />
            WARN
          </Badge>
        );
      case "INFO":
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Info size={12} className="text-blue-500" />
            INFO
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      {/* Sticky Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10">
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
            onClick={() => refetch()}
            className="h-10 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={14} className={isLogsLoading ? "animate-spin" : ""} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="h-10 text-xs font-semibold bg-card border-border text-foreground hover:bg-accent rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download size={14} />
            Export CSV
          </Button>

          <Button
            onClick={() => setIsConfirmClearOpen(true)}
            className="h-10 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-3.5 flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
          >
            <Trash2 size={14} />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* KPI LOG LEVEL STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Logs */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Volume</span>
            <div className="p-2 rounded-xl bg-muted text-foreground">
              <ScrollText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-foreground font-mono">
              {isStatsLoading ? <Skeleton className="h-7 w-16" /> : stats?.total ?? logs.length}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">Recorded log streams</span>
          </div>
        </Card>

        {/* INFO Logs */}
        <Card className="bg-card border border-blue-500/20 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">INFO</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Info size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {isStatsLoading ? <Skeleton className="h-7 w-16" /> : stats?.info ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">Operational events</span>
          </div>
        </Card>

        {/* WARN Logs */}
        <Card className="bg-card border border-amber-500/20 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">WARN</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {isStatsLoading ? <Skeleton className="h-7 w-16" /> : stats?.warn ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">Rate & system warnings</span>
          </div>
        </Card>

        {/* ERROR Logs */}
        <Card className="bg-card border border-primary/20 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">ERROR</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary font-mono">
              {isStatsLoading ? <Skeleton className="h-7 w-16" /> : stats?.error ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">Handled exceptions</span>
          </div>
        </Card>

        {/* FATAL Logs */}
        <Card className="bg-gradient-to-br from-purple-950 via-slate-900 to-red-950 border border-purple-800 text-white rounded-2xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
              FATAL
              <Sparkles size={12} className="text-amber-300 animate-spin" />
            </span>
            <div className="p-2 rounded-xl bg-purple-900/60 text-red-400 border border-purple-700/50">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-2xl font-extrabold text-white font-mono">
              {isStatsLoading ? <Skeleton className="h-7 w-16 bg-purple-900/50" /> : stats?.fatal ?? 0}
            </span>
            <span className="text-[11px] text-purple-300 block mt-0.5">Critical outages</span>
          </div>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 border border-border rounded-2xl shadow-2xs">
        {/* Log Level Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "INFO", "WARN", "ERROR", "FATAL"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedLevel === lvl
                  ? lvl === "FATAL"
                    ? "bg-purple-950 text-white shadow-sm"
                    : lvl === "ERROR"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : lvl === "WARN"
                    ? "bg-amber-500 text-white shadow-sm"
                    : lvl === "INFO"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-primary text-primary-foreground shadow-sm"
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-10 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* LOG STREAM TABLE VIEW */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 px-6 border-b border-border bg-muted/40 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Terminal size={16} className="text-primary" />
            Live Audit Stream ({logs.length} Entries)
          </span>

          <span className="text-[11px] font-mono font-medium text-muted-foreground">
            Auto-refresh active (10s)
          </span>
        </div>

        {isLogsLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <ScrollText size={36} className="text-muted-foreground/40" />
            <h3 className="text-sm font-bold text-foreground">No Log Entries Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              There are no audit logs matching level filter "{selectedLevel}" and search term "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log: LogItem) => {
              const isExpanded = expandedLogId === log.id;
              const formattedDate = new Date(log.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={log.id}
                  className={`transition-colors ${
                    log.level === "FATAL"
                      ? "bg-purple-950/10 hover:bg-purple-950/20"
                      : log.level === "ERROR"
                      ? "bg-primary/5 hover:bg-primary/10"
                      : log.level === "WARN"
                      ? "bg-amber-500/5 hover:bg-amber-500/10"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {/* Main Row summary */}
                  <div
                    onClick={() => handleToggleExpand(log.id)}
                    className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="pt-0.5 shrink-0">{renderLevelBadge(log.level)}</div>

                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground font-mono">
                            {log.action}
                          </span>
                          {log.source && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold text-muted-foreground bg-muted border-border px-2 py-0.2"
                            >
                              {log.source}
                            </Badge>
                          )}
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {formattedDate}
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 font-medium truncate">
                          {log.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                      {log.userEmail && (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <User size={13} className="text-muted-foreground/70" />
                          {log.userEmail}
                        </span>
                      )}

                      {log.ipAddress && (
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Globe size={12} className="text-muted-foreground/70" />
                          {log.ipAddress}
                        </span>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Stack Trace / JSON Metadata Viewer */}
                  {isExpanded && (
                    <div className="p-4 px-6 bg-slate-900 text-slate-100 border-t border-slate-800 text-xs font-mono animate-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal size={14} className="text-emerald-400" />
                          Metadata Inspector & Stack Trace
                        </span>

                        {log.metadata && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyMetadata(log.id, log.metadata!);
                            }}
                            className="h-7 text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg px-2.5 flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedId === log.id ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                Copy JSON
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 overflow-x-auto">
                        <div>
                          <span className="text-slate-500">Log ID: </span>
                          <span className="text-slate-300">{log.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Message: </span>
                          <span className="text-amber-200">{log.message}</span>
                        </div>
                        {log.metadata ? (
                          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                            {(() => {
                              try {
                                return JSON.stringify(JSON.parse(log.metadata), null, 2);
                              } catch {
                                return log.metadata;
                              }
                            })()}
                          </pre>
                        ) : (
                          <span className="text-slate-500 italic">No extra metadata attached.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear Logs Dialog */}
      <AlertDialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trash2 className="text-primary" size={20} />
              Clear Audit Log History?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
              This action will purge all current system audit logs (`INFO`, `WARN`, `ERROR`, `FATAL`). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2">
            <AlertDialogCancel className="h-9 text-xs font-semibold rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
