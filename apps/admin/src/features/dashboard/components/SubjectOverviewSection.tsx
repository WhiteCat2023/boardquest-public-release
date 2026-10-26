import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, Target, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import appContent from "@/constants/appContent";
import { useSubjects } from "@/features/users";
import { useDashboardAnalyticsSummary } from "../api/useDashboardAnalytics";

const PASSING_THRESHOLD = 75;

function getSubjectShortName(name: string): string {
  const lower = (name || "").toLowerCase().trim();
  if (lower.includes("immunology") || lower.includes("serology") || lower.includes("immunohematology")) {
    return "Immuno & Serology";
  }
  if (lower.includes("microscopy") || lower.includes("parasitology")) {
    return "Clin. Microscopy";
  }
  if (lower.includes("histopath") || lower.includes("laws")) {
    return "Histopath & Laws";
  }
  if (lower.includes("chemistry")) {
    return "Clinical Chemistry";
  }
  if (lower.includes("microbiology")) {
    return "Microbiology";
  }
  if (lower.includes("hematology")) {
    return "Hematology";
  }
  if (name.length > 20) {
    return name.slice(0, 18) + "...";
  }
  return name;
}

function getSubjectCompactName(name: string): string {
  const lower = (name || "").toLowerCase().trim();
  if (lower.includes("immunology") || lower.includes("serology") || lower.includes("immunohematology")) {
    return "Immuno";
  }
  if (lower.includes("microscopy") || lower.includes("parasitology")) {
    return "Microscopy";
  }
  if (lower.includes("histopath") || lower.includes("laws")) {
    return "Histopath";
  }
  if (lower.includes("chemistry")) {
    return "Chemistry";
  }
  if (lower.includes("microbiology")) {
    return "Microbio";
  }
  if (lower.includes("hematology")) {
    return "Hematology";
  }
  if (name.length > 10) {
    return name.slice(0, 9) + "..";
  }
  return name;
}

