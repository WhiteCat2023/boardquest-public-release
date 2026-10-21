import { useState, useMemo, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Calendar,
  Search,
  BookOpen,
  Target,
  BarChart3,
  Clock,
  CircleDashed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/custom/pagination";
import { useStudentExamResults } from "../../api/useStudent";
import { useSubjects } from "@/features/users";
import type { Student, ExamResult } from "../../types/types";

interface StudentExamResultsTabProps {
  student: Student;
}

const PASSING_THRESHOLD = 75; // Standard 75% PRC Licensure passing benchmark

// Smart formatting utility for compact axis labels
function formatShortSubjectName(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  if (
    lower.includes("immunology") ||
    lower.includes("serology") ||
    lower.includes("immunohematology")
  ) {
    return "Immuno & Serology";
  }
  if (lower.includes("microscopy") || lower.includes("parasitology")) {
    return "Clin. Microscopy";
  }
  if (lower.includes("histopath") || lower.includes("laws")) {
    return "Histopath & Laws";
  }
  if (lower.includes("chemistry")) {
    return "Clinical Chem";
  }
  if (lower.includes("microbiology")) {
    return "Microbiology";
  }
  if (lower.includes("hematology")) {
    return "Hematology";
  }
  if (name.length > 16) {
    return name.slice(0, 14) + "...";
  }
  return name;
}

function normalizeSubjectKey(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

function isSubjectMatch(examSubject?: string | null, dbSubject?: any): boolean {
  if (!examSubject || !dbSubject) return false;
  const eStr = examSubject.toLowerCase().trim();
  const dbName = (dbSubject.name || "").toLowerCase().trim();
  const dbCode = (dbSubject.code || "").toLowerCase().trim();
  const dbId = String(dbSubject.id || dbSubject._id || "");

  if (examSubject === dbId) return true;
  if (eStr === dbName) return true;
  if (dbCode && eStr === dbCode) return true;

  const normE = normalizeSubjectKey(examSubject);
  const normDb = normalizeSubjectKey(dbSubject.name);
  if (
    normE &&
    normDb &&
    (normE === normDb || normDb.includes(normE) || normE.includes(normDb))
  ) {
    return true;
  }
  return false;
}

export default function StudentExamResultsTab({
  student,
}: StudentExamResultsTabProps) {
  // 1. Fetch live exam results (with fallback to student preloaded data)
  const { data: rawExams = [] } = useStudentExamResults(
    student?.id,
    student?.examResults,
  );

  // 2. Fetch all registered subjects dynamically from the database
  const { data: dbSubjects = [] } = useSubjects({ all: true });

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(900);

  // Measure container width dynamically to eliminate whitespace / letterboxing
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (node.clientWidth > 0) {
      setContainerWidth(node.clientWidth);
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setContainerWidth(Math.round(w));
        }
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const exams: ExamResult[] = useMemo(() => {
    if (Array.isArray(rawExams) && rawExams.length > 0) return rawExams;
    if (Array.isArray(student?.examResults) && student.examResults.length > 0)
      return student.examResults;
    return [];
  }, [rawExams, student?.examResults]);

  // Interactive Hover State for Bar Graph
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "accuracy_desc" | "accuracy_asc" | "score_desc"
  >("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Format Helper for Timestamps
  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N/A";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return String(dateStr);
    }
  };

  // Normalize accuracy value to 0-100 range
  const normalizeAccuracy = (
    acc?: number,
    score?: number,
    total?: number,
  ): number => {
    if (typeof acc === "number" && !isNaN(acc)) {
      if (acc > 0 && acc <= 1) return Math.round(acc * 100);
      return Math.round(acc);
    }
    if (score !== undefined && total && total > 0) {
      return Math.round((score / total) * 100);
    }
    return 0;
  };

  // Overall Performance KPI Statistics
  const stats = useMemo(() => {
    if (exams.length === 0) {
      return {
        totalAttempts: 0,
        averageAccuracy: 0,
        passedCount: 0,
        failedCount: 0,
        passRate: 0,
        peakScore: 0,
        peakTotal: 0,
        peakAccuracy: 0,
        peakSubject: "None",
      };
    }

    let accSum = 0;
    let passed = 0;
    let peakAcc = -1;
    let peakSc = 0;
    let peakTot = 0;
    let peakSubj = "None";

    exams.forEach((e) => {
      const acc = normalizeAccuracy(e.accuracy, e.score, e.total);
      accSum += acc;
      if (acc >= PASSING_THRESHOLD) {
        passed += 1;
      }
      if (acc > peakAcc || (acc === peakAcc && (e.score || 0) > peakSc)) {
        peakAcc = acc;
        peakSc = e.score || 0;
        peakTot = e.total || 0;
        peakSubj = e.subject || "General Practice";
      }
    });

    const total = exams.length;
    return {
      totalAttempts: total,
      averageAccuracy: Math.round(accSum / total),
      passedCount: passed,
      failedCount: total - passed,
      passRate: Math.round((passed / total) * 100),
      peakScore: peakSc,
      peakTotal: peakTot,
      peakAccuracy: peakAcc,
      peakSubject: peakSubj,
    };
  }, [exams]);

  // Discipline Breakdown dynamically sourced from the Database subjects + student exams
  const disciplineBreakdowns = useMemo(() => {
    const categoriesList = Array.isArray(dbSubjects) ? dbSubjects : [];
    const matchedExamIds = new Set<string>();

    // 1. Build breakdowns from all registered curriculum subjects in the database
    const result = categoriesList.map((cat: any, index: number) => {
      const catKey = cat.id || cat._id || `subject-${index}`;
      const catName = cat.name || `Subject ${index + 1}`;

      const matched = exams.filter((e) => {
        if (isSubjectMatch(e.subject, cat)) {
          if (e.id) matchedExamIds.add(e.id);
          return true;
        }
        return false;
      });

      if (matched.length === 0) {
        return {
          key: catKey,
          id: cat.id || cat._id,
          name: catName,
          code: cat.code,
          shortName: formatShortSubjectName(catName),
          count: 0,
          avgAccuracy: 0,
          highestScore: 0,
          highestTotal: 0,
          lastDate: undefined as string | undefined,
          isPassing: false,
          hasAttempts: false,
        };
      }

      let accSum = 0;
      let highestScore = 0;
      let highestTotal = 0;
      let lastDate = matched[0]?.timestamp;

      matched.forEach((e) => {
        const acc = normalizeAccuracy(e.accuracy, e.score, e.total);
        accSum += acc;
        if ((e.score || 0) > highestScore) {
          highestScore = e.score || 0;
          highestTotal = e.total || 0;
        }
        if (
          e.timestamp &&
          (!lastDate || new Date(e.timestamp) > new Date(lastDate))
        ) {
          lastDate = e.timestamp;
        }
      });

      const avgAccuracy = Math.round(accSum / matched.length);

      return {
        key: catKey,
        id: cat.id || cat._id,
        name: catName,
        code: cat.code,
        shortName: formatShortSubjectName(catName),
        count: matched.length,
        avgAccuracy,
        highestScore,
        highestTotal,
        lastDate,
        isPassing: avgAccuracy >= PASSING_THRESHOLD,
        hasAttempts: true,
      };
    });

    // 2. Append any exam results that didn't match registered DB subjects (e.g. legacy/custom subjects)
    const unmatchedExams = exams.filter(
      (e) => !e.id || !matchedExamIds.has(e.id),
    );
    const extraMap = new Map<string, ExamResult[]>();
    unmatchedExams.forEach((e) => {
      const subjName = (e.subject || "General Practice").trim();
      const list = extraMap.get(subjName) || [];
      list.push(e);
      extraMap.set(subjName, list);
    });

    extraMap.forEach((matched, subjName) => {
      let accSum = 0;
      let highestScore = 0;
      let highestTotal = 0;
      let lastDate = matched[0]?.timestamp;

      matched.forEach((e) => {
        const acc = normalizeAccuracy(e.accuracy, e.score, e.total);
        accSum += acc;
        if ((e.score || 0) > highestScore) {
          highestScore = e.score || 0;
          highestTotal = e.total || 0;
        }
        if (
          e.timestamp &&
          (!lastDate || new Date(e.timestamp) > new Date(lastDate))
        ) {
          lastDate = e.timestamp;
        }
      });

      const avgAccuracy = Math.round(accSum / matched.length);

      result.push({
        key: `extra-${subjName}`,
        id: undefined,
        name: subjName,
        code: undefined,
        shortName: formatShortSubjectName(subjName),
        count: matched.length,
        avgAccuracy,
        highestScore,
        highestTotal,
        lastDate,
        isPassing: avgAccuracy >= PASSING_THRESHOLD,
        hasAttempts: true,
      });
    });

    return result;
  }, [dbSubjects, exams]);

  // Evaluated Disciplines Count
  const attemptedDisciplinesCount = useMemo(() => {
    return disciplineBreakdowns.filter((d) => d.hasAttempts).length;
  }, [disciplineBreakdowns]);

  // Filtered Table Rows
  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => {
        const subject = (e.subject || "").toLowerCase();
        const matchesSearch =
          searchTerm.trim() === "" ||
          subject.includes(searchTerm.toLowerCase().trim());

        let matchesSubject = true;
        if (selectedSubject !== "ALL") {
          matchesSubject =
            (e.subject || "").toLowerCase().trim() ===
              selectedSubject.toLowerCase().trim() ||
            normalizeSubjectKey(e.subject) ===
              normalizeSubjectKey(selectedSubject);
        }

        const acc = normalizeAccuracy(e.accuracy, e.score, e.total);
        let matchesStatus = true;
        if (selectedStatus === "PASSED") {
          matchesStatus = acc >= PASSING_THRESHOLD;
        } else if (selectedStatus === "BELOW") {
          matchesStatus = acc < PASSING_THRESHOLD;
        }

        return matchesSearch && matchesSubject && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        const accA = normalizeAccuracy(a.accuracy, a.score, a.total);
        const accB = normalizeAccuracy(b.accuracy, b.score, b.total);
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;

        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "accuracy_desc") return accB - accA;
        if (sortBy === "accuracy_asc") return accA - accB;
        if (sortBy === "score_desc") return scoreB - scoreA;
        return 0;
      });
  }, [exams, searchTerm, selectedSubject, selectedStatus, sortBy]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Dimensions & Coordinates for the SVG Bar Graph - dynamically scaled to full width
  const svgWidth = Math.max(600, containerWidth);
  const svgHeight = 250;
  const chartTop = 35;
  const chartBottom = 195;
  const plotHeight = chartBottom - chartTop; // 160px
  const leftMargin = 45;
  const rightMargin = 20;
  const plotWidth = svgWidth - leftMargin - rightMargin;
  const numBars = disciplineBreakdowns.length;
  const colWidth = numBars > 0 ? plotWidth / numBars : 100;
  const barWidth = Math.min(56, Math.max(30, Math.round(colWidth * 0.32)));

  // Y-Coordinate for 75% Benchmark Target Line
  const benchmarkY = chartBottom - (PASSING_THRESHOLD / 100) * plotHeight;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 font-sans">
      {/* ── 2. Performance KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Exam Attempts */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Total Assessments
            </span>
            <span className="p-1.5 bg-primary/10 text-primary rounded-xl">
              <BookOpen className="w-4 h-4" />
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {stats.totalAttempts}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Mock sessions
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              Latest activity synchronized live
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Average Accuracy */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Overall Accuracy
            </span>
            <span
              className={`p-1.5 rounded-xl ${
                stats.averageAccuracy >= PASSING_THRESHOLD
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black ${
                  stats.averageAccuracy >= PASSING_THRESHOLD
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {stats.averageAccuracy}%
              </span>
              <Badge
                variant={
                  stats.averageAccuracy >= PASSING_THRESHOLD
                    ? "default"
                    : "destructive"
                }
                className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0 rounded-full"
              >
                {stats.averageAccuracy >= PASSING_THRESHOLD
                  ? "Passing Standing"
                  : "Needs Remediation"}
              </Badge>
            </div>
            <div className="w-full mt-2">
              <Progress
                value={stats.averageAccuracy}
                className="h-1.5 bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Passing Rate */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              PRC Benchmark Pass Rate
            </span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">
                {stats.passRate}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                ({stats.passedCount} of {stats.totalAttempts} passed)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.failedCount} attempt{stats.failedCount === 1 ? "" : "s"}{" "}
              scored below 75%
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Peak Score Recorded */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Personal Record
            </span>
            <span className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.peakAccuracy > 0 ? `${stats.peakAccuracy}%` : "—"}
              </span>
              {stats.peakTotal > 0 && (
                <span className="text-xs font-bold text-muted-foreground">
                  ({stats.peakScore} / {stats.peakTotal} pts)
                </span>
              )}
            </div>
            <p
              className="text-[11px] text-muted-foreground mt-1 truncate"
              title={stats.peakSubject}
            >
              In {stats.peakSubject}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Discipline Mastery Breakdown: Bar Graph ── */}
      <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs overflow-hidden">
        <CardHeader className="p-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  Student Accuracy
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border-border"
                >
                  {attemptedDisciplinesCount} of {disciplineBreakdowns.length}{" "}
                  Disciplines Evaluated
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Average mock assessment accuracy across all Medical Technology
                licensure board disciplines.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ──── Modern Interactive SVG Bar Graph ──── */}
          <div className="flex flex-col gap-3">
            <div
              ref={containerRef}
              className="w-full overflow-x-auto scrollbar-none pb-2"
            >
              <div className="w-full" style={{ minWidth: 600 }}>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: "100%", height: svgHeight }}
                  className="w-full block overflow-visible select-none font-sans"
                >
                  <defs>
                    {/* Gradient for Passing Bars (>= 75%) */}
                    <linearGradient
                      id="emeraldBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>

                    {/* Gradient for Moderate Bars (60% - 74%) */}
                    <linearGradient
                      id="amberBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>

                    {/* Gradient for Needs Review Bars (< 60%) */}
                    <linearGradient
                      id="roseBarGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Scale */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const yPos = chartBottom - (val / 100) * plotHeight;
                    const is75 = val === 75;

                    return (
                      <g key={val}>
                        <line
                          x1={leftMargin}
                          y1={yPos}
                          x2={svgWidth - rightMargin}
                          y2={yPos}
                          stroke={is75 ? "#10b981" : "currentColor"}
                          strokeOpacity={is75 ? 0.7 : 0.12}
                          strokeWidth={is75 ? 1.5 : 1}
                          strokeDasharray={is75 ? "5 4" : "2 4"}
                        />
                        <text
                          x={leftMargin - 10}
                          y={yPos + 3.5}
                          textAnchor="end"
                          className={`text-[10px] font-mono ${
                            is75
                              ? "fill-emerald-600 dark:fill-emerald-400 font-black"
                              : "fill-muted-foreground/80 font-semibold"
                          }`}
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  {/* 75% PRC Licensure Target Line Label */}
                  <g
                    transform={`translate(${svgWidth - rightMargin - 104}, ${benchmarkY - 9})`}
                  >
                    <rect
                      width={104}
                      height={18}
                      rx={4}
                      className="fill-emerald-500/15 stroke-emerald-500/40"
                      strokeWidth={1}
                    />
                    <text
                      x={52}
                      y={12.5}
                      textAnchor="middle"
                      className="text-[9px] font-black uppercase tracking-wider fill-emerald-600 dark:fill-emerald-400"
                    >
                      PRC 75% Target
                    </text>
                  </g>

                  {/* Vertical Bars for Each Discipline */}
                  {disciplineBreakdowns.map((disc, idx) => {
                    const barX =
                      leftMargin + idx * colWidth + (colWidth - barWidth) / 2;
                    const isHovered = hoveredBarIndex === idx;

                    if (!disc.hasAttempts) {
                      // Unattempted Discipline Placeholder Bar
                      return (
                        <g
                          key={disc.key}
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                          className="cursor-pointer transition-all duration-200"
                        >
                          {/* Empty Outline Bar Base */}
                          <rect
                            x={barX}
                            y={chartBottom - 6}
                            width={barWidth}
                            height={6}
                            rx={3}
                            className="fill-muted stroke-border/70"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                          />

                          {/* Percentage Top Value */}
                          <text
                            x={barX + barWidth / 2}
                            y={chartBottom - 14}
                            textAnchor="middle"
                            className="text-[10px] font-mono font-bold fill-muted-foreground/60"
                          >
                            —
                          </text>

                          {/* Discipline Name & Attempts Labels */}
                          <text
                            x={barX + barWidth / 2}
                            y={chartBottom + 16}
                            textAnchor="middle"
                            className="text-[10.5px] font-bold fill-foreground"
                          >
                            {disc.shortName}
                          </text>
                          <text
                            x={barX + barWidth / 2}
                            y={chartBottom + 29}
                            textAnchor="middle"
                            className="text-[9.5px] font-medium fill-muted-foreground"
                          >
                            0 attempts
                          </text>
                        </g>
                      );
                    }

                    // Attempted Bar Dimensions
                    const barH = Math.max(
                      8,
                      (disc.avgAccuracy / 100) * plotHeight,
                    );
                    const barY = chartBottom - barH;
                    const isPassing = disc.avgAccuracy >= PASSING_THRESHOLD;
                    const isNearPassing = disc.avgAccuracy >= 60 && !isPassing;

                    const fillGradient = isPassing
                      ? "url(#emeraldBarGrad)"
                      : isNearPassing
                        ? "url(#amberBarGrad)"
                        : "url(#roseBarGrad)";

                    const textValueColor = isPassing
                      ? "fill-emerald-600 dark:fill-emerald-400"
                      : isNearPassing
                        ? "fill-amber-600 dark:fill-amber-400"
                        : "fill-rose-600 dark:fill-rose-400";

                    return (
                      <g
                        key={disc.key}
                        onMouseEnter={() => setHoveredBarIndex(idx)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="cursor-pointer transition-all duration-200"
                      >
                        {/* Background Hover Highlight Column */}
                        <rect
                          x={leftMargin + idx * colWidth + 4}
                          y={chartTop}
                          width={colWidth - 8}
                          height={plotHeight}
                          rx={8}
                          className={`transition-opacity ${
                            isHovered
                              ? "fill-primary/5 stroke-primary/20 opacity-100"
                              : "opacity-0"
                          }`}
                          strokeWidth={1}
                        />

                        {/* The Data Bar */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barH}
                          rx={6}
                          fill={fillGradient}
                          className={`transition-transform origin-bottom duration-200 filter drop-shadow-xs ${
                            isHovered
                              ? "opacity-95"
                              : "opacity-90 hover:opacity-100"
                          }`}
                        />

                        {/* Top Value Label */}
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 7}
                          textAnchor="middle"
                          className={`text-[11px] font-black font-mono ${textValueColor}`}
                        >
                          {disc.avgAccuracy}%
                        </text>

                        {/* X-Axis Discipline Name */}
                        <text
                          x={barX + barWidth / 2}
                          y={chartBottom + 16}
                          textAnchor="middle"
                          className={`text-[10.5px] font-bold ${
                            isHovered
                              ? "fill-primary font-black"
                              : "fill-foreground"
                          }`}
                        >
                          {disc.shortName}
                        </text>

                        {/* X-Axis Attempt Count */}
                        <text
                          x={barX + barWidth / 2}
                          y={chartBottom + 29}
                          textAnchor="middle"
                          className="text-[9.5px] font-semibold fill-muted-foreground"
                        >
                          {disc.count} test{disc.count === 1 ? "" : "s"}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart Legend & Hovered Detail Callout */}
            <div className="pt-2 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              {/* Legend Indicators */}
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-500 shrink-0" />
                  <span>Passing (&ge;75%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-amber-500 shrink-0" />
                  <span>Near Target (60-74%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-rose-500 shrink-0" />
                  <span>Review Req. (&lt;60%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm border border-dashed border-border bg-muted/40 shrink-0" />
                  <span>Pending Exam</span>
                </div>
              </div>

              {/* Dynamic Detail Callout for Hovered Item */}
              <div className="text-[11px] font-semibold text-muted-foreground">
                {hoveredBarIndex !== null &&
                disciplineBreakdowns[hoveredBarIndex] ? (
                  <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-lg border border-border">
                    <strong className="text-foreground">
                      {disciplineBreakdowns[hoveredBarIndex].name}:
                    </strong>
                    {disciplineBreakdowns[hoveredBarIndex].hasAttempts ? (
                      <>
                        <span
                          className={
                            disciplineBreakdowns[hoveredBarIndex].isPassing
                              ? "text-emerald-600 dark:text-emerald-400 font-black"
                              : "text-rose-600 dark:text-rose-400 font-black"
                          }
                        >
                          {disciplineBreakdowns[hoveredBarIndex].avgAccuracy}%
                          accuracy
                        </span>
                        <span>&bull;</span>
                        <span>
                          {disciplineBreakdowns[hoveredBarIndex].count} attempts
                        </span>
                        <span>&bull;</span>
                        <span>
                          Peak:{" "}
                          {disciplineBreakdowns[hoveredBarIndex].highestScore}/
                          {disciplineBreakdowns[hoveredBarIndex].highestTotal}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">
                        No mock exams taken yet
                      </span>
                    )}
                  </div>
                ) : (
                  <span>Hover over any bar to view performance breakdown</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Exam Attempts Table & Toolbar ── */}
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-card/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                Exam Attempt History
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Showing {filteredExams.length} recorded exam sessions.
              </CardDescription>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-full sm:w-44 md:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search subject..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 pl-8 text-xs bg-background rounded-xl border-border"
                />
              </div>

              {/* Subject Dropdown: Lists Canonical Disciplines */}
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs bg-background text-foreground border border-border rounded-xl px-2.5 py-1 pr-6 font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary max-w-[170px] truncate"
                >
                  <option value="ALL">
                    All Subjects ({disciplineBreakdowns.length})
                  </option>
                  {disciplineBreakdowns.map((disc) => (
                    <option key={disc.key} value={disc.name}>
                      {disc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs bg-background text-foreground border border-border rounded-xl px-2.5 py-1 pr-6 font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PASSED">Passed (≥ 75%)</option>
                  <option value="BELOW">Below Benchmark (&lt; 75%)</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs bg-background text-foreground border border-border rounded-xl px-2.5 py-1 pr-6 font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="accuracy_desc">Highest Accuracy</option>
                  <option value="accuracy_asc">Lowest Accuracy</option>
                  <option value="score_desc">Highest Score</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedExams.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-muted rounded-full text-muted-foreground">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No Exam Records Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {exams.length === 0
                  ? "This student has not yet undertaken any mock exams or diagnostic drills in BoardQuesters."
                  : "No attempts match the current search or filter criteria. Try clearing your filters."}
              </p>
              {exams.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubject("ALL");
                    setSelectedStatus("ALL");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border text-[11px] font-black uppercase text-muted-foreground">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="min-w-[200px]">
                      Discipline / Assessment Subject
                    </TableHead>
                    <TableHead className="w-28 text-center">Score</TableHead>
                    <TableHead className="w-28 text-center">Accuracy</TableHead>
                    <TableHead className="w-32 text-center">Standing</TableHead>
                    <TableHead className="w-44 text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExams.map((exam, index) => {
                    const rowNumber = (currentPage - 1) * pageSize + index + 1;
                    const acc = normalizeAccuracy(
                      exam.accuracy,
                      exam.score,
                      exam.total,
                    );
                    const isPassing = acc >= PASSING_THRESHOLD;

                    return (
                      <TableRow
                        key={exam.id || index}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Index */}
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {rowNumber}
                        </TableCell>

                        {/* Subject */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                              {exam.subject || "General Licensure Examination"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Assessment Session ID:{" "}
                              {exam.id
                                ? exam.id.slice(-6)
                                : `session-${rowNumber}`}
                            </span>
                          </div>
                        </TableCell>

                        {/* Raw Score */}
                        <TableCell className="text-center">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {exam.score ?? 0}{" "}
                            <span className="text-muted-foreground font-normal">
                              / {exam.total ?? 0}
                            </span>
                          </span>
                        </TableCell>

                        {/* Accuracy */}
                        <TableCell className="text-center">
                          <span
                            className={`font-mono text-xs font-black ${
                              isPassing
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {acc}%
                          </span>
                        </TableCell>

                        {/* Benchmark Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={isPassing ? "secondary" : "outline"}
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              isPassing
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {isPassing ? (
                              <>
                                <CheckCircle2 className="size-3" />
                                Passed
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="size-3" />
                                Needs Focus
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        {/* Date Timestamp */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                            <span>{formatTimestamp(exam.timestamp)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ── 5. Standardized Pagination Footer ── */}
          {filteredExams.length > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredExams.length}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              hasNextPage={currentPage < totalPages}
              hasPreviousPage={currentPage > 1}
              onNext={() => handlePageChange(currentPage + 1)}
              onPrevious={() => handlePageChange(currentPage - 1)}
              onPageSelect={handlePageChange}
              itemLabel="exam attempts"
              variant="table-footer"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
