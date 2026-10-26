import {
  CheckCircle2,
  Hourglass,
  AlertCircle,
  AlertTriangle,
  FileQuestion,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { KpiCard } from "@/components/custom/kpi-card";
import type { EncodingTrackerKPIs } from "../../types/encodingTracker.types";

interface EncodingKPICardsProps {
  kpis?: EncodingTrackerKPIs;
  isLoading?: boolean;
}

export function EncodingKPICards({ kpis, isLoading }: EncodingKPICardsProps) {
  // Only display pulsing skeletons during initial load when no KPI data is available
  if (!kpis || (isLoading && !kpis)) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-card border border-border/60 rounded-2xl animate-pulse"
          />
        ))}
        <div className="h-24 bg-card border border-border/60 rounded-2xl animate-pulse lg:col-span-2" />
      </div>
    );
  }

  const totalPct = kpis.overallCompletionRate;
  const circumference = 2 * Math.PI * 22; // radius=22
  const arcOffset = circumference - (totalPct / 100) * circumference;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Quotas Met */}
      <KpiCard
        icon={CheckCircle2}
        title="Quotas Met"
        value={kpis.completedCount}
      />

      {/* In Progress */}
      <KpiCard
        icon={Hourglass}
        title="In Progress"
        value={kpis.inProgressCount}
      />

      {/* Not Started */}
      <KpiCard
        icon={AlertCircle}
        title="Not Started"
        value={kpis.notStartedCount}
      />

      {/* Overdue */}
      <KpiCard
        icon={AlertTriangle}
        title="Overdue"
        value={kpis.overdueCount}
      />

      <KpiCard
        icon={FileQuestion}
        title="Questions Encoded"
        value={kpis.totalEncodedQuestions}
        className="lg:col-span-2"
        showRadial={true}
        target={kpis.totalTargetQuestions}
        progress={kpis.overallCompletionRate}
        showProgress={true}
      />
    </div>
  );
}
