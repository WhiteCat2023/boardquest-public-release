import { Users, BookOpen, Calendar, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardKpiGridProps {
  candidatesCount?: number;
  programsCount?: number;
  schedulesCount?: number;
  averageScore?: number | null;
}

export function DashboardKpiGrid({
  candidatesCount = 0,
  programsCount = 0,
  schedulesCount = 0,
  averageScore = null,
}: DashboardKpiGridProps) {
  const kpis = [
    {
      title: "Enrolled Candidates",
      value: candidatesCount,
      subtitle: candidatesCount === 0 ? "No candidates enrolled yet" : `${candidatesCount} active candidates`,
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Active Review Programs",
      value: programsCount,
      subtitle: programsCount === 0 ? "No active programs configured" : `${programsCount} active programs`,
      icon: BookOpen,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Upcoming Exam Schedules",
      value: schedulesCount,
      subtitle: schedulesCount === 0 ? "No scheduled mock exams" : `${schedulesCount} scheduled sessions`,
      icon: Calendar,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Cohort Evaluation Status",
      value: averageScore !== null ? `${averageScore}%` : "Standby",
      subtitle: averageScore !== null ? "Average board readiness score" : "Awaiting evaluation results",
      icon: Award,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="rounded-2xl border-border bg-card shadow-2xs hover:border-border/80 transition-all">
            <CardContent className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}>
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
