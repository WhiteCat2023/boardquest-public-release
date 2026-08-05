import { ScrollText, Info, AlertTriangle, AlertCircle, Flame, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LogStats } from "@/features/logs";

interface LogStatsCardsProps {
  stats?: LogStats;
  isStatsLoading: boolean;
  totalLogsFallback: number;
}

export default function LogStatsCards({
  stats,
  isStatsLoading,
  totalLogsFallback,
}: LogStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5 font-sans">
      {/* Total Logs */}
      <Card className="col-span-2 sm:col-span-1 bg-card border border-border rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Volume</span>
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-muted text-foreground shrink-0">
            <ScrollText className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 min-w-0">
          <span className="text-lg sm:text-xl font-extrabold text-foreground font-mono block truncate">
            {isStatsLoading ? <Skeleton className="h-5 sm:h-6 w-14" /> : stats?.total ?? totalLogsFallback}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-muted-foreground block mt-0.5 truncate">Recorded log streams</span>
        </div>
      </Card>

      {/* INFO Logs */}
      <Card className="bg-card border border-blue-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">INFO</span>
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Info className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 min-w-0">
          <span className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono block truncate">
            {isStatsLoading ? <Skeleton className="h-5 sm:h-6 w-14" /> : stats?.info ?? 0}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-muted-foreground block mt-0.5 truncate">Operational events</span>
        </div>
      </Card>

      {/* WARN Logs */}
      <Card className="bg-card border border-amber-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">WARN</span>
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 min-w-0">
          <span className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono block truncate">
            {isStatsLoading ? <Skeleton className="h-5 sm:h-6 w-14" /> : stats?.warn ?? 0}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-muted-foreground block mt-0.5 truncate">Rate & system warnings</span>
        </div>
      </Card>

      {/* ERROR Logs */}
      <Card className="bg-card border border-primary/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-primary uppercase tracking-wider truncate">ERROR</span>
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-primary/10 text-primary shrink-0">
            <AlertCircle className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 min-w-0">
          <span className="text-lg sm:text-xl font-extrabold text-primary font-mono block truncate">
            {isStatsLoading ? <Skeleton className="h-5 sm:h-6 w-14" /> : stats?.error ?? 0}
          </span>
          <span className="text-[9.5px] sm:text-[10.5px] text-muted-foreground block mt-0.5 truncate">Handled exceptions</span>
        </div>
      </Card>

      {/* FATAL Logs */}
      <Card className="bg-card border border-destructive/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9.5px] sm:text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1 truncate">
            FATAL
            <Sparkles size={10} className="text-destructive animate-pulse shrink-0" />
          </span>
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-destructive/10 text-destructive shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px]" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 min-w-0">
          <span className="text-lg sm:text-xl font-extrabold text-destructive font-mono block truncate">
            {isStatsLoading ? <Skeleton className="h-5 sm:h-6 w-14" /> : stats?.fatal ?? 0}
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-muted-foreground block mt-0.5 truncate">Critical outages</span>
        </div>
      </Card>
    </div>
  );
}
