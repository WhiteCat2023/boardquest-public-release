import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  CheckCircle2, 
  Award,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAnalyticsSummary } from "../api/useDashboardAnalytics";

interface DataPoint {
  month: string;
  rate: number;
  avgScore: number;
  students: number;
}

export function StudentPassingRateAnalytics() {
  const { data: analytics, isLoading } = useDashboardAnalyticsSummary();
  const [activeHoverPoint, setActiveHoverPoint] = useState<DataPoint | null>(null);
  const [timeframe, setTimeframe] = useState<"6M" | "1Y">("6M");

  const fullMonthlyTrend: DataPoint[] = analytics?.monthlyTrend || [];
  const trendData = timeframe === "6M" 
    ? (fullMonthlyTrend.length > 6 ? fullMonthlyTrend.slice(-6) : fullMonthlyTrend)
    : fullMonthlyTrend;

  const distributionData = analytics?.distribution || [
    { label: "Passed (≥75%)", value: 0, count: 0, color: "#10b981", strokeColor: "stroke-emerald-500", bgLight: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Near Target (60-74%)", value: 0, count: 0, color: "#f59e0b", strokeColor: "stroke-amber-500", bgLight: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
    { label: "At Risk (<60%)", value: 0, count: 0, color: "#ef4444", strokeColor: "stroke-rose-500", bgLight: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  ];

  const overallPassRate = analytics?.overallPassRate ?? 0;
  const overallAvgScore = analytics?.overallAvgScore ?? 0;
  const totalStudentsCount = analytics?.totalStudentsCount ?? 0;

  // Calculate monthly growth comparing last two months
  const lastMonthRate = trendData.length > 0 ? trendData[trendData.length - 1]?.rate ?? 0 : 0;
  const prevMonthRate = trendData.length > 1 ? trendData[trendData.length - 2]?.rate ?? 0 : 0;
  const growthRate = (lastMonthRate - prevMonthRate).toFixed(1);

  // SVG Line Chart Dimensions & Scaling
  const svgWidth = 580;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 28;

  const minRate = 0;
  const maxRate = 100;

  const getX = (index: number) => {
    const step = trendData.length > 1 ? (svgWidth - paddingX * 2) / (trendData.length - 1) : 0;
    return paddingX + index * step;
  };

  const getY = (value: number) => {
    const usableHeight = svgHeight - paddingY * 2;
    const ratio = (value - minRate) / (maxRate - minRate);
    return svgHeight - paddingY - ratio * usableHeight;
  };

  const points = trendData.map((d, i) => ({ x: getX(i), y: getY(d.rate), data: d }));
  
  const pathD = points.reduce((acc, point, index, array) => {
    if (index === 0) return `M ${point.x},${point.y}`;
    const prev = array[index - 1];
    const controlX = (prev.x + point.x) / 2;
    return `${acc} C ${controlX},${prev.y} ${controlX},${point.y} ${point.x},${point.y}`;
  }, "");

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`
    : "";

  const benchmarkY = getY(75);

  // Pie / Donut SVG calculation
  const donutRadius = 52;
  const circumference = 2 * Math.PI * donutRadius;
  
  const donutSlices = useMemo(() => {
    return distributionData.map((item, index) => {
      const dashLength = (item.value / 100) * circumference;
      const offset = distributionData
        .slice(0, index)
        .reduce((sum, prevItem) => sum + (prevItem.value / 100) * circumference, 0);
      return {
        ...item,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: -offset,
      };
    });
  }, [distributionData, circumference]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 font-sans w-full">
        <Card className="lg:col-span-7 bg-card border border-border rounded-xl p-4 shadow-2xs h-[360px] flex flex-col justify-between">
          <Skeleton className="h-7 w-64 bg-muted rounded-md" />
          <Skeleton className="h-14 w-full bg-muted rounded-xl" />
          <Skeleton className="h-44 w-full bg-muted rounded-xl" />
        </Card>
        <Card className="lg:col-span-5 bg-card border border-border rounded-xl p-4 shadow-2xs h-[360px] flex flex-col justify-between">
          <Skeleton className="h-7 w-48 bg-muted rounded-md" />
          <div className="flex items-center justify-center">
            <Skeleton className="size-36 rounded-full bg-muted" />
          </div>
          <Skeleton className="h-10 w-full bg-muted rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 font-sans w-full">
      {/* LEFT CARD: Line Graph (7 Cols) */}
      <Card className="lg:col-span-7 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between gap-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary size-4 sm:size-5" />
              Student Passing Rate Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backend-calculated passing performance over time vs 75% target benchmark.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setTimeframe("6M")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === "6M" 
                  ? "bg-card text-foreground shadow-2xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe("1Y")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === "1Y" 
                  ? "bg-card text-foreground shadow-2xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Year
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-3 gap-2 bg-muted/30 border border-border/60 p-2.5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Award size={12} className="text-emerald-500" />
              Latest Pass Rate
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {lastMonthRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col border-x border-border/60 px-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Target size={12} className="text-primary" />
              Target Benchmark
            </span>
            <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              75.0%
            </span>
          </div>

          <div className="flex flex-col pl-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Monthly Growth
            </span>
            <span className={`text-base sm:text-lg font-bold mt-0.5 ${Number(growthRate) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
              {Number(growthRate) >= 0 ? `+${growthRate}%` : `${growthRate}%`}
            </span>
          </div>
        </div>

        {/* Line Chart SVG Container */}
        <div className="relative w-full overflow-hidden pt-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="passRateLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-muted-foreground font-medium"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Passing Target Benchmark Line (75%) */}
            <line
              x1={paddingX}
              y1={benchmarkY}
              x2={svgWidth - paddingX}
              y2={benchmarkY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              opacity="0.8"
            />
            <text
              x={paddingX + 6}
              y={benchmarkY - 6}
              textAnchor="start"
              className="text-[9.5px] fill-emerald-600 dark:fill-emerald-400 font-bold"
            >
              75% Target Benchmark
            </text>

            {/* Gradient Fill under Line */}
            {areaD && <path d={areaD} fill="url(#passRateLineGrad)" />}

            {/* Main Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points (Dots & Hover Listeners) */}
            {points.map((p, i) => {
              const isHovered = activeHoverPoint?.month === p.data.month;
              const isAboveBenchmark = p.data.rate >= 75;

              return (
                <g
                  key={i}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setActiveHoverPoint(p.data)}
                  onMouseLeave={() => setActiveHoverPoint(null)}
                >
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      className="fill-primary/20 animate-ping"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "5.5" : "4"}
                    fill="var(--color-background, #ffffff)"
                    stroke={isAboveBenchmark ? "#10b981" : "var(--color-primary, #3b82f6)"}
                    strokeWidth={isHovered ? "2.5" : "2"}
                    className="transition-all duration-150"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className={`text-[10.5px] ${
                      isHovered ? "fill-primary font-bold" : "fill-muted-foreground font-medium"
                    }`}
                  >
                    {p.data.month}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {activeHoverPoint && (
            <div className="absolute top-2 right-4 bg-popover/95 border border-border shadow-md rounded-xl p-2.5 text-popover-foreground text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-10">
              <div className="flex items-center justify-between gap-3 font-bold border-b border-border pb-1 mb-1">
                <span>{activeHoverPoint.month} Performance</span>
                <Badge
                  variant={activeHoverPoint.rate >= 75 ? "outline" : "outline"}
                  className={`text-[9px] px-1.5 py-0 ${activeHoverPoint.rate >= 75 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                >
                  {activeHoverPoint.rate >= 75 ? "Passed Target" : "Below Target"}
                </Badge>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Passing Rate:</span>
                  <span className="font-bold text-foreground">{activeHoverPoint.rate}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Avg Exam Score:</span>
                  <span className="font-bold text-foreground">{activeHoverPoint.avgScore}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Active Students:</span>
                  <span className="font-semibold text-foreground">{activeHoverPoint.students}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* RIGHT CARD: Pie / Donut Chart (5 Cols) */}
      <Card className="lg:col-span-5 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <PieChart className="text-primary size-4 sm:size-5" />
              Current Passing Rate
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribution of {totalStudentsCount} active aspirants by licensure status.
            </p>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md"
          >
            {overallPassRate}% Overall
          </Badge>
        </div>

        {/* Donut Chart SVG & Center Summary Callout */}
        <div className="flex flex-col sm:flex-row items-center gap-4 my-auto py-1 w-full">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={donutRadius}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="16"
              />

              {donutSlices.map((slice, index) => (
                <circle
                  key={index}
                  cx="70"
                  cy="70"
                  r={donutRadius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="16"
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
                />
              ))}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-black text-foreground tracking-tight">
                {overallPassRate}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Passing Rate
              </span>
            </div>
          </div>

          {/* Side Legend Table */}
          <div className="flex flex-col gap-2 w-full flex-1 min-w-0">
            {distributionData.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg border border-border/70 bg-muted/30 hover:bg-muted/60 transition-colors flex items-center justify-between gap-2 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-foreground truncate block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">
                      {item.count} Aspirants
                    </span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded-md ${item.bgLight || "bg-muted"} ${item.text || ""}`}
                >
                  {item.value}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div className="p-2.5 bg-muted/40 border border-border/80 rounded-lg flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          <span className="text-[11px] font-medium leading-snug">
            <strong>{overallPassRate}%</strong> of students meet the 75% licensure passing standard.
          </span>
        </div>
      </Card>
    </div>
  );
}
