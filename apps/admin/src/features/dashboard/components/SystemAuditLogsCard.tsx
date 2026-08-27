import { Link } from "react-router-dom";
import { Activity, ArrowRight, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLogs, type LogItem } from "@/features/logs";

export function SystemAuditLogsCard() {
  const { data: logs = [], isLoading } = useLogs();
  const displayLogs = (Array.isArray(logs) ? logs : []).slice(0, 5);

  const getLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
      case "FATAL":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
            {level}
          </Badge>
        );
      case "WARN":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
            {level}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
            {level || "INFO"}
          </Badge>
        );
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Activity className="text-primary size-4" />
          System Audit Logs
        </h2>
        <Link
          to="/logs-management"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All Logs <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground animate-pulse text-xs font-semibold">
          Loading audit logs...
        </div>
      ) : displayLogs.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <ShieldAlert size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">No audit logs recorded yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {displayLogs.map((log: LogItem) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/50 rounded-lg border border-border/70 transition-colors gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getLevelBadge(log.level)}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[170px] md:max-w-[220px]">
                    {log.action || log.message || "System Action"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[170px] md:max-w-[220px] leading-tight mt-0.5">
                    {log.userEmail || log.source || "System"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground shrink-0">
                <Clock size={11} />
                {formatTime(log.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
