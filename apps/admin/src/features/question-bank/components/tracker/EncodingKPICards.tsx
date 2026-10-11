import {
  Users,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  AlertTriangle,
  FileQuestion,
} from "lucide-react";
import type { EncodingTrackerKPIs } from "../../types/encodingTracker.types";

interface EncodingKPICardsProps {
  kpis?: EncodingTrackerKPIs;
  isLoading?: boolean;
}

export function EncodingKPICards({ kpis, isLoading }: EncodingKPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-card border border-border/60 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Faculty",
      value: kpis.totalFaculty,
      subtitle: `${kpis.totalAssignments} subject tracking slots`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Quotas Met",
      value: kpis.completedCount,
      subtitle: `${Math.round(
        (kpis.completedCount / Math.max(1, kpis.totalAssignments)) * 100,
      )}% of assignments`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "In Progress",
      value: kpis.inProgressCount,
      subtitle: "Actively authoring",
      icon: Hourglass,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Not Started",
      value: kpis.notStartedCount,
      subtitle: "0 questions encoded",
      icon: AlertCircle,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
    },
    {
      title: "Overdue",
      value: kpis.overdueCount,
      subtitle: "Past deadline",
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      title: "Questions Encoded",
      value: `${kpis.totalEncodedQuestions} / ${kpis.totalTargetQuestions}`,
      subtitle: `${kpis.overallCompletionRate}% total target met`,
      icon: FileQuestion,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:shadow-sm ${card.borderColor}`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-foreground truncate">
              {card.value}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
