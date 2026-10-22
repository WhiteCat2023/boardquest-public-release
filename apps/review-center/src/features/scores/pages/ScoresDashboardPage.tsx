import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Dna,
  Droplet,
  ShieldCheck,
  Microscope,
  Scale,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAssessments } from "../api/useAssessments";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";
import { MEDTECH_SUBJECT_DETAILS } from "../types";
import type { MedTechSubjectDetail } from "../types";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  "clinical-chemistry": FlaskConical,
  "microbiology-parasitology": Dna,
  hematology: Droplet,
  "immunology-serology": ShieldCheck,
  "clinical-microscopy": Microscope,
  "histopathology-medtech-laws": Scale,
};

export function ScoresDashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { activeSchoolYear } = useActiveSchoolYear();
  const selectedSchoolYear = searchParams.get("sy") || activeSchoolYear;

  // Queries (Fetch all assessments to compute category metrics)
  const { data: assessmentsData, isLoading } = useAssessments({
    schoolYear: selectedSchoolYear,
  });

  const assessments = assessmentsData?.assessments || [];

  // Group assessments by subject
  const subjectStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        count: number;
        meanSum: number;
        meanCount: number;
        passed: number;
        totalScored: number;
      }
    >();

    for (const detail of MEDTECH_SUBJECT_DETAILS) {
      map.set(detail.name, {
        count: 0,
        meanSum: 0,
        meanCount: 0,
        passed: 0,
        totalScored: 0,
      });
    }

    for (const a of assessments) {
      const existing = map.get(a.subject) || {
        count: 0,
        meanSum: 0,
        meanCount: 0,
        passed: 0,
        totalScored: 0,
      };
      existing.count++;
      if (a.meanScore !== null && a.meanScore !== undefined) {
        existing.meanSum += a.meanScore;
        existing.meanCount++;
      }
      existing.passed += a.passCount || 0;
      existing.totalScored += (a.passCount || 0) + (a.failCount || 0);
      map.set(a.subject, existing);
    }

    return map;
  }, [assessments]);

  // Overall Global Statistics
  const aggregateStats = useMemo(() => {
    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        avgMean: null,
        avgMedian: null,
        totalPassed: 0,
        totalFailed: 0,
        totalStudentsScored: 0,
        passRate: null,
      };
    }

    let totalMeanSum = 0;
    let meanCount = 0;
    let totalMedianSum = 0;
    let medianCount = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const a of assessments) {
      if (a.meanScore !== null && a.meanScore !== undefined) {
        totalMeanSum += a.meanScore;
        meanCount++;
      }
      if (a.medianScore !== null && a.medianScore !== undefined) {
        totalMedianSum += a.medianScore;
        medianCount++;
      }
      totalPassed += a.passCount || 0;
      totalFailed += a.failCount || 0;
    }

    const totalStudentsScored = totalPassed + totalFailed;
    const passRate =
      totalStudentsScored > 0
        ? Number(((totalPassed / totalStudentsScored) * 100).toFixed(1))
        : null;

    return {
      totalAssessments: assessments.length,
      avgMean: meanCount > 0 ? (totalMeanSum / meanCount).toFixed(1) : null,
      avgMedian:
        medianCount > 0 ? (totalMedianSum / medianCount).toFixed(1) : null,
      totalPassed,
      totalFailed,
      totalStudentsScored,
      passRate,
    };
  }, [assessments]);

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 pb-12 font-sans animate-in fade-in duration-200">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="size-10 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
              <Award className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Student Scores & Grade Management
            </h1>
            <Badge
              variant="secondary"
              className="font-semibold text-xs flex items-center gap-1"
            >
              <Calendar className="size-3 text-muted-foreground" />
              <span>SY {selectedSchoolYear}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
            Official PRC Board Exam Subjects Hub • Select any category below to
            manage quizzes, comprehensive mock exams, and grade sheets for
            enrolled candidates.
          </p>
        </div>
      </div>

      {/* ── 2. High-Level Statistical Summary Grid (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Assessments */}
        <Card className="rounded-2xl bg-card border-border shadow-2xs hover:shadow-xs transition-all duration-200">
          <CardContent className="p-4.5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
              <BookOpen className="size-5.5" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                Assessments
              </p>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {aggregateStats.totalAssessments}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Across 6 licensure subjects
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cohort Mean */}
        <Card className="rounded-2xl bg-card border-border shadow-2xs hover:shadow-xs transition-all duration-200">
          <CardContent className="p-4.5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
              <BarChart3 className="size-5.5" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                Cohort Mean (Avg)
              </p>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {aggregateStats.avgMean !== null
                  ? `${aggregateStats.avgMean} pts`
                  : "—"}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Overall score average
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cohort Median */}
        <Card className="rounded-2xl bg-card border-border shadow-2xs hover:shadow-xs transition-all duration-200">
          <CardContent className="p-4.5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
              <TrendingUp className="size-5.5" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                Cohort Median
              </p>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {aggregateStats.avgMedian !== null
                  ? `${aggregateStats.avgMedian} pts`
                  : "—"}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                50th percentile midpoint
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Passing Rate */}
        <Card className="rounded-2xl bg-card border-border shadow-2xs hover:shadow-xs transition-all duration-200">
          <CardContent className="p-4.5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5.5" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                  Passing Rate (&ge; 75%)
                </p>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {aggregateStats.passRate !== null ? (
                    `${aggregateStats.passRate}%`
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>

            {aggregateStats.passRate !== null && (
              <div className="space-y-1">
                <Progress
                  value={aggregateStats.passRate}
                  className="h-1.5 bg-muted"
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{aggregateStats.totalPassed} Passed</span>
                  <span>{aggregateStats.totalFailed} Failed</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 3. 6 MTLE Subjects Section ── */}
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <Layers className="size-5 text-foreground" />
              <span>MTLE Licensure Examination Subjects</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any category card to access quizzes, mock exams, upload
              scores, and view individual student grade slips.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
              6 Subjects • 100% Board Weight
            </span>
          </div>
        </div>

        {/* 3 Columns Full-Width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
          {MEDTECH_SUBJECT_DETAILS.map((subject: MedTechSubjectDetail) => {
            const Icon = SUBJECT_ICONS[subject.slug] || FlaskConical;

            const stats = subjectStatsMap.get(subject.name) || {
              count: 0,
              meanSum: 0,
              meanCount: 0,
              passed: 0,
              totalScored: 0,
            };

            const subjectMean =
              stats.meanCount > 0
                ? (stats.meanSum / stats.meanCount).toFixed(1)
                : null;
            const subjectPassRate =
              stats.totalScored > 0
                ? Number(((stats.passed / stats.totalScored) * 100).toFixed(1))
                : null;

            return (
              <Card
                key={subject.slug}
                onClick={() =>
                  navigate(
                    `/scores/subject/${subject.slug}?sy=${selectedSchoolYear}`
                  )
                }
                className="group rounded-2xl bg-card border border-border shadow-2xs hover:border-foreground/30 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative"
              >
                <div className="p-5 sm:p-6 space-y-4 flex flex-col flex-1">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="size-12 rounded-2xl bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:bg-foreground group-hover:text-background transition-all duration-200">
                      <Icon className="size-6" />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <Badge
                        variant="outline"
                        className="font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-muted/60 text-foreground border-border"
                      >
                        {subject.weightPercent}% PRC Weight
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10.5px] px-2 py-0.5 rounded-md font-semibold"
                      >
                        {subject.code}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-foreground/80 transition-colors tracking-tight line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  {/* 3-Column Metrics Pill Box */}
                  <div className="bg-muted/40 dark:bg-muted/20 rounded-xl p-3 grid grid-cols-3 gap-2 text-center border border-border/60">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Tests
                      </span>
                      <p className="font-extrabold text-foreground text-sm">
                        {stats.count}
                      </p>
                    </div>

                    <div className="space-y-0.5 border-x border-border/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Mean
                      </span>
                      <p className="font-extrabold text-foreground text-sm">
                        {subjectMean !== null ? `${subjectMean}` : "—"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Pass Rate
                      </span>
                      <p className="font-extrabold text-sm">
                        {subjectPassRate !== null ? (
                          <span className="text-foreground font-black">
                            {subjectPassRate}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-semibold">
                            —
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with Interactive Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      {stats.count === 0
                        ? "No assessments yet"
                        : `${stats.count} assessment${stats.count === 1 ? "" : "s"} recorded`}
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-foreground group-hover:translate-x-1 transition-transform">
                      <span>Open Category</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ScoresDashboardPage;