export function SubjectOverviewSection() {
  const navigate = useNavigate();
  const sectionContent = appContent.dashboard.subjectOverview;
  const { data: dbCategories = [], isLoading: isSubjectsLoading } = useSubjects({ all: true });
  const { data: analytics, isLoading: isAnalyticsLoading } = useDashboardAnalyticsSummary();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(960);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Measure container width dynamically to eliminate letterboxing/white space
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      if (node.clientWidth > 0) {
        setContainerWidth(node.clientWidth);
      }
    };

    measure();

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

  const analyticsSubjects = analytics?.subjects || [];
  const categoriesList = Array.isArray(dbCategories) ? dbCategories : [];

  const subjectCount = categoriesList.length;

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
      shortName: getSubjectShortName(cat.name || matchedDbCat?.name || `Subject ${index + 1}`),
      proficiency,
      questionCount,
    };
  });

  const isLoading = isSubjectsLoading && isAnalyticsLoading && sourceSubjects.length === 0;

  // Responsive layout scaling across all screen sizes (mobile, tablet, desktop)
  const isSmallMobile = containerWidth < 480;
  const isMobile = containerWidth < 680;
  const isTablet = containerWidth >= 680 && containerWidth < 1024;

  const numBars = subjectsToDisplay.length;
  const minWidthNeeded = Math.max(300, numBars * (isSmallMobile ? 46 : isMobile ? 54 : 64));
  const svgWidth = Math.max(minWidthNeeded, containerWidth);
  const svgHeight = isSmallMobile ? 260 : isMobile ? 300 : isTablet ? 340 : 380;

  const chartTop = isMobile ? 22 : 28;
  const chartBottom = isSmallMobile ? 208 : isMobile ? 240 : isTablet ? 275 : 320;
  const plotHeight = chartBottom - chartTop;

  const leftMargin = isSmallMobile ? 32 : isMobile ? 38 : 44;
  const rightMargin = isSmallMobile ? 10 : isMobile ? 12 : 16;
  const plotWidth = svgWidth - leftMargin - rightMargin;

  const colWidth = numBars > 0 ? plotWidth / numBars : 100;
  const barWidth = Math.max(
    isSmallMobile ? 18 : isMobile ? 24 : 34,
    Math.min(
      isSmallMobile ? 32 : isMobile ? 48 : 68,
      Math.round(colWidth * (isMobile ? 0.44 : 0.36))
    )
  );

  const benchmarkY = chartBottom - (PASSING_THRESHOLD / 100) * plotHeight;

  // Summary Metrics
  const totalQuestions = subjectsToDisplay.reduce((acc, s) => acc + s.questionCount, 0);

  return (
    <Card className="w-full shrink-0 min-h-fit bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="text-primary size-4 sm:size-5" />
            Subjects Overview
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              PRC Benchmark: <strong>{PASSING_THRESHOLD}%</strong>
            </span>
          </div>
        </div>
      </div>

      {sourceSubjects.length === 0 && !isLoading ? (
        <div className="py-8 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <BookOpen className="size-8 text-muted-foreground/50 stroke-[1.5]" />
          <p className="text-xs font-semibold text-foreground">
            No Licensure Subjects Registered
          </p>
          <p className="text-[11px] text-muted-foreground">
            Add subjects in Curriculum Management to begin tracking board exam
            domain performance.
          </p>
        </div>
      ) : isLoading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-6 w-48 bg-muted rounded-md" />
          <Skeleton className="h-[210px] w-full bg-muted rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Responsive SVG Bar Graph */}
          <div
            ref={containerRef}
            className="w-full overflow-x-auto scrollbar-none pb-1"
          >
            <div className="w-full">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: "100%", height: svgHeight }}
                className="w-full block overflow-visible select-none font-sans"
              >
                <defs>
                  {/* Passing Bar Gradient (>= 75%) */}
                  <linearGradient
                    id="subjEmeraldGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  {/* Moderate Bar Gradient (55% - 74%) */}
                  <linearGradient
                    id="subjAmberGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Critical / Review Bar Gradient (< 55%) */}
                  <linearGradient id="subjRoseGrad" x1="0" y1="0" x2="0" y2="1">
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
                        x={leftMargin - (isSmallMobile ? 4 : 8)}
                        y={yPos + (isSmallMobile ? 3 : 3.5)}
                        textAnchor="end"
                        className={`font-mono ${
                          isSmallMobile
                            ? "text-[8px]"
                            : isMobile
                              ? "text-[9px]"
                              : "text-[10px]"
                        } ${
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

                {/* 75% PRC Licensure Target Line Pill */}
                <g
                  transform={`translate(${
                    svgWidth -
                    rightMargin -
                    (isSmallMobile ? 58 : isMobile ? 74 : 104)
                  }, ${benchmarkY - (isMobile ? 7.5 : 9)})`}
                >
                  <rect
                    width={isSmallMobile ? 58 : isMobile ? 74 : 104}
                    height={isMobile ? 15 : 18}
                    rx={4}
                    className="fill-emerald-500/15 stroke-emerald-500/40"
                    strokeWidth={1}
                  />
                  <text
                    x={(isSmallMobile ? 58 : isMobile ? 74 : 104) / 2}
                    y={isMobile ? 10.5 : 12.5}
                    textAnchor="middle"
                    className={`font-black uppercase tracking-wider fill-emerald-600 dark:fill-emerald-400 ${
                      isSmallMobile
                        ? "text-[7.5px]"
                        : isMobile
                          ? "text-[8px]"
                          : "text-[9px]"
                    }`}
                  >
                    {isSmallMobile
                      ? "75% PRC"
                      : isMobile
                        ? "PRC 75%"
                        : "PRC 75% Target"}
                  </text>
                </g>

                {/* Vertical Bars for Each Subject */}
                {subjectsToDisplay.map((subj, idx) => {
                  const barX =
                    leftMargin + idx * colWidth + (colWidth - barWidth) / 2;
                  const isHovered = hoveredBarIndex === idx;

                  const barH = Math.max(
                    6,
                    (subj.proficiency / 100) * plotHeight,
                  );
                  const barY = chartBottom - barH;
                  const isPassing = subj.proficiency >= PASSING_THRESHOLD;
                  const isModerate = subj.proficiency >= 55 && !isPassing;

                  const fillGradient = isPassing
                    ? "url(#subjEmeraldGrad)"
                    : isModerate
                      ? "url(#subjAmberGrad)"
                      : "url(#subjRoseGrad)";

                  const textValueColor = isPassing
                    ? "fill-emerald-600 dark:fill-emerald-400"
                    : isModerate
                      ? "fill-amber-600 dark:fill-amber-400"
                      : "fill-rose-600 dark:fill-rose-400";

                  return (
                    <g
                      key={subj.id || subj.code || idx}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      onTouchStart={() => setHoveredBarIndex(idx)}
                      onClick={() => {
                        if (subj.id) {
                          navigate(`/subject-management/${subj.id}`);
                        }
                      }}
                      className="cursor-pointer transition-all duration-200"
                    >
                      {/* Column Hover Background Highlight */}
                      <rect
                        x={leftMargin + idx * colWidth + 2}
                        y={chartTop}
                        width={colWidth - 4}
                        height={plotHeight}
                        rx={6}
                        className={`transition-opacity duration-150 ${
                          isHovered
                            ? "fill-primary/5 stroke-primary/25 opacity-100"
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
                        rx={isMobile ? 4 : 6}
                        fill={fillGradient}
                        className={`transition-transform origin-bottom duration-200 filter drop-shadow-xs ${
                          isHovered
                            ? "opacity-95"
                            : "opacity-90 hover:opacity-100"
                        }`}
                      />

                      {/* Percentage Value Label above Bar */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - (isMobile ? 4 : 7)}
                        textAnchor="middle"
                        className={`font-black font-mono ${
                          isSmallMobile
                            ? "text-[8.5px]"
                            : isMobile
                              ? "text-[9.5px]"
                              : "text-[11px]"
                        } ${textValueColor}`}
                      >
                        {subj.proficiency}%
                      </text>

                      {/* Subject Code (X-Axis) */}
                      <text
                        x={barX + barWidth / 2}
                        y={chartBottom + (isMobile ? 12 : 16)}
                        textAnchor="middle"
                        className={`font-mono font-bold uppercase tracking-wider ${
                          isSmallMobile
                            ? "text-[8px]"
                            : isMobile
                              ? "text-[8.5px]"
                              : "text-[9.5px]"
                        } ${
                          isHovered
                            ? "fill-primary font-black"
                            : "fill-muted-foreground"
                        }`}
                      >
                        {isSmallMobile
                          ? subj.code.split("-")[0] || subj.code
                          : subj.code}
                      </text>

                      {/* Subject Name (X-Axis) */}
                      <text
                        x={barX + barWidth / 2}
                        y={chartBottom + (isMobile ? 23 : 30)}
                        textAnchor="middle"
                        className={`font-bold ${
                          isSmallMobile
                            ? "text-[8px]"
                            : isMobile
                              ? "text-[9px]"
                              : "text-[10.5px]"
                        } ${
                          isHovered
                            ? "fill-primary font-black"
                            : "fill-foreground"
                        }`}
                      >
                        {isSmallMobile
                          ? getSubjectCompactName(subj.name)
                          : isMobile
                            ? getSubjectShortName(subj.name)
                            : subj.shortName}
                      </text>

                      {/* Question Count (X-Axis) */}
                      <text
                        x={barX + barWidth / 2}
                        y={chartBottom + (isMobile ? 33 : 43)}
                        textAnchor="middle"
                        className={`font-semibold fill-muted-foreground ${
                          isSmallMobile ? "text-[7.5px]" : "text-[9px]"
                        }`}
                      >
                        {subj.questionCount} Qs
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Legend and Interactive Detail Callout */}
          <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-muted-foreground text-[10.5px] sm:text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm sm:size-2.5 bg-emerald-500 shrink-0" />
                <span>Passing (&ge;75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm sm:size-2.5 bg-amber-500 shrink-0" />
                <span>In Training (55-74%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm sm:size-2.5 bg-rose-500 shrink-0" />
                <span>Needs Remediation (&lt;55%)</span>
              </div>
            </div>

            {/* Dynamic Detail Callout for Hovered Item */}
            {/* <div className="text-[10.5px] sm:text-[11px] font-semibold text-muted-foreground w-full sm:w-auto">
              {hoveredBarIndex !== null && subjectsToDisplay[hoveredBarIndex] ? (
                <div
                  onClick={() => {
                    const hoveredSubj = subjectsToDisplay[hoveredBarIndex];
                    if (hoveredSubj?.id) {
                      navigate(`/subject-management/${hoveredSubj.id}`);
                    }
                  }}
                  className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-muted/60 hover:bg-muted px-2.5 py-1 rounded-lg border border-border cursor-pointer transition-colors"
                >
                  <strong className="text-foreground">
                    {subjectsToDisplay[hoveredBarIndex].name} ({subjectsToDisplay[hoveredBarIndex].code}):
                  </strong>
                  <span
                    className={
                      subjectsToDisplay[hoveredBarIndex].proficiency >= PASSING_THRESHOLD
                        ? "text-emerald-600 dark:text-emerald-400 font-black"
                        : subjectsToDisplay[hoveredBarIndex].proficiency >= 55
                        ? "text-amber-600 dark:text-amber-400 font-black"
                        : "text-rose-600 dark:text-rose-400 font-black"
                    }
                  >
                    {subjectsToDisplay[hoveredBarIndex].proficiency}% avg proficiency
                  </span>
                  <span>&bull;</span>
                  <span>{subjectsToDisplay[hoveredBarIndex].questionCount} questions</span>
                  <ArrowUpRight className="size-3 text-primary ml-0.5" />
                </div>
              ) : (
                <div className="text-muted-foreground/80 flex items-center gap-1.5">
                  <span>Hover/tap any bar to inspect</span>
                  <span>&bull;</span>
                  <span>Click to view curriculum</span>
                </div>
              )}
            </div> */}
          </div>
        </div>
      )}
    </Card>
  );
}

