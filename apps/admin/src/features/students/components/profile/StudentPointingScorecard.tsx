import { useState } from "react";
import {
  Trophy,
  Award,
  BookOpen,
  FileText,
  Calculator,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PointScorecardModal } from "./PointScorecardModal";
import type { Student, SubjectMetricItem } from "../../types/types";

interface StudentPointingScorecardProps {
  student: Student;
}

export function StudentPointingScorecard({ student }: StudentPointingScorecardProps) {
  const [scorecardOpen, setScorecardOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);

  const scorecard = student.scorecardSummary;
  const metrics: SubjectMetricItem[] = student.subjectMetrics || [];

  const totalPoints = scorecard?.totalPoints ?? (student.xp || 0);
  const avgProficiency = scorecard?.avgProficiency ?? 0;
  const avgCompletion = scorecard?.avgCompletion ?? 0;
  const masteredCount = scorecard?.masteredCount ?? 0;
  const totalSubjects = metrics.length || 6;
  const tierStanding = scorecard?.tierStanding || (avgProficiency >= 85 ? "High Distinction" : avgProficiency >= 70 ? "Proficient Standing" : "In Training");

  const tierColor =
    tierStanding === "High Distinction"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : tierStanding === "Proficient Standing"
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";

  const totalQuestions = metrics.reduce(
    (acc, m) => acc + (m.totalQuestionsAnswered || 0),
    0,
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Decorative ambient background accents */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-80 h-28 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner & Actions */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-[9.5px] font-black uppercase tracking-widest text-primary border-primary/30 py-0"
            >
              Academic Score Analytics
            </Badge>
            <Badge
              variant="outline"
              className={`text-[9.5px] font-bold uppercase tracking-wider py-0 ${tierColor}`}
            >
              {tierStanding}
            </Badge>
          </div>
          <h2 className="text-base sm:text-lg font-black font-headline tracking-tight text-foreground uppercase">
            Student Performance Scorecard
          </h2>
          <p className="text-xs text-muted-foreground font-medium max-w-xl">
            Real-time score accumulation, discipline proficiency, and curriculum completion metrics synchronized with the game.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            onClick={() => setScorecardOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs h-8 px-3 flex items-center gap-1.5 shadow-2xs flex-1 md:flex-initial"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Official Scorecard</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setFormulaOpen(true)}
            className="rounded-xl text-xs h-8 px-3 border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 flex-1 md:flex-initial font-bold"
          >
            <Calculator className="w-3.5 h-3.5 text-primary" />
            <span>Point Formula</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 relative z-10">
        {/* Metric 1: Total Earned Points */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-muted/20 border border-primary/20 space-y-0.5">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[9.5px] font-bold uppercase tracking-wider">Total Points</span>
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-primary tracking-tight font-mono">
            {totalPoints.toLocaleString()} <span className="text-xs font-bold text-primary/70">Pts</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">
            Exams, quests & gameplay XP
          </p>
        </div>

        {/* Metric 2: Average Proficiency */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border space-y-0.5 hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Average Proficiency
            </span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-foreground tracking-tight font-mono">
            {avgProficiency}%
          </div>
          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate">
            <span className={avgProficiency >= 75 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 font-bold"}>
              {avgProficiency >= 75 ? "Pass Benchmark Met" : "Target: 75% Standard"}
            </span>
          </p>
        </div>

        {/* Metric 3: Syllabus Completion */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border space-y-0.5 hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Curriculum Progress
            </span>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-foreground tracking-tight font-mono">
            {avgCompletion}%
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">
            Completed modules across subjects
          </p>
        </div>

        {/* Metric 4: Mastered Disciplines */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border space-y-0.5 hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">
              Mastered Disciplines
            </span>
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-foreground tracking-tight font-mono">
            {masteredCount} <span className="text-xs font-bold text-muted-foreground">/ {totalSubjects}</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">
            {masteredCount === totalSubjects ? "All disciplines mastered!" : `${totalSubjects - masteredCount} disciplines remaining`}
          </p>
        </div>
      </div>

      {/* Official Scorecard Modal */}
      <PointScorecardModal
        open={scorecardOpen}
        onOpenChange={setScorecardOpen}
        totalPoints={totalPoints}
        avgAccuracy={avgProficiency}
        totalQuestions={totalQuestions}
        subjects={metrics}
        studentName={student.name}
        studentEmail={student.email}
      />

      {/* Point Calculation Formula Modal */}
      <Dialog open={formulaOpen} onOpenChange={setFormulaOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 border border-border bg-card">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calculator className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                Pointing Formula Reference
              </span>
            </div>
            <DialogTitle className="text-lg font-black text-foreground uppercase tracking-tight">
              How Points Are Calculated
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Mathematical parameters governing candidate evaluation points in BoardQuest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Per-Subject Points (Max 1,200 Pts / subject)
              </span>
              <p className="font-mono text-primary font-bold text-xs">
                Points = (Correct Answers &times; 25) + (Completion % &times; 6)
              </p>
              <ul className="text-muted-foreground text-[11px] space-y-1 list-disc pl-4 pt-1">
                <li><strong>25 Pts</strong> awarded per verified correct question answered in evaluations.</li>
                <li><strong>6 Pts</strong> awarded per 1% of curriculum learning modules completed.</li>
                <li>Capped at 1,200 points maximum per licensure discipline.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Cumulative Standing
              </span>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                Total Scorecard = &sum;(Subject Points) + Player XP
              </p>
              <p className="text-[11px] text-muted-foreground">
                Accumulated from all quest arenas, mock examinations, streak achievements, and syllabus milestones.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
