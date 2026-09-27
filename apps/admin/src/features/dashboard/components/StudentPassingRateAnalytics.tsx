import { useState } from "react";
import { 
  TrendingUp, 
  Target, 
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

  const overallAvgScore = analytics?.overallAvgScore ?? 0;

  // Calculate monthly growth comparing last two months
  const lastMonthRate = trendData.length > 0 ? trendData[trendData.length - 1]?.rate ?? 0 : 0;
  const prevMonthRate = trendData.length > 1 ? trendData[trendData.length - 2]?.rate ?? 0 : 0;
  const growthRate = (lastMonthRate - prevMonthRate).toFixed(1);

  // SVG Line Chart Dimensions & Scaling for full-width card
  const svgWidth = 960;
  const svgHeight = 220;
  const paddingX = 48;
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

  if (isLoading) {
    return (
      <Card className="w-full bg-card border border-border rounded-xl p-4 shadow-2xs h-[360px] flex flex-col justify-between font-sans">
        <Skeleton className="h-7 w-64 bg-muted rounded-md" />
        <Skeleton className="h-14 w-full bg-muted rounded-xl" />
        <Skeleton className="h-44 w-full bg-muted rounded-xl" />
      </Card>
    );
  }

  return (
    <Card className="w-full shrink-0 min-h-fit bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3.5 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="text-primary size-4 sm:size-5" />
            <span>Student Passing Rate Trend</span>
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
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/30 border border-border/60 p-2.5 rounded-xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Award size={12} className="text-emerald-500" />
            <span>Latest Pass Rate</span>
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {lastMonthRate.toFixed(1)}%
          </span>
        </div>

        <div className="flex flex-col border-l border-border/60 pl-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Target size={12} className="text-primary" />
            <span>Target Benchmark</span>
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
            75.0%
          </span>
        </div>

        <div className="flex flex-col border-l border-border/60 pl-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>Monthly Growth</span>
          </span>
          <span className={`text-base sm:text-lg font-bold mt-0.5 ${Number(growthRate) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
            {Number(growthRate) >= 0 ? `+${growthRate}%` : `${growthRate}%`}
          </span>
        </div>

        <div className="flex flex-col border-l border-border/60 pl-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrendingUp size={12} className="text-blue-500" />
            <span>Avg Exam Score</span>
          </span>
          <span className="text-base sm:text-lg font-bold text-foreground mt-0.5">
            {overallAvgScore.toFixed(1)}%
          </span>
        </div>
      </div> */}

      {/* Line Chart SVG Container */}
      <div className="relative w-full overflow-hidden pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[180px] sm:h-[220px] overflow-visible"
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
                variant="outline"
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
  );
}
