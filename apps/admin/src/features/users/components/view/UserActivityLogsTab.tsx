import { useState, useEffect } from "react";
import {
  Clock,
  ShieldAlert,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLogs, type LogItem } from "@/features/logs";
import { isUserOnline } from "@/features/users/utils/userUtils";

interface UserActivityLogsTabProps {
  userEmail: string;
  lastActiveAt?: string;
}

const PAGE_SIZE = 20;

export default function UserActivityLogsTab({
  userEmail,
  lastActiveAt,
}: UserActivityLogsTabProps) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Reset pagination when userEmail changes
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [userEmail]);

  const {
    data: userLogs = [],
    isLoading: isLogsLoading,
    isFetching,
  } = useLogs({
    search: userEmail || "",
    limit,
  });

  const isOnline = isUserOnline(lastActiveAt);
  const hasMore = userLogs.length >= limit;
  const isFetchingMore = isFetching && !isLogsLoading;

  const handleViewMore = () => {
    setLimit((prev) => prev + PAGE_SIZE);
  };

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 5) return "Active now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
      case "FATAL":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level}
          </Badge>
        );
      case "WARN":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
          >
            {level || "INFO"}
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Account Activity & Audit Logs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Session status and recorded audit trail for this user
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {isOnline ? "Online Now" : "Offline"}
              </span>
            </div>
          </div>

          {/* Activity Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-muted/30 rounded-xl border border-border text-xs">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <span className="text-muted-foreground font-medium">
                Last Session Activity:
              </span>
              <span className="font-bold text-foreground">
                {formatLastActive(lastActiveAt)}
              </span>
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {hasMore
                ? `Showing ${userLogs.length} events`
                : `${userLogs.length} event${userLogs.length === 1 ? "" : "s"} recorded`}
            </div>
          </div>

          {/* Logs List Area */}
          {isLogsLoading ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-semibold animate-pulse">
              Loading account activity logs...
            </div>
          ) : userLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2 bg-muted/20 rounded-2xl border border-border/60">
              <ShieldAlert
                size={32}
                className="text-muted-foreground/40 mb-1"
              />
              <div>
                <p className="text-sm font-bold text-foreground">
                  No Activity Logs Found
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  No system audit events or logins recorded for this user yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 pr-1">
                {userLogs.map((log: LogItem) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getLogLevelBadge(log.level)}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground leading-snug truncate max-w-[240px] sm:max-w-md">
                          {log.action || log.message || "User Action"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[240px] sm:max-w-md">
                          {log.message && log.message !== log.action
                            ? log.message
                            : log.source || "System"}
                          {log.ipAddress ? ` • IP: ${log.ipAddress}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground shrink-0">
                      <Clock size={12} />
                      {formatLogDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>

              {/* View More Button or Caught Up State */}
              {hasMore ? (
                <div className="p-3.5 flex justify-center items-center bg-muted/10 border-t border-border rounded-xl">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isFetchingMore}
                    onClick={handleViewMore}
                    className="h-8.5 px-5 rounded-xl border-border bg-card hover:bg-accent text-foreground text-xs font-semibold shadow-2xs gap-2 transition-all cursor-pointer"
                  >
                    {isFetchingMore ? (
                      <>
                        <Loader2
                          size={14}
                          className="animate-spin text-primary"
                        />
                        <span>Loading more activity logs...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown
                          size={14}
                          className="text-muted-foreground"
                        />
                        <span>View More Activity Logs</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : userLogs.length > 0 ? (
                <div className="py-3 px-4 text-center border-t border-border/60 bg-muted/5 rounded-xl">
                  <p className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500/80" />
                    <span>
                      You're all caught up. No more activity logs to load.
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
