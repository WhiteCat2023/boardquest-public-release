import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Zap,
  Award,
  FlaskConical,
  Dna,
  Droplet,
  Microscope,
  ShieldCheck,
  BookOpenCheck,
  BarChart3,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStudent, useStudents } from "@/features/students";
import { getStudentEarnedBadges } from "@/utils/badgeUtils";

const MAJOR_SUBJECTS = [
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

export default function ViewStudent() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: studentDirect, isLoading: isDirectLoading } = useStudent(studentId);
  const { data: allStudentsData, isLoading: isListLoading } = useStudents({ skip: 0, take: 100 });

  const fallbackStudent = (allStudentsData?.students || []).find((s) => s.id === studentId);
  const student = studentDirect || fallbackStudent;
  const isLoading = isDirectLoading && isListLoading && !student;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!student && !isLoading) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-foreground">Student Profile Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested student account could not be retrieved.</p>
        <Button onClick={() => navigate("/student-management")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-semibold">
          Return to Student Directory
        </Button>
      </div>
    );
  }

  const activeStudent = student || ({
    id: "placeholder",
    name: "Loading Student Name",
    email: "loading.student@university.edu",
    level: 1,
    xp: 100,
    location: "Philippines",
    createdAt: new Date().toISOString(),
  } as any);

  const studentBadges = getStudentEarnedBadges(activeStudent);
  const unlockedBadgesCount = studentBadges.filter((b) => b.unlocked).length;

  const getSubjectProgress = (subjectName: string) => {
    if (activeStudent?.mastery && Array.isArray(activeStudent.mastery)) {
      const match = activeStudent.mastery.find(
        (m: any) =>
          m.subject?.toLowerCase().includes(subjectName.toLowerCase()) ||
          subjectName.toLowerCase().includes(m.subject?.toLowerCase() || "")
      );
      if (match) {
        return {
          proficiency: match.proficiency ?? 0,
          minScore: match.minScore ?? 75,
          status: match.status || (match.proficiency >= 75 ? "Proficient" : "In Training"),
        };
      }
    }

    const level = activeStudent?.level || 1;
    const xp = activeStudent?.xp || 0;
    const baseProficiency = Math.min(95, Math.max(20, (level * 18) + Math.min(30, Math.floor(xp / 100))));

    return {
      proficiency: baseProficiency,
      minScore: 75,
      status: baseProficiency >= 75 ? "Proficient" : baseProficiency >= 50 ? "In Training" : "Needs Focus",
    };
  };

  return (
    <phantom-ui loading={isLoading}>
      <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-6xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground">
        {/* Back button */}
        <button
          onClick={() => navigate("/student-management")}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={16} />
          Back to Student Directory
        </button>

        {/* Hero Banner Card */}
        <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-primary/20 bg-primary/10 text-primary">
                <AvatarFallback className="font-bold text-xl bg-primary/10 text-primary uppercase">
                  {(activeStudent.name || "ST").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                  {activeStudent.name}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>{activeStudent.email}</span> &bull; <span>Location: {activeStudent.location || "Philippines"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-bold gap-1 px-3 py-1 rounded-full">
                <Zap size={13} className="fill-amber-500 text-amber-500" />
                Level {activeStudent.level || 1}
              </Badge>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-xs font-bold px-3 py-1 rounded-full">
                {activeStudent.xp || 0} Total XP
              </Badge>
              <a
                href={`mailto:${activeStudent.email}`}
                className="bg-muted hover:bg-accent text-foreground font-semibold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-colors border border-border"
              >
                <Mail size={14} className="text-primary" />
                Email Student
              </a>
            </div>
          </div>
        </Card>

        {/* Grid: Student Stats & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Account Information */}
          <Card className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <CardHeader className="p-0 border-b border-border pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="text-primary" size={18} />
                Enrolled Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Student ID</span>
                <span className="font-bold text-foreground font-mono">{activeStudent.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Full Name</span>
                <span className="font-semibold text-foreground">{activeStudent.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Email Address</span>
                <span className="font-semibold text-foreground">{activeStudent.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Location</span>
                <span className="font-semibold text-foreground">{activeStudent.location || "Philippines"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground font-medium">Enrollment Date</span>
                <span className="font-semibold text-foreground">{formatDate(activeStudent.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card: Progress Overview */}
          <Card className="bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <CardHeader className="p-0 border-b border-border pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="text-primary" size={18} />
                Academic Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/40 border border-border rounded-2xl">
                  <span className="text-2xl font-extrabold text-primary">{activeStudent.level || 1}</span>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase mt-0.5">Current Level</p>
                </div>
                <div className="p-4 bg-muted/40 border border-border rounded-2xl">
                  <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{activeStudent.xp || 0}</span>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase mt-0.5">Accumulated XP</p>
                </div>
              </div>

              <div className="pt-2 text-muted-foreground leading-relaxed text-xs">
                <p>&bull; <strong>Mastery Records:</strong> {activeStudent.mastery?.length || 6} major subjects tracked</p>
                <p>&bull; <strong>Badges Unlocked:</strong> {unlockedBadgesCount} / {studentBadges.length} achievements earned</p>
                <p>&bull; <strong>Completed Exams:</strong> {activeStudent.examResults?.length || 0} evaluations taken</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earned Achievements & Gamification Badges Showcase */}
        <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
                <Award className="text-primary" size={22} />
                Earned Achievements & Gamification Badges
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Academic milestones, evaluation streak awards, and mastery honors unlocked by {activeStudent.name}.
              </p>
            </div>

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full w-fit">
              {unlockedBadgesCount} / {studentBadges.length} Unlocked
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {studentBadges.map((badge) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    badge.unlocked
                      ? `${badge.bgColor} ${badge.borderColor} shadow-xs hover:-translate-y-0.5`
                      : "bg-muted/40 border-border opacity-50 grayscale"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border bg-card shadow-2xs ${badge.color} ${badge.borderColor}`}>
                      <IconComp size={18} className="stroke-[2.2]" />
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        badge.unlocked
                          ? "bg-card text-foreground border-border"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${badge.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {badge.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 6 Major Board Subjects Performance Section */}
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
      </div>
    </phantom-ui>
  );
}
