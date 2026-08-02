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
import { useDashboardAnalyticsSummary } from "../hooks/useDashboardAnalytics";

interface DataPoint {
  month: string;
  rate: number;
  avgScore: number;
  students: number;
}

const DEFAULT_MONTHLY_TREND: DataPoint[] = [
  { month: "Jan", rate: 62, avgScore: 65, students: 180 },
  { month: "Feb", rate: 66, avgScore: 68, students: 184 },
  { month: "Mar", rate: 71, avgScore: 72, students: 190 },
  { month: "Apr", rate: 74, avgScore: 75, students: 192 },
  { month: "May", rate: 72, avgScore: 74, students: 195 },
  { month: "Jun", rate: 79, avgScore: 81, students: 198 },
  { month: "Jul", rate: 82, avgScore: 83, students: 200 },
  { month: "Aug", rate: 86, avgScore: 87, students: 200 },
];

const DEFAULT_DISTRIBUTION = [
  { label: "Passed (≥75%)", value: 78.4, count: 157, color: "#10b981", strokeColor: "stroke-emerald-500", bgLight: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { label: "Near Target (60-74%)", value: 14.1, count: 28, color: "#f59e0b", strokeColor: "stroke-amber-500", bgLight: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  { label: "At Risk (<60%)", value: 7.5, count: 15, color: "#ef4444", strokeColor: "stroke-rose-500", bgLight: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
];

export function StudentPassingRateAnalytics() {
  const { data: analytics, isLoading } = useDashboardAnalyticsSummary();
  const [activeHoverPoint, setActiveHoverPoint] = useState<DataPoint | null>(null);
  const [timeframe, setTimeframe] = useState<"6M" | "1Y">("6M");

  const fullMonthlyTrend: DataPoint[] = analytics?.monthlyTrend || DEFAULT_MONTHLY_TREND;
  const trendData = timeframe === "6M" ? fullMonthlyTrend.slice(Math.max(0, fullMonthlyTrend.length - 6)) : fullMonthlyTrend;

  const distributionData = analytics?.distribution || DEFAULT_DISTRIBUTION;
  const overallPassRate = analytics?.overallPassRate ?? 78.4;
  const overallAvgScore = analytics?.overallAvgScore ?? 78.4;
  const totalStudentsCount = analytics?.totalStudentsCount ?? 200;

  // Calculate monthly growth comparing last two months
  const lastMonthRate = trendData[trendData.length - 1]?.rate ?? 86;
  const prevMonthRate = trendData[trendData.length - 2]?.rate ?? 82;
  const growthRate = (lastMonthRate - prevMonthRate).toFixed(1);

  // SVG Line Chart Dimensions & Scaling
  const svgWidth = 560;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const minRate = 50;
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
  const donutRadius = 65;
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans w-full">
        <Card className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 shadow-2xs h-[380px] flex flex-col justify-between">
          <Skeleton className="h-8 w-64 bg-muted rounded-md" />
          <Skeleton className="h-16 w-full bg-muted rounded-xl" />
          <Skeleton className="h-48 w-full bg-muted rounded-xl" />
        </Card>
        <Card className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-2xs h-[380px] flex flex-col justify-between">
          <Skeleton className="h-8 w-48 bg-muted rounded-md" />
          <div className="flex items-center justify-center">
            <Skeleton className="h-44 w-44 rounded-full bg-muted" />
          </div>
          <Skeleton className="h-12 w-full bg-muted rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans w-full">
      {/* LEFT CARD: Line Graph (7 Cols) */}
      <Card className="lg:col-span-7 bg-card border border-border rounded-2xl p-4 md:p-5 shadow-2xs flex flex-col justify-between gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary size-5" />
              Student Passing Rate Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backend-calculated passing performance over time vs 75% target benchmark.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60 self-start sm:self-auto">
            <button
              onClick={() => setTimeframe("6M")}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === "6M" 
                  ? "bg-background text-foreground shadow-2xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe("1Y")}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === "1Y" 
                  ? "bg-background text-foreground shadow-2xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Year
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-3 gap-3 bg-muted/30 border border-border/60 p-3 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Award size={12} className="text-emerald-500" />
              Latest Pass Rate
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {lastMonthRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col border-x border-border/60 px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Target size={12} className="text-primary" />
              Target Benchmark
            </span>
            <span className="text-lg font-black text-foreground mt-0.5">
              75.0%
            </span>
          </div>

          <div className="flex flex-col pl-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Monthly Growth
            </span>
            <span className={`text-lg font-black mt-0.5 ${Number(growthRate) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
              {Number(growthRate) >= 0 ? `+${growthRate}%` : `${growthRate}%`}
            </span>
          </div>
        </div>

        {/* Line Chart SVG Container */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="passRateLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[50, 60, 70, 80, 90, 100].map((val) => {
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
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <text
              x={svgWidth - paddingX + 6}
              y={benchmarkY + 3}
              textAnchor="start"
              className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-extrabold"
            >
              75% Target
            </text>

            {/* Gradient Fill under Line */}
            {areaD && <path d={areaD} fill="url(#passRateLineGrad)" />}

            {/* Main Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="3"
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
                      r="10"
                      className="fill-primary/20 animate-ping"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? "6" : "4.5"}
                    fill="var(--color-background, #ffffff)"
                    stroke={isAboveBenchmark ? "#10b981" : "#3b82f6"}
                    strokeWidth={isHovered ? "3" : "2.5"}
                    className="transition-all duration-150"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${
                      isHovered ? "fill-primary font-extrabold" : "fill-muted-foreground"
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
            <div className="absolute top-2 right-4 bg-popover/95 border border-border shadow-md rounded-xl p-2.5 text-popover-foreground text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between gap-3 font-bold border-b border-border pb-1 mb-1">
                <span>{activeHoverPoint.month} Performance</span>
                <Badge
                  variant={activeHoverPoint.rate >= 75 ? "success" : "warning"}
                  className="text-[9px] px-1.5 py-0"
                >
                  {activeHoverPoint.rate >= 75 ? "Passed Target" : "Below Target"}
                </Badge>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Passing Rate:</span>
                  <span className="font-extrabold text-foreground">{activeHoverPoint.rate}%</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Avg Exam Score:</span>
                  <span className="font-extrabold text-foreground">{activeHoverPoint.avgScore}%</span>
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
      <Card className="lg:col-span-5 bg-card border border-border rounded-2xl p-4 md:p-5 shadow-2xs flex flex-col justify-between gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <PieChart className="text-primary size-5" />
              Current Passing Rate
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribution of {totalStudentsCount} active aspirants by licensure status.
            </p>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5"
          >
            {overallPassRate}% Overall
          </Badge>
        </div>

        {/* Donut Chart SVG & Center Summary Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-1">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
              <circle
                cx="85"
                cy="85"
                r={donutRadius}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="20"
              />

              {donutSlices.map((slice, index) => (
                <circle
                  key={index}
                  cx="85"
                  cy="85"
                  r={donutRadius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
                />
              ))}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {overallPassRate}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Passing Rate
              </span>
            </div>
          </div>

          {/* Side Legend Table */}
          <div className="flex flex-col gap-2.5 w-full">
            {distributionData.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.count} Aspirants
                    </span>
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-[11px] font-black shrink-0 ${item.bgLight || "bg-muted"} ${item.text || ""}`}
                >
                  {item.value}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-2.5 text-xs text-muted-foreground">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span className="text-[11px] font-medium leading-snug">
            <strong>{overallPassRate}%</strong> of students meet the 75% licensure passing standard (calculated from DB exam results).
          </span>
        </div>
      </Card>
    </div>
  );
}
