import {
  FlaskConical,
  Microscope,
  Droplet,
  Dna,
  Eye,
  FileText,
  BookOpen,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SubjectMetricItem } from "../../types/types";

interface StudentSubjectTechnicalBreakdownProps {
  items: SubjectMetricItem[];
}

const SUBJECT_ICONS: Record<string, any> = {
  "Clinical Chemistry": FlaskConical,
  "Microbiology": Microscope,
  "Hematology": Droplet,
  "Immunology & Serology and Immunohematology": Dna,
  "Clinical Microscopy & Parasitology": Eye,
  "Histopathology & MT Laws": FileText,
  "Histopathology and Medtech Laws": FileText,
};

export function StudentSubjectTechnicalBreakdown({ items }: StudentSubjectTechnicalBreakdownProps) {
  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">
              Curriculum & Mastery Analytics
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight mt-0.5">
            Subject Technical Breakdown
          </h2>
          <p className="text-[11.5px] text-muted-foreground">
            Discipline points, curriculum completion, and question evaluation mastery parameters across board subjects.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
          <Target size={13} className="text-primary" />
          <span>Passing Benchmark: 75%</span>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const IconComponent = SUBJECT_ICONS[item.subject] || FlaskConical;
          const isMastered = item.status === "Mastered" || item.proficiency >= 80;
          const isProficient = item.status === "Proficient" || item.proficiency >= 65;

          const badgeColor = isMastered
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : isProficient
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";

          return (
            <div
              key={item.subject}
              className="p-3.5 border border-border shadow-2xs rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-3 flex flex-col justify-between"
            >
              {/* Top Row: Icon, Title & Status */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isMastered
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate leading-tight">
                      {item.subject}
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                      Points: <strong className="text-primary font-mono text-xs">{item.points} Pts</strong>
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-lg shrink-0 ${badgeColor}`}
                >
                  {item.status || (isMastered ? "Mastered" : isProficient ? "Proficient" : "In Training")}
                </Badge>
              </div>

              {/* Dual Progress Bars: Completion & Mastery */}
              <div className="space-y-3 pt-1 text-xs">
                {/* 1. Syllabus Completion */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground font-medium">Syllabus Completion</span>
                    <span className="font-mono font-bold text-foreground">{item.completion}%</span>
                  </div>
                  <Progress value={item.completion} className="h-1.5 rounded-full" />
                </div>

                {/* 2. Quest Mastery / Proficiency */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground font-medium">Discipline Proficiency</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.proficiency}%
                    </span>
                  </div>
                  <Progress value={item.proficiency} className="h-1.5 rounded-full" />
                </div>
              </div>

              {/* Questions Stats Footer */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10.5px] text-muted-foreground">
                <span>Questions Attempted: <strong>{item.totalQuestionsAnswered}</strong></span>
                <span>Correct Answers: <strong className="text-foreground">{item.totalCorrect}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
