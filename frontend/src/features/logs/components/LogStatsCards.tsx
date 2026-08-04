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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 font-sans">
      {/* Total Logs */}
      <Card className="bg-card border border-border rounded-xl p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Volume</span>
          <div className="p-1.5 rounded-lg bg-muted text-foreground">
            <ScrollText size={15} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-foreground font-mono">
            {isStatsLoading ? <Skeleton className="h-6 w-14" /> : stats?.total ?? totalLogsFallback}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Recorded log streams</span>
        </div>
      </Card>

      {/* INFO Logs */}
      <Card className="bg-card border border-blue-500/20 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">INFO</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info size={15} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {isStatsLoading ? <Skeleton className="h-6 w-14" /> : stats?.info ?? 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Operational events</span>
        </div>
      </Card>

      {/* WARN Logs */}
      <Card className="bg-card border border-amber-500/20 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">WARN</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={15} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {isStatsLoading ? <Skeleton className="h-6 w-14" /> : stats?.warn ?? 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Rate & system warnings</span>
        </div>
      </Card>

      {/* ERROR Logs */}
      <Card className="bg-card border border-primary/20 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">ERROR</span>
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <AlertCircle size={15} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-primary font-mono">
            {isStatsLoading ? <Skeleton className="h-6 w-14" /> : stats?.error ?? 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Handled exceptions</span>
        </div>
      </Card>

      {/* FATAL Logs */}
      <Card className="bg-card border border-destructive/20 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
            FATAL
            <Sparkles size={11} className="text-destructive animate-pulse" />
          </span>
          <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
            <Flame size={15} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-destructive font-mono">
            {isStatsLoading ? <Skeleton className="h-6 w-14" /> : stats?.fatal ?? 0}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">Critical outages</span>
        </div>
      </Card>
    </div>
  );
}
