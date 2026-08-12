import { BarChart3, Target, FlaskConical, Dna, Droplet, Microscope, ShieldCheck, BookOpenCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Student } from "../../types/types";

export const MAJOR_SUBJECTS = [
  {
    id: "subj-cc",
    code: "CC-301",
    name: "Clinical Chemistry",
    shortName: "Clinical Chemistry",
    icon: FlaskConical,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    description: "Metabolic pathways, enzymes, lipids, electrolytes, & toxicology.",
  },
  {
    id: "subj-mb",
    code: "MB-302",
    name: "Microbiology",
    shortName: "Microbiology & Parasitology",
    icon: Dna,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    description: "Bacteriology, virology, mycology, & antiparasitic agents.",
  },
  {
    id: "subj-he",
    code: "HE-303",
    name: "Hematology",
    shortName: "Hematology & Coagulation",
    icon: Droplet,
    color: "bg-primary/10 text-primary border-primary/20",
    description: "Cell morphology, hemostasis, anemia, & blood disorders.",
  },
  {
    id: "subj-cm",
    code: "CM-304",
    name: "Clinical Microscopy & Parasitology",
    shortName: "Clinical Microscopy",
    icon: Microscope,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description: "Urinalysis, body fluids, & stool examination.",
  },
  {
    id: "subj-is",
    code: "IS-305",
    name: "Immunology & Serology and Immunohematology",
    shortName: "Immunology & Blood Bank",
    icon: ShieldCheck,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    description: "Antigen-antibody reactions, blood banking, & transfusion.",
  },
  {
    id: "subj-hp",
    code: "HP-306",
    name: "Histopathology and Medtech Laws",
    shortName: "Histopath & MT Laws",
    icon: BookOpenCheck,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    description: "Tissue processing, staining, ethics, & PRC MT laws.",
  },
];

interface StudentSubjectProgressCardProps {
  student: Student;
}

export function StudentSubjectProgressCard({ student }: StudentSubjectProgressCardProps) {
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

    return {
      proficiency: 0,
      minScore: 75,
      status: "Needs Focus",
    };
  };

  return (
    <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-primary" size={22} />
            6 Major Licensure Examination Subjects Progress
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time proficiency benchmark and evaluation progress across the 6 major board subjects.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border">
          <Target size={15} className="text-primary" />
          <span>Pass Benchmark: 75%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MAJOR_SUBJECTS.map((subj) => {
          const IconComp = subj.icon;
          const progress = getSubjectProgress(subj.name);
          const isPassing = progress.proficiency >= progress.minScore;

          return (
            <div
              key={subj.id}
              className="p-5 bg-muted/40 hover:bg-muted/70 border border-border rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xs group"
            >
              <div className="flex items-start justify-between gap-3">
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
    </Card>
  );
}
