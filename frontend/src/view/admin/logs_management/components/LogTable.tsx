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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { LogItem, LogLevelType } from "../hooks/useLogs";

interface LogTableProps {
  logs: LogItem[];
  isLoading: boolean;
  selectedLevel: string;
  searchTerm: string;
}

export default function LogTable({
  logs,
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
    toast.success("Copied log metadata to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

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
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs font-sans">
      {/* Table Header */}
      <div className="p-4 px-6 border-b border-border bg-muted/40 flex items-center justify-between">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Terminal size={16} className="text-primary" />
          Live Audit Stream ({logs.length} Entries)
        </span>

        <span className="text-[11px] font-mono font-medium text-muted-foreground">
          Auto-refresh active (5s)
        </span>
      </div>

      {isLoading ? (
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
                {/* Main Row Summary */}
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
  );
}
