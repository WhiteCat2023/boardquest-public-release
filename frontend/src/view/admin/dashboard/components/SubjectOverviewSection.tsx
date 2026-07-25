import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MAJOR_SUBJECTS } from "../constants/subjects";
import appContent from "@/constants/appContent";

export function SubjectOverviewSection() {
  const sectionContent = appContent.dashboard.subjectOverview;

  return (
    <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-primary" size={22} />
            {sectionContent.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sectionContent.description}
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border text-xs font-bold px-3 py-1 rounded-full w-fit"
        >
          {sectionContent.benchmarkBadge}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MAJOR_SUBJECTS.map((subj) => {
          const IconComp = subj.icon;
          return (
            <div
              key={subj.code}
              className="p-5 bg-muted/40 hover:bg-muted/70 border border-border rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${subj.color} shrink-0`}>
                  <IconComp size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {subj.code}
                  </span>
                  <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {subj.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-muted-foreground">{sectionContent.proficiencyLabel}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{subj.proficiency}%</span>
                </div>

                <div className="w-full bg-muted h-2 rounded-full overflow-hidden p-0.5 border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${subj.barColor}`}
                    style={{ width: `${subj.proficiency}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
