import {
  CheckCircle2,
  Hourglass,
  AlertCircle,
  AlertTriangle,
  FileQuestion,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
            className="h-24 bg-card border border-border/60 rounded-xl animate-pulse"
          />
        ))}
        <div className="h-24 bg-card border border-border/60 rounded-xl animate-pulse lg:col-span-2" />
      </div>
    );
  }

  const statCards = [
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
      urgent: false,
    },
    {
      title: "In Progress",
      value: kpis.inProgressCount,
      subtitle: "Actively authoring",
      icon: Hourglass,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      urgent: false,
    },
    {
      title: "Not Started",
      value: kpis.notStartedCount,
      subtitle: "0 questions encoded",
      icon: AlertCircle,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      urgent: false,
    },
    {
      title: "Overdue",
      value: kpis.overdueCount,
      subtitle: "Past deadline",
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: kpis.overdueCount > 0 ? "border-rose-500/40" : "border-rose-500/20",
      urgent: kpis.overdueCount > 0,
    },
  ];

  const totalPct = kpis.overallCompletionRate;
  const circumference = 2 * Math.PI * 22; // radius=22
  const arcOffset = circumference - (totalPct / 100) * circumference;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 4 standard stat cards */}
      {statCards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`relative p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:shadow-sm ${
              card.borderColor
            } ${
              card.urgent ? "shadow-[0_0_0_1px_theme(colors.rose.500/20)] ring-1 ring-rose-500/20" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color} ${
                card.urgent ? "animate-pulse" : ""
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-bold tracking-tight text-foreground truncate">
              {card.urgent && card.value > 0 ? (
                <span className="text-rose-500">{card.value}</span>
              ) : (
                card.value
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
              {card.subtitle}
            </p>
          </div>
        );
      })}

      {/* Featured: Questions Encoded — double-width with radial progress arc */}
      <div className="lg:col-span-2 p-4 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-card/60 backdrop-blur-sm hover:shadow-sm transition-all">
        <div className="flex items-center justify-between gap-3">
          {/* Text side */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <FileQuestion className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Questions Encoded</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.totalEncodedQuestions.toLocaleString()}
              <span className="text-base font-normal text-muted-foreground ml-1">
                / {kpis.totalTargetQuestions.toLocaleString()}
              </span>
            </div>
            <Progress
              value={totalPct}
              className="h-1.5 mt-1 [&>div]:bg-primary"
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {totalPct}% of total target reached
            </p>
          </div>

          {/* Radial arc */}
          <div className="shrink-0 relative hidden sm:flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
              <circle
                cx="32" cy="32" r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-muted/40"
              />
              <circle
                cx="32" cy="32" r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={arcOffset}
                className="text-primary transition-all duration-700"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-foreground">
              {totalPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
