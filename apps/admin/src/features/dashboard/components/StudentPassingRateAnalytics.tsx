import { useState } from "react";
import { 
  TrendingUp, 
  Target, 
  Percent,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardAnalyticsSummary } from "../api/useDashboardAnalytics";
import { formatReadinessScore, getReadinessTier } from "@/utils/readinessUtils";

interface DataPoint {
  month: string;
  rate: number;
  readinessScore?: number;
  avgScore: number;
  students: number;
  tier?: "High Probability" | "In Training" | "Needs Remediation";
  benchmarkMet?: boolean;
}

export function StudentPassingRateAnalytics() {
  const { data: analytics, isLoading, isFetching, refetch } = useDashboardAnalyticsSummary();
  const [activeHoverPoint, setActiveHoverPoint] = useState<DataPoint | null>(null);
  const [timeframe, setTimeframe] = useState<"6M" | "1Y">("6M");

  const fullMonthlyTrend: DataPoint[] = analytics?.monthlyTrend || [];
  const trendData = timeframe === "6M" 
    ? (fullMonthlyTrend.length > 6 ? fullMonthlyTrend.slice(-6) : fullMonthlyTrend)
    : fullMonthlyTrend;

  const currentPoint = trendData.length > 0 ? trendData[trendData.length - 1] : null;
  const currentReadiness = analytics?.overallReadinessScore ?? currentPoint?.readinessScore ?? currentPoint?.rate ?? 0;
  const currentTier = getReadinessTier(currentReadiness);

  // Calculate monthly growth comparing last two months
  const lastScore = currentPoint?.readinessScore ?? currentPoint?.rate ?? 0;
  const prevPoint = trendData.length > 1 ? trendData[trendData.length - 2] : null;
  const prevScore = prevPoint?.readinessScore ?? prevPoint?.rate ?? 0;
  const hadPreviousCohort = (prevPoint?.students ?? 0) > 0;
  const rawGrowth = lastScore - prevScore;
  const growthRate = (rawGrowth >= 0 ? `+${rawGrowth.toFixed(1)}` : `${rawGrowth.toFixed(1)}`) + "%";

  const gapToBenchmark = (75 - currentReadiness).toFixed(1);

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

  const points = trendData.map((d, i) => ({
    x: getX(i),
    y: getY(d.readinessScore ?? d.rate),
    data: d,
  }));
  
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
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <div className="size-6 sm:size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Percent className="size-3.5 sm:size-4 stroke-[2.5]" />
              </div>
              <span>Aggregated Student Readiness Trend</span>
            </h2>

            {/* Real-time Live Badge */}
            <div 
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs select-none"
              title="Live real-time sync active • Automatically updates as student tests and mastery progress"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isFetching ? "duration-300" : "duration-1000"}`} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live Sync</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Average board exam readiness score across enrolled cohorts over time vs 75% PRC passing benchmark.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {/* Readiness Status Pill in Header */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/70 text-xs">
            <span className="text-muted-foreground font-medium">Cohort Score:</span>
            <span className="font-bold text-foreground font-mono">{formatReadinessScore(currentReadiness)}</span>
            <Badge variant="outline" className={`text-[9.5px] px-1.5 py-0 font-semibold ${currentTier.badgeClass}`}>
              {currentTier.tier}
            </Badge>
          </div>

          {/* Timeframe selector (6 Months vs Full Year) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
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

          {/* Real-time Refresh Action Button */}
          <button
            onClick={() => refetch()}
            title="Refresh analytics data"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border/60 hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {/* Line Chart SVG Container */}
      <div className="relative w-full overflow-hidden pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[180px] sm:h-[220px] overflow-visible"
        >
          <defs>
            <linearGradient id="readinessLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.32" />
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
                  className="text-[10px] fill-muted-foreground font-medium font-mono"
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
            strokeWidth="1.75"
            strokeDasharray="5 3"
            opacity="0.85"
          />
          <text
            x={paddingX + 6}
            y={benchmarkY - 6}
            textAnchor="start"
            className="text-[9.5px] fill-emerald-600 dark:fill-emerald-400 font-bold tracking-wide"
          >
            75% Target Benchmark
          </text>

          {/* Gradient Fill under Line */}
          {areaD && <path d={areaD} fill="url(#readinessLineGrad)" />}

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
            const scoreVal = p.data.readinessScore ?? p.data.rate;
            const isAboveBenchmark = scoreVal >= 75;
            const hasCohort = (p.data.students || 0) > 0;

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
                  r={isHovered ? "6" : hasCohort ? "4.5" : "3"}
                  fill="var(--color-background, #ffffff)"
                  stroke={
                    !hasCohort
                      ? "currentColor"
                      : isAboveBenchmark
                      ? "#10b981"
                      : "var(--color-primary, #3b82f6)"
                  }
                  strokeOpacity={!hasCohort ? "0.3" : "1"}
                  strokeWidth={isHovered ? "3" : hasCohort ? "2" : "1.5"}
                  className="transition-all duration-150"
                />
                <text
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`text-[10.5px] ${
                    isHovered
                      ? "fill-primary font-bold"
                      : hasCohort
                      ? "fill-foreground font-semibold"
                      : "fill-muted-foreground font-medium"
                  }`}
                >
                  {p.data.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip */}
        {activeHoverPoint && (() => {
          const ptScore = activeHoverPoint.readinessScore ?? activeHoverPoint.rate;
          const hasCohort = (activeHoverPoint.students || 0) > 0;
          const ptTier = getReadinessTier(ptScore);
          const ptDiff = (ptScore - 75).toFixed(1);
          const diffLabel = Number(ptDiff) >= 0 ? `+${ptDiff}% vs Target` : `${ptDiff}% to Target`;

          return (
            <div className="absolute top-2 right-4 bg-popover/95 border border-border shadow-md rounded-xl p-3 text-popover-foreground text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-10 min-w-44 font-sans">
              <div className="flex items-center justify-between gap-3 font-bold border-b border-border/60 pb-1.5 mb-1.5">
                <span className="text-foreground">{activeHoverPoint.month} Readiness</span>
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 font-bold ${
                    hasCohort ? ptTier.badgeClass : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {hasCohort ? ptTier.tier : "No Enrolled Cohort"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-baseline gap-4">
                  <span className="text-muted-foreground">Readiness Score:</span>
                  <span className="font-extrabold text-sm text-foreground font-mono">
                    {hasCohort ? formatReadinessScore(ptScore) : "0.0%"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-muted-foreground">PRC Benchmark (75%):</span>
                  <span
                    className={`font-semibold ${
                      !hasCohort
                        ? "text-muted-foreground"
                        : Number(ptDiff) >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {hasCohort ? diffLabel : "No Prior Data"}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-muted-foreground">Active Students:</span>
                  <span className="font-medium text-foreground">
                    {activeHoverPoint.students} Enrolled
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Summary Metrics Footer Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/40">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Target size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] text-muted-foreground font-medium truncate">Current Cohort Readiness</div>
            <div className="text-sm font-bold text-foreground font-mono flex items-center gap-1.5">
              {formatReadinessScore(currentReadiness)}
              <span className={`text-[9.5px] px-1.5 py-0 rounded font-semibold ${currentTier.badgeClass}`}>
                {currentTier.tier}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/40">
          <div className="size-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] text-muted-foreground font-medium truncate">PRC Target Benchmark (75%)</div>
            <div className="text-sm font-bold text-foreground font-mono">
              {currentReadiness >= 75 ? (
                <span className="text-emerald-600 dark:text-emerald-400">Target Benchmark Met</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">{gapToBenchmark}% gap to benchmark</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/40">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-[10.5px] text-muted-foreground font-medium truncate">Monthly Growth Velocity</div>
            <div className="text-sm font-bold text-foreground font-mono flex items-center gap-1">
              <ArrowUpRight size={14} className="text-emerald-500" />
              <span>{growthRate}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {hadPreviousCohort ? "vs previous month" : "initial cohort baseline"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const StudentReadinessTrendAnalytics = StudentPassingRateAnalytics;
export default StudentPassingRateAnalytics;
