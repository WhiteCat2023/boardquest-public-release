import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MAJOR_SUBJECTS } from "../constants/subjects";
import appContent from "@/constants/appContent";

export function SubjectOverviewSection() {
  const sectionContent = appContent.dashboard.subjectOverview;

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-2xs flex flex-col gap-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="text-primary size-5" />
            {sectionContent.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sectionContent.description}
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit"
        >
          {sectionContent.benchmarkBadge}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {MAJOR_SUBJECTS.map((subj) => {
          const IconComp = subj.icon;
          const isPassing = subj.proficiency >= 75;
          return (
            <div
              key={subj.code}
              className="p-3.5 bg-muted/30 hover:bg-muted/60 border border-border rounded-xl flex flex-col justify-between gap-3 transition-all hover:shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border ${subj.color} shrink-0`}>
                  <IconComp size={16} className="stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    {subj.code}
                  </span>
                  <h3 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                    {subj.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-border">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-muted-foreground">{sectionContent.proficiencyLabel}</span>
                  <span
                    className={
                      isPassing
                        ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                        : "text-amber-600 dark:text-amber-400 font-extrabold"
                    }
                  >
                    {subj.proficiency}%
                  </span>
                </div>

                <div className="w-full bg-muted/80 h-2 rounded-full overflow-hidden border border-border/50">
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
