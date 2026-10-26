import { ScrollText, Info, AlertTriangle, AlertCircle, Flame } from "lucide-react";
import type { LogStats } from "@/features/logs";
import { KpiCard } from "@/components/custom/kpi-card";

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
      <KpiCard
        icon={ScrollText}
        title="Total Volume"
        value={stats?.total ?? totalLogsFallback ?? 0}
        subtitle="Recorded log streams"
        isLoading={isStatsLoading}
        className="col-span-2 sm:col-span-1"
      />

      {/* INFO Logs */}
      <KpiCard
        icon={Info}
        title="INFO Logs"
        value={stats?.info ?? 0}
        subtitle="Operational events"
        isLoading={isStatsLoading}
      />

      {/* WARN Logs */}
      <KpiCard
        icon={AlertTriangle}
        title="WARN Logs"
        value={stats?.warn ?? 0}
        subtitle="Rate & system warnings"
        isLoading={isStatsLoading}
      />
  
      {/* ERROR Logs */}
      <KpiCard
        icon={AlertCircle}
        title="ERROR Logs"
        value={stats?.error ?? 0}
        subtitle="Handled exceptions"
        isLoading={isStatsLoading}
      />
  
      {/* FATAL Logs */}
      <KpiCard
        icon={Flame}
        title="FATAL Logs"
        value={stats?.fatal ?? 0}
        subtitle="Critical outages"
        isLoading={isStatsLoading}
      />
    </div>
  );
}
