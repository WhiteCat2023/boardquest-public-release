import { useNavigate } from "react-router-dom";
import { BarChart3, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import appContent from "@/constants/appContent";
import { useSubjects } from "@/features/users";
import { useDashboardAnalyticsSummary } from "../api/useDashboardAnalytics";

export function SubjectOverviewSection() {
  const navigate = useNavigate();
  const sectionContent = appContent.dashboard.subjectOverview;
  const { data: dbCategories = [], isLoading: isSubjectsLoading } = useSubjects({ all: true });
  const { data: analytics, isLoading: isAnalyticsLoading } = useDashboardAnalyticsSummary();

  const analyticsSubjects = analytics?.subjects || [];
  const categoriesList = Array.isArray(dbCategories) ? dbCategories : [];

  const subjectCount = categoriesList.length;
  const title =
    subjectCount > 0
      ? `${subjectCount} Licensure Examination ${subjectCount === 1 ? "Subject" : "Subjects"} Overview`
      : "Licensure Examination Subjects Overview";

  const description =
    subjectCount > 0
      ? `Current evaluation performance benchmark across the registered board examination domains.`
      : "Current evaluation performance benchmark across board examination domains.";

  // Use all categories from DB or analytics
  const sourceSubjects = categoriesList.length > 0 ? categoriesList : analyticsSubjects;

  const subjectsToDisplay = sourceSubjects.map((cat: any, index: number) => {
    const catName = (cat.name || "").toLowerCase();

    const matchedDbCat = categoriesList.find(
      (c: any) => c.id === cat.id || (c.name || "").toLowerCase() === catName
    );

    const questionCount =
      typeof cat.questionCount === "number"
        ? cat.questionCount
        : typeof matchedDbCat?.questionCount === "number"
          ? matchedDbCat.questionCount
          : typeof cat._count?.questions === "number"
            ? cat._count.questions
            : Array.isArray(cat.questions)
              ? cat.questions.length
              : 0;

    const matchedAnalytics = analyticsSubjects.find(
      (s: any) => s.id === cat.id || (s.name || "").toLowerCase() === catName
    );

    const proficiency =
      typeof cat.proficiency === "number" && cat.proficiency > 0
        ? cat.proficiency
        : typeof matchedAnalytics?.proficiency === "number"
          ? matchedAnalytics.proficiency
          : typeof matchedDbCat?.proficiency === "number"
            ? matchedDbCat.proficiency
            : 0;

    const defaultCode = cat.name
      ? cat.name
          .split(" ")
          .filter(Boolean)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 4) + `-${301 + index}`
      : `SBJ-${index + 1}`;

    return {
      id: cat.id || matchedDbCat?.id,
      name: cat.name || matchedDbCat?.name || `Subject ${index + 1}`,
      code: defaultCode,
      proficiency,
      questionCount,
    };
  });

  const isLoading = isSubjectsLoading && isAnalyticsLoading && sourceSubjects.length === 0;

  return (
    <Card className="w-full shrink-0 min-h-fit bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="text-primary size-4 sm:size-5" />
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {sourceSubjects.length === 0 && !isLoading ? (
        <div className="py-8 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <BookOpen className="size-8 text-muted-foreground/50 stroke-[1.5]" />
          <p className="text-xs font-semibold text-foreground">No Licensure Subjects Registered</p>
          <p className="text-[11px] text-muted-foreground">Add subjects in Curriculum Management to begin tracking board exam domain performance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            : subjectsToDisplay.map((subj, index) => {
                const isPassing = subj.proficiency >= 75;
              const barColor = isPassing ? "bg-emerald-500"
                : subj.proficiency >= 55 ? "bg-amber-500"
                : "bg-rose-500";
                return (
                  <div
                    key={subj.id || subj.code || index}
                    onClick={() => {
                      if (subj.id) {
                        navigate(`/subject-management/${subj.id}`);
                      }
                    }}
                    className="p-3 bg-muted/20 hover:bg-muted/50 border border-border rounded-xl flex flex-col justify-between gap-2.5 transition-all hover:shadow-2xs group cursor-pointer hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg border bg-primary/10 text-primary border-primary/20 shrink-0">
                          <BookOpen size={15} className="stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {subj.code}
                          </span>
                          <h3 className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                            {subj.name}
                          </h3>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium text-muted-foreground bg-muted border border-border/60 shrink-0 px-2 py-0.5"
                      >
                        {subj.questionCount}{" "}
                        {subj.questionCount === 1 ? "Question" : "Questions"}
                      </Badge>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-border/60">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-muted-foreground text-[11px]">
                          {sectionContent.proficiencyLabel}
                        </span>
                        <span
                          className={
                            isPassing
                              ? "text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-amber-600 dark:text-amber-400 font-bold"
                          }
                        >
                          {subj.proficiency}%
                        </span>
                      </div>

                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border border-border/40">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${subj.proficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </Card>
  );
}
