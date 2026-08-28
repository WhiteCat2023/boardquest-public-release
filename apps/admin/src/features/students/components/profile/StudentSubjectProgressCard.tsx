import { BarChart3, Target, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects } from "@/features/users";
import type { Student } from "../../types/types";

interface StudentSubjectProgressCardProps {
  student: Student;
}

export function StudentSubjectProgressCard({ student }: StudentSubjectProgressCardProps) {
  const { data: dbCategories = [], isLoading } = useSubjects({ all: true });

  const categoriesList = Array.isArray(dbCategories) ? dbCategories : [];

  const subjectsToDisplay = categoriesList.map((cat: any, index: number) => {
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
      id: cat.id,
      name: cat.name,
      code: defaultCode,
      description: cat.description || `Evaluation progress and mastery benchmark for ${cat.name}.`,
    };
  });

  const getSubjectProgress = (subjectName: string) => {
    if (student?.mastery && Array.isArray(student.mastery)) {
      const match = student.mastery.find((m: any) => {
        if (!m?.subject) return false;
        const s = m.subject.toLowerCase().trim();
        const t = subjectName.toLowerCase().trim();
        return s === t || s.includes(t) || t.includes(s) || (s.length >= 4 && t.length >= 4 && s.slice(0, 4) === t.slice(0, 4));
      });
      if (match) {
        return {
          proficiency: match.proficiency ?? 0,
          minScore: match.minScore ?? 75,
          status: match.status || (match.proficiency >= 75 ? "Proficient" : "In Training"),
        };
      }
    }

    // Fallback calculation from exam results if mastery row doesn't exist
    if (student?.examResults && Array.isArray(student.examResults)) {
      const matchExams = student.examResults.filter((e: any) => {
        if (!e?.subject) return false;
        const s = e.subject.toLowerCase().trim();
        const t = subjectName.toLowerCase().trim();
        return s === t || s.includes(t) || t.includes(s);
      });
      if (matchExams.length > 0) {
        const avgScore = Math.round(matchExams.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / matchExams.length);
        return {
          proficiency: avgScore,
          minScore: 75,
          status: avgScore >= 75 ? "Proficient" : "In Training",
        };
      }
    }

    return {
      proficiency: 0,
      minScore: 75,
      status: "Needs Focus",
    };
  };

  const subjectCount = subjectsToDisplay.length;
  const title =
    subjectCount > 0
      ? `${subjectCount} Licensure Examination ${subjectCount === 1 ? "Subject" : "Subjects"} Progress`
      : "Licensure Examination Subjects Progress";
  const description =
    subjectCount > 0
      ? `Real-time proficiency benchmark and evaluation progress across the ${subjectCount} registered board subjects.`
      : "Real-time proficiency benchmark and evaluation progress across the registered board subjects.";

  return (
    <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-primary" size={22} />
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border">
          <Target size={15} className="text-primary" />
          <span>Pass Benchmark: 75%</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-5 bg-muted/20 border border-border rounded-2xl space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : subjectsToDisplay.length === 0 ? (
        <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <BookOpen className="size-8 text-muted-foreground/50 stroke-[1.5]" />
          <p className="text-xs font-semibold text-foreground">No Licensure Subjects Registered</p>
          <p className="text-[11px] text-muted-foreground">Add subjects in Curriculum Management to begin tracking student progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectsToDisplay.map((subj) => {
            const progress = getSubjectProgress(subj.name);
            const isPassing = progress.proficiency >= progress.minScore;

            return (
              <div
                key={subj.id}
                className="p-5 bg-muted/40 hover:bg-muted/70 border border-border rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-primary/10 text-primary border-primary/20 shrink-0">
                      <BookOpen size={20} className="stroke-[2.2]" />
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
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {subj.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground">Proficiency Score</span>
                    <span className={isPassing ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-primary font-extrabold"}>
                      {progress.proficiency}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden p-0.5 border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.proficiency >= 85
                          ? "bg-emerald-500"
                          : progress.proficiency >= 75
                          ? "bg-teal-500"
                          : progress.proficiency >= 50
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, progress.proficiency))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isPassing
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {progress.status}
                    </Badge>

                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Target: {progress.minScore}%
                    </span>
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
