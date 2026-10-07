import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  Dna,
  Droplet,
  ShieldCheck,
  Microscope,
  Scale,
  Sparkles,
  BookOpen,
  Target,
  FileSpreadsheet,
  Layers,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssessments } from "@/features/scores/api/useAssessments";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";
import {
  MEDTECH_SUBJECT_DETAILS,
  type MedTechSubjectDetail,
} from "@/features/scores/types";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  "clinical-chemistry": FlaskConical,
  "microbiology-parasitology": Dna,
  "hematology": Droplet,
  "immunology-serology": ShieldCheck,
  "clinical-microscopy": Microscope,
  "histopathology-medtech-laws": Scale,
};

export function SubjectPassRateAnalytics() {
  const { activeSchoolYear } = useActiveSchoolYear();

  const { data: assessmentsData, isLoading: isLoadingAssessments } = useAssessments({
    schoolYear: activeSchoolYear,
  });

  const assessments = assessmentsData?.assessments || [];

  // Aggregate stats per MedTech subject
  const subjectStats = useMemo(() => {
    return MEDTECH_SUBJECT_DETAILS.map((subject: MedTechSubjectDetail) => {
      const matching = assessments.filter(
        (a) => a.subject.trim().toLowerCase() === subject.name.trim().toLowerCase()
      );

      let passed = 0;
      let failed = 0;
      let totalMeanSum = 0;
      let meanCount = 0;

      for (const a of matching) {
        passed += a.passCount || 0;
        failed += a.failCount || 0;
        if (a.meanScore !== null && a.meanScore !== undefined) {
          totalMeanSum += a.meanScore;
          meanCount++;
        }
      }

      const totalScored = passed + failed;
      const passRate =
        totalScored > 0 ? Number(((passed / totalScored) * 100).toFixed(1)) : null;
      const avgMean =
        meanCount > 0 ? Number((totalMeanSum / meanCount).toFixed(1)) : null;

      let status: "PASSING" | "BORDERLINE" | "AT_RISK" | "NO_DATA" = "NO_DATA";
      if (passRate !== null) {
        if (passRate >= 75) status = "PASSING";
        else if (passRate >= 60) status = "BORDERLINE";
        else status = "AT_RISK";
      }

      return {
        ...subject,
        assessmentsCount: matching.length,
        passed,
        failed,
        totalScored,
        passRate,
        avgMean,
        status,
      };
    });
  }, [assessments]);

  // Overall Global Aggregates
  const overallMetrics = useMemo(() => {
    let totalPassed = 0;
    let totalFailed = 0;

    for (const s of subjectStats) {
      totalPassed += s.passed;
      totalFailed += s.failed;
    }

    const totalScored = totalPassed + totalFailed;
    const overallPassRate =
      totalScored > 0 ? Number(((totalPassed / totalScored) * 100).toFixed(1)) : null;

    // Calculate MTLE Weighted Predicted Index across scored subjects
    let weightedSum = 0;
    let totalWeightsWithScores = 0;

    for (const s of subjectStats) {
      if (s.passRate !== null) {
        weightedSum += s.passRate * (s.weightPercent / 100);
        totalWeightsWithScores += s.weightPercent / 100;
      }
    }

    const predictedBoardPassRate =
      totalWeightsWithScores > 0
        ? Number((weightedSum / totalWeightsWithScores).toFixed(1))
        : null;

    // Determine highest and lowest performing subjects
    const scoredSubjects = subjectStats.filter((s) => s.passRate !== null);
    const sorted = [...scoredSubjects].sort((a, b) => (b.passRate ?? 0) - (a.passRate ?? 0));

    const topSubject = sorted.length > 0 ? sorted[0] : null;
    const lowestSubject =
      sorted.length > 0 && sorted[sorted.length - 1].passRate !== null && sorted[sorted.length - 1].passRate! < 75
        ? sorted[sorted.length - 1]
        : null;

    const passingCount = scoredSubjects.filter((s) => s.passRate! >= 75).length;
    const borderlineCount = scoredSubjects.filter((s) => s.passRate! >= 60 && s.passRate! < 75).length;
    const atRiskCount = scoredSubjects.filter((s) => s.passRate! < 60).length;

    return {
      totalScored,
      totalPassed,
      totalFailed,
      overallPassRate,
      predictedBoardPassRate,
      topSubject,
      lowestSubject,
      passingCount,
      borderlineCount,
      atRiskCount,
      scoredCount: scoredSubjects.length,
    };
  }, [subjectStats]);

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Section Header & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                <span>Subject Licensure Passing Rates</span>
                <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/30">
                  75% Benchmark
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                PRC Medical Technology Board Examination pass rate analytics across all 6 core subjects for S.Y. {activeSchoolYear}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>S.Y. {activeSchoolYear}</span>
          </div>

          <Button asChild size="sm" variant="outline" className="rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer">
            <Link to={`/scores?sy=${encodeURIComponent(activeSchoolYear)}`}>
              <FileSpreadsheet className="size-3.5" />
              <span>Full Scores Hub</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. Top Metric KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Pass Rate */}
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Cohort Passing Rate
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Target className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {overallMetrics.overallPassRate !== null
                  ? `${overallMetrics.overallPassRate}%`
                  : "—"}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                PRC target &ge; 75%
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
              <span className="font-semibold text-foreground">
                {overallMetrics.totalPassed}
              </span>{" "}
              passed of{" "}
              <span className="font-semibold text-foreground">
                {overallMetrics.totalScored}
              </span>{" "}
              total tested
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Weighted Board Readiness */}
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Predicted Board Index
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {overallMetrics.predictedBoardPassRate !== null
                  ? `${overallMetrics.predictedBoardPassRate}%`
                  : "—"}
              </span>
              {overallMetrics.predictedBoardPassRate !== null && (
                <Badge
                  variant="outline"
                  className={`text-[9.5px] font-bold ${
                    overallMetrics.predictedBoardPassRate >= 75
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }`}
                >
                  {overallMetrics.predictedBoardPassRate >= 75
                    ? "Board Ready"
                    : "Intervention Needed"}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              MTLE curriculum weighted average
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Top Performing Subject */}
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Top Discipline
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="text-sm font-black text-foreground truncate">
                {overallMetrics.topSubject?.name || "Pending Assessments"}
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              {overallMetrics.topSubject && overallMetrics.topSubject.passRate !== null ? (
                <>
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>{overallMetrics.topSubject.passRate}% Passing Rate</span>
                </>
              ) : (
                <span className="text-muted-foreground font-normal">Awaiting evaluation results</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Priority Remediation Subject */}
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Attention Required
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="text-sm font-black text-foreground truncate">
                {overallMetrics.lowestSubject?.name || "All Scored Subjects Passing"}
              </span>
            </div>
            <div className="text-[11px] font-bold flex items-center gap-1">
              {overallMetrics.lowestSubject && overallMetrics.lowestSubject.passRate !== null ? (
                <span className="text-rose-600 dark:text-rose-400">
                  {overallMetrics.lowestSubject.passRate}% &bull; Below 75% Target
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  &ge; 75% on evaluated disciplines
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Dual Visualization Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Comparative Subject Passing Rate Bar Graph (7 cols) */}
        <Card className="lg:col-span-7 rounded-3xl border-border bg-card shadow-2xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b border-border/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <span>Subject Passing Rates vs PRC Benchmark</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Performance across the 6 medical technology licensure subjects
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-[10px] font-bold border-border bg-muted/40">
                6 Core Subjects
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-5 flex-1 flex flex-col justify-between">
            {/* Benchmark Legend Strip */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1 px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-500" />
                  <span>&ge;75% Passing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-amber-500" />
                  <span>60–74% Borderline</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-rose-500" />
                  <span>&lt;60% At Risk</span>
                </span>
              </div>
              <span className="font-bold text-foreground flex items-center gap-1">
                <span className="inline-block w-3 border-t-2 border-dashed border-primary" />
                <span>75% Passing Line</span>
              </span>
            </div>

            {/* Subject Horizontal Bar Chart Rows */}
            <div className="space-y-4">
              {subjectStats.map((subject) => {
                const Icon = SUBJECT_ICONS[subject.slug] || BookOpen;
                const rate = subject.passRate;
                const hasData = rate !== null;

                const barColor =
                  !hasData
                    ? "bg-muted"
                    : rate >= 75
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : rate >= 60
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-rose-500 to-red-500";

                const textColor =
                  !hasData
                    ? "text-muted-foreground"
                    : rate >= 75
                    ? "text-emerald-600 dark:text-emerald-400"
                    : rate >= 60
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400";

                return (
                  <div key={subject.slug} className="group space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Link
                        to={`/scores/subject/${subject.slug}?sy=${encodeURIComponent(activeSchoolYear)}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group-hover:translate-x-0.5 duration-150"
                      >
                        <div className="p-1 rounded-md bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <Icon className="size-3.5" />
                        </div>
                        <span className="font-bold text-foreground">{subject.name}</span>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono font-semibold text-muted-foreground border-border/80 px-1.5 py-0"
                        >
                          {subject.code} &bull; {subject.weightPercent}%
                        </Badge>
                      </Link>

                      <div className="flex items-center gap-2">
                        {hasData ? (
                          <>
                            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                              {subject.passed}/{subject.totalScored} passed
                            </span>
                            <span className={`font-black text-xs ${textColor}`}>
                              {rate}%
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium italic">
                            No assessments logged
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bar Track with 75% Benchmark marker */}
                    <div className="relative w-full h-4 rounded-full bg-muted/50 border border-border/60 overflow-hidden">
                      {/* 75% Vertical Guide Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 border-r border-dashed border-primary/70 z-10"
                        style={{ left: "75%" }}
                        title="PRC 75% Passing Benchmark"
                      />

                      {/* Fill Bar */}
                      {hasData && (
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${barColor}`}
                          style={{ width: `${Math.min(100, rate)}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Insight Footer */}
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground flex items-center justify-between">
              <span className="text-[11px] flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary shrink-0" />
                <span>PRC requires a general average of &ge; 75% with no subject below 50%.</span>
              </span>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-bold gap-1 cursor-pointer">
                <Link to={`/scores?sy=${encodeURIComponent(activeSchoolYear)}`}>
                  <span>Enter Scores</span>
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Board Readiness Gauge & MTLE Domain Weights (5 cols) */}
        <Card className="lg:col-span-5 rounded-3xl border-border bg-card shadow-2xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-3 border-b border-border/80">
            <CardTitle className="text-sm font-black text-foreground flex items-center gap-2">
              <Award className="size-4 text-emerald-500" />
              <span>Licensure Exam Readiness Gauge</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Predicted board performance based on official PRC subject weights
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-6 flex-1 flex flex-col justify-between">
            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative size-36 sm:size-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-muted/30 stroke-current"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Path */}
                  <path
                    className={`${
                      (overallMetrics.predictedBoardPassRate ?? 0) >= 75
                        ? "text-emerald-500"
                        : (overallMetrics.predictedBoardPassRate ?? 0) >= 60
                        ? "text-amber-500"
                        : "text-rose-500"
                    } stroke-current transition-all duration-1000 ease-out`}
                    strokeDasharray={`${overallMetrics.predictedBoardPassRate ?? 0}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-foreground tracking-tight">
                    {overallMetrics.predictedBoardPassRate !== null
                      ? `${overallMetrics.predictedBoardPassRate}%`
                      : "—"}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      (overallMetrics.predictedBoardPassRate ?? 0) >= 75
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (overallMetrics.predictedBoardPassRate ?? 0) >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {overallMetrics.predictedBoardPassRate !== null
                      ? overallMetrics.predictedBoardPassRate >= 75
                        ? "Passing Standing"
                        : "Needs Remediation"
                      : "Standby"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center max-w-xs mt-2">
                Calculated from candidate quiz and mock exam scores weighted by MTLE board criteria.
              </p>
            </div>

            {/* Subject Status Breakdown Pills */}
            <div className="space-y-2 border-t border-border/80 pt-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Discipline Performance Breakdown
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      Passing (&ge;75%)
                    </span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {overallMetrics.passingCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                      Borderline (60-74%)
                    </span>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {overallMetrics.borderlineCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span className="text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                      At Risk (&lt;60%)
                    </span>
                  </div>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    {overallMetrics.atRiskCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-muted-foreground/60" />
                    <span className="text-muted-foreground font-bold text-[11px]">
                      Pending Data
                    </span>
                  </div>
                  <span className="font-black text-muted-foreground">
                    {6 - overallMetrics.scoredCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Detailed 6-Subject Cards Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <span>PRC MTLE Core Subjects Hub</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Select any subject to review candidate rosters, score distributions, and upload assessments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((subject) => {
            const Icon = SUBJECT_ICONS[subject.slug] || BookOpen;
            const hasData = subject.passRate !== null;

            return (
              <Card
                key={subject.slug}
                className="rounded-2xl border-border bg-card shadow-2xs hover:border-border/90 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header: Icon + Title + Weight */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-tight">
                          {subject.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Code: {subject.code} &bull; {subject.weightPercent}% Weight
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Rate Metric & Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase">
                        Pass Rate
                      </span>
                      {hasData ? (
                        <span
                          className={`font-black text-sm ${
                            subject.passRate! >= 75
                              ? "text-emerald-600 dark:text-emerald-400"
                              : subject.passRate! >= 60
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {subject.passRate}%
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium italic">
                          No data yet
                        </span>
                      )}
                    </div>

                    <div className="relative w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                      {hasData && (
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            subject.passRate! >= 75
                              ? "bg-emerald-500"
                              : subject.passRate! >= 60
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, subject.passRate!)}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Passed / Scored
                      </span>
                      <span className="font-bold text-foreground text-[11px]">
                        {hasData ? `${subject.passed} / ${subject.totalScored}` : "0 / 0"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Assessments
                      </span>
                      <span className="font-bold text-foreground text-[11px]">
                        {subject.assessmentsCount} logged
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="px-5 py-3 bg-muted/20 border-t border-border/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {subject.avgMean ? `Mean: ${subject.avgMean} pts` : "Score Sheet"}
                  </span>
                  <Link
                    to={`/scores/subject/${subject.slug}?sy=${encodeURIComponent(activeSchoolYear)}`}
                    className="font-bold text-primary hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Manage</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubjectPassRateAnalytics;
