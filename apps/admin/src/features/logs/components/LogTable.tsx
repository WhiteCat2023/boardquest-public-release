import { useState } from "react";
import {
  Terminal,
  ScrollText,
  User,
  Globe,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Flame,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showFeedback } from "@/components/modal";
import { DataTablePagination } from "@/components/custom/pagination";
import type { LogItem, LogLevelType } from "@/features/logs";

interface LogTableProps {
  logs: LogItem[];
  totalLogs: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPageSelect: (page: number) => void;
  isLoading: boolean;
  selectedLevel: string;
  searchTerm: string;
}

export default function LogTable({
  logs,
  totalLogs,
  currentPage,
  totalPages,
  hasNextPage,
  onNext,
  onPrevious,
  onPageSelect,
  isLoading,
  selectedLevel,
  searchTerm,
}: LogTableProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const handleCopyMetadata = (id: string, metadata: string) => {
    navigator.clipboard.writeText(metadata);
    setCopiedId(id);
    showFeedback.success("Copied log metadata to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderLevelBadge = (level: LogLevelType) => {
    switch (level) {
      case "FATAL":
        return (
          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Flame size={10} className="text-destructive" />
            FATAL
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <AlertCircle size={10} className="text-primary" />
            ERROR
          </Badge>
        );
      case "WARN":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <AlertTriangle size={10} className="text-amber-500" />
            WARN
          </Badge>
        );
      case "INFO":
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Info size={10} className="text-blue-500" />
            INFO
          </Badge>
        );
    }
  };

  const startIdx = totalLogs === 0 ? 0 : (currentPage - 1) * 20 + 1;
  const endIdx = Math.min(currentPage * 20, totalLogs);

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs font-sans p-0 flex flex-col">
      {/* Table Header */}
      <div className="p-2.5 px-4 border-b border-border bg-muted/50 flex items-center justify-between shrink-0">
        <span className="text-[9.5px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Terminal size={14} className="text-primary" />
          Live Audit Stream ({startIdx}–{endIdx} of {totalLogs} Entries)
        </span>

        <span className="text-[10px] font-mono font-medium text-muted-foreground">
          Auto-refresh active (5s)
        </span>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full bg-muted rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
          <ScrollText size={32} className="text-muted-foreground/40" />
          <h3 className="text-xs font-bold text-foreground">
            No Log Entries Found
          </h3>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            There are no audit logs matching level filter "{selectedLevel}" and
            search term "{searchTerm}".
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-y-auto max-h-[460px] md:max-h-[520px] xl:max-h-[600px] scroll-smooth">
          {logs.map((log: LogItem) => {
            const isExpanded = expandedLogId === log.id;
            const formattedDate = new Date(log.createdAt).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              },
            );

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
                {/* Main Row Summary */}
                <div
                  onClick={() => handleToggleExpand(log.id)}
                  className="py-2 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="shrink-0">
                      {renderLevelBadge(log.level)}
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground font-mono">
                          {log.action}
                        </span>
                        {log.source && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-semibold text-muted-foreground bg-muted border-border px-1.5 py-0"
                          >
                            {log.source}
                          </Badge>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formattedDate}
                        </span>
                      </div>

                      <p className="text-[11px] text-foreground/90 font-medium truncate">
                        {log.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                    {log.userEmail && (
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <User size={11} className="text-muted-foreground/70" />
                        {log.userEmail}
                      </span>
                    )}

                    {log.ipAddress && (
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Globe size={11} className="text-muted-foreground/70" />
                        {log.ipAddress}
                      </span>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable Stack Trace / JSON Metadata Viewer */}
                {isExpanded && (
                  <div className="p-3 px-4 bg-slate-900 text-slate-100 border-t border-slate-800 text-xs font-mono animate-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Terminal size={12} className="text-emerald-400" />
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
                          className="h-6 text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 rounded-md px-2 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              Copy JSON
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-x-auto text-[11px]">
                      <div>
                        <span className="text-slate-500">Log ID: </span>
                        <span className="text-slate-300">{log.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Message: </span>
                        <span className="text-amber-200">{log.message}</span>
                      </div>
                      {log.metadata ? (
                        <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300 text-[10.5px] overflow-x-auto whitespace-pre-wrap">
                          {(() => {
                            try {
                              return JSON.stringify(
                                JSON.parse(log.metadata),
                                null,
                                2,
                              );
                            } catch {
                              return log.metadata;
                            }
                          })()}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">
                          No extra metadata attached.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {!isLoading && totalPages > 1 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalLogs}
          pageSize={20}
          hasNextPage={hasNextPage}
          hasPreviousPage={currentPage > 1}
          onNext={onNext}
          onPrevious={onPrevious}
          itemLabel="log entries"
          variant="table-footer"
        />
      )}
    </Card>
  );
}
