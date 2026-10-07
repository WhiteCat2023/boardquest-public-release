import { Users, Calendar, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardKpiGridProps {
  candidatesCount?: number;
  schedulesCount?: number;
  averageScore?: number | null;
  activeSchoolYear?: string;
}

export function DashboardKpiGrid({
  candidatesCount = 0,
  schedulesCount = 0,
  averageScore = null,
  activeSchoolYear,
}: DashboardKpiGridProps) {
  const kpis = [
    {
      title: "Enrolled Candidates",
      value: candidatesCount,
      subtitle:
        candidatesCount === 0
          ? activeSchoolYear
            ? `No candidates in S.Y. ${activeSchoolYear}`
            : "No candidates enrolled yet"
          : activeSchoolYear
          ? `${candidatesCount} active candidate${candidatesCount === 1 ? "" : "s"} in S.Y. ${activeSchoolYear}`
          : `${candidatesCount} active candidate${candidatesCount === 1 ? "" : "s"}`,
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Evaluation Schedules",
      value: schedulesCount,
      subtitle:
        schedulesCount === 0
          ? activeSchoolYear
            ? `No scheduled review periods in S.Y. ${activeSchoolYear}`
            : "No scheduled review periods"
          : activeSchoolYear
          ? `${schedulesCount} scheduled session${schedulesCount === 1 ? "" : "s"} in S.Y. ${activeSchoolYear}`
          : `${schedulesCount} scheduled session${schedulesCount === 1 ? "" : "s"}`,
      icon: Calendar,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Cohort Evaluation Status",
      value: averageScore !== null ? `${averageScore}%` : "Standby",
      subtitle:
        averageScore !== null
          ? activeSchoolYear
            ? `Average readiness score (S.Y. ${activeSchoolYear})`
            : "Average board readiness score"
          : activeSchoolYear
          ? `Awaiting evaluation results for S.Y. ${activeSchoolYear}`
          : "Awaiting evaluation results",
      icon: Award,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={index}
            className="rounded-2xl border-border bg-card shadow-2xs hover:border-border/80 transition-all"
          >
            <CardContent className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  {kpi.title}
                </span>
                <div
                  className={`p-2 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {kpi.value}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {kpi.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default DashboardKpiGrid;
