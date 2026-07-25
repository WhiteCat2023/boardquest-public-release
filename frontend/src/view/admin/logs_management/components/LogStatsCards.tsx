import { ScrollText, Info, AlertTriangle, AlertCircle, Flame, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LogStats } from "../hooks/useLogs";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
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
            {isStatsLoading ? <Skeleton className="h-7 w-16" /> : stats?.total ?? totalLogsFallback}
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
  );
}
