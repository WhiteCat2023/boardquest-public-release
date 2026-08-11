import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import appContent from "@/constants/appContent";
import { useCategories } from "@/features/faculty";
import { SUBJECT_PRESETS } from "../constants/subjects";

export function SubjectOverviewSection() {
  const navigate = useNavigate();
  const sectionContent = appContent.dashboard.subjectOverview;
  const { data: dbCategories = [], isLoading } = useCategories();

  // Take up to 6 categories from DB and format with UI presets
  const topSixCategories = (dbCategories as any[]).slice(0, 6);

  const subjectsToDisplay = topSixCategories.map((cat: any, index: number) => {
    const catName = (cat.name || "").toLowerCase();

    // Try matching preset by keyword or fallback to index position preset
    const presetMatch =
      SUBJECT_PRESETS.find((preset) => catName.includes(preset.keyword)) ||
      SUBJECT_PRESETS[index % SUBJECT_PRESETS.length];

    const questionCount =
      typeof cat.questionCount === "number"
        ? cat.questionCount
        : Array.isArray(cat.questions)
          ? cat.questions.length
          : 0;

    return {
      id: cat.id,
      name: cat.name,
      code: presetMatch.code,
      icon: presetMatch.icon,
      color: presetMatch.color,
      barColor: presetMatch.barColor,
      proficiency: presetMatch.proficiency,
      questionCount,
    };
  });

  return (
    <Card className="bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
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
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-32 text-[10px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : subjectsToDisplay.map((subj, index) => {
              const IconComp = subj.icon;
              const isPassing = subj.proficiency >= 75;
              return (
                <div
                  key={subj.id || subj.code || index}
                  onClick={() => {
                    if (subj.id) {
                      navigate(`/subject-management/${subj.id}`);
                    }
                  }}
                  className="p-3.5 bg-muted/30 hover:bg-muted/60 border border-border rounded-xl flex flex-col justify-between gap-3 transition-all hover:shadow-2xs group cursor-pointer hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg border ${subj.color} shrink-0`}
                      >
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
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border/60 shrink-0 px-2 py-0.5"
                    >
                      {subj.questionCount}{" "}
                      {subj.questionCount === 1 ? "Question" : "Questions"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-border">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-muted-foreground">
                        {sectionContent.proficiencyLabel}
                      </span>
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
