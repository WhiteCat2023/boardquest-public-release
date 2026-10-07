import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useAssessments,
} from "../api/useAssessments";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";
import {
  MEDTECH_SUBJECT_DETAILS,
} from "../types";
import type { MedTechSubjectDetail } from "../types";

const SUBJECT_ICONS: Record<string, any> = {
  "clinical-chemistry": FlaskConical,
  "microbiology-parasitology": Dna,
  "hematology": Droplet,
  "immunology-serology": ShieldCheck,
  "clinical-microscopy": Microscope,
  "histopathology-medtech-laws": Scale,
};

export function ScoresDashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { activeSchoolYear } = useActiveSchoolYear();
  const selectedSchoolYear = activeSchoolYear;

  // Queries (Fetch all assessments to compute category metrics)
  const { data: assessmentsData } = useAssessments({
    schoolYear: selectedSchoolYear,
  });

  const assessments = assessmentsData?.assessments || [];

  // Group assessments by subject
  const subjectStatsMap = useMemo(() => {
    const map = new Map<string, { count: number; meanSum: number; meanCount: number; passed: number; totalScored: number }>();

    for (const detail of MEDTECH_SUBJECT_DETAILS) {
      map.set(detail.name, { count: 0, meanSum: 0, meanCount: 0, passed: 0, totalScored: 0 });
    }

    for (const a of assessments) {
      const existing = map.get(a.subject) || { count: 0, meanSum: 0, meanCount: 0, passed: 0, totalScored: 0 };
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
      avgMedian: medianCount > 0 ? (totalMedianSum / medianCount).toFixed(1) : null,
      totalPassed,
      totalFailed,
      passRate,
    };
  }, [assessments]);

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans pb-12 animate-in fade-in duration-200">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Award className="size-6 text-primary" />
              <span>Student Scores & Grade Management</span>
            </h1>
            <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
              MedTech Board Review
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Official PRC Board Exam Subjects Hub • Select a category to manage quizzes, mock exams, and grade sheets.
          </p>
        </div>
      </div>

      {/* ── 2. High-Level Statistical Summary Banner ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">
                Assessments
              </p>
              <h3 className="text-xl font-black text-foreground">
                {aggregateStats.totalAssessments}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">
                Cohort Mean (Avg)
              </p>
              <h3 className="text-xl font-black text-foreground">
                {aggregateStats.avgMean !== null ? `${aggregateStats.avgMean} pts` : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">
                Cohort Median
              </p>
              <h3 className="text-xl font-black text-foreground">
                {aggregateStats.avgMedian !== null ? `${aggregateStats.avgMedian} pts` : "—"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase">
                Passing Rate (&ge; 75%)
              </p>
              <h3 className="text-xl font-black text-foreground">
                {aggregateStats.passRate !== null ? (
                  <span className={aggregateStats.passRate >= 75 ? "text-green-600" : "text-amber-600"}>
                    {aggregateStats.passRate}%
                  </span>
                ) : (
                  "—"
                )}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. 6 Major Categories Cards Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <span>MTLE Subjects</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Click any category card below to manage quizzes, add assessments, and grade students for that subject.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MEDTECH_SUBJECT_DETAILS.map((subject: MedTechSubjectDetail) => {
            const Icon = SUBJECT_ICONS[subject.slug] || BookOpen;
            const stats = subjectStatsMap.get(subject.name) || {
              count: 0,
              meanSum: 0,
              meanCount: 0,
              passed: 0,
              totalScored: 0,
            };

            const subjectMean = stats.meanCount > 0 ? (stats.meanSum / stats.meanCount).toFixed(1) : null;
            const subjectPassRate =
              stats.totalScored > 0
                ? Number(((stats.passed / stats.totalScored) * 100).toFixed(1))
                : null;

            return (
              <Card
                key={subject.slug}
                onClick={() => navigate(`/scores/subject/${subject.slug}?sy=${selectedSchoolYear}`)}
                className="group bg-card border-border hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden relative"
              >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />

                <CardHeader className="p-5 pb-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="font-bold text-[10px] bg-primary/10 text-primary border-primary/20"
                      >
                        {subject.weightPercent}% PRC Weight
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {subject.code}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {subject.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Subject Mini KPI Stats */}
                  <div className="bg-muted/40 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs border border-border/50">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Tests
                      </span>
                      <p className="font-extrabold text-foreground text-sm">
                        {stats.count}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Mean
                      </span>
                      <p className="font-extrabold text-foreground text-sm">
                        {subjectMean !== null ? `${subjectMean}` : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Pass Rate
                      </span>
                      <p className="font-extrabold text-foreground text-sm">
                        {subjectPassRate !== null ? (
                          <span className={subjectPassRate >= 75 ? "text-green-600" : "text-amber-600"}>
                            {subjectPassRate}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Open Category</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
