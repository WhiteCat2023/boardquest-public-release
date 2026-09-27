import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PerformanceTrendItem } from "../../types/types";
import {
  type ChartPoint,
  computeChartDimensions,
  generateSmoothCurvePath,
  computeVisibleXAxisIndices,
} from "./performanceGraphTypes";

interface PerformanceTrendChartProps {
  trendData: PerformanceTrendItem[];
}

export default function PerformanceTrendChart({
  trendData,
}: PerformanceTrendChartProps) {
  const [hoverTrendPoint, setHoverTrendPoint] =
    useState<PerformanceTrendItem | null>(null);

  const activeTrendPoint =
    hoverTrendPoint ||
    (trendData.length > 0 ? trendData[trendData.length - 1] : null);

  const {
    svgWidth,
    svgHeight,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    usableWidth,
    usableHeight,
    baselineY,
  } = useMemo(
    () => computeChartDimensions(trendData.length),
    [trendData.length]
  );

  const getX = (idx: number) => {
    if (trendData.length <= 1) return paddingLeft + usableWidth / 2;
    return paddingLeft + (idx / (trendData.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, Number(val) || 0));
    return baselineY - (clamped / 100) * usableHeight;
  };

  const scorePoints = useMemo<ChartPoint[]>(
    () =>
      trendData.map(
        (d: PerformanceTrendItem, i: number): ChartPoint => ({
          x: getX(i),
          y: getY(d.score),
          data: d,
          index: i,
        })
      ),
    [trendData, baselineY, usableHeight, usableWidth]
  );

  const accuracyPoints = useMemo<ChartPoint[]>(
    () =>
      trendData.map(
        (d: PerformanceTrendItem, i: number): ChartPoint => ({
          x: getX(i),
          y: getY(d.accuracy),
          data: d,
          index: i,
        })
      ),
    [trendData, baselineY, usableHeight, usableWidth]
  );

  const scorePath = useMemo<string>(
    () => generateSmoothCurvePath(scorePoints),
    [scorePoints]
  );

  const accuracyPath = useMemo<string>(
    () => generateSmoothCurvePath(accuracyPoints),
    [accuracyPoints]
  );

  const scoreArea = useMemo<string>(() => {
    if (scorePoints.length <= 1) return "";
    return `${scorePath} L ${scorePoints[scorePoints.length - 1].x},${baselineY} L ${scorePoints[0].x},${baselineY} Z`;
  }, [scorePath, scorePoints, baselineY]);

  const visibleIndices = useMemo<number[]>(
    () => computeVisibleXAxisIndices(trendData.length),
    [trendData.length]
  );

  return (
    <Card className="border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-border/50 pb-3 min-w-0">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase truncate">
            <TrendingUp size={14} className="text-primary shrink-0" />
            Performance Score &amp; Accuracy History
          </h3>
          <p className="text-[11px] text-muted-foreground truncate">
            Exam scores and accuracy benchmarked against 75% target.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block"></span>
            <span>Score %</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Accuracy %</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-amber-500 inline-block"></span>
            <span>75% Target</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Render with horizontal scroll containment */}
      <div className="relative w-full overflow-x-auto scrollbar-thin py-1">
        {trendData.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground font-medium italic gap-1">
            <TrendingUp size={24} className="text-muted-foreground/30" />
            No exam performance history recorded yet.
          </div>
        ) : (
          <div className="min-w-[500px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[280px]"
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.0"
                  />
                </linearGradient>
                <clipPath id="chartPlotArea">
                  <rect
                    x={paddingLeft - 8}
                    y={paddingTop - 8}
                    width={usableWidth + 16}
                    height={usableHeight + 16}
                  />
                </clipPath>
              </defs>

              {/* Grid Horizontal Lines: 0, 25, 50, 75 (target), 100 */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getY(val);
                const isBenchmark = val === 75;
                const isBaseline = val === 0;
                return (
                  <g key={val}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray={
                        isBaseline ? "none" : isBenchmark ? "5 4" : "2 3"
                      }
                      className={
                        isBenchmark
                          ? "text-amber-500/80 stroke-[1.5]"
                          : isBaseline
                            ? "text-border stroke-[1.5]"
                            : "text-border/40"
                      }
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className={`text-[8.5px] font-bold ${
                        isBenchmark
                          ? "fill-amber-500 font-black"
                          : isBaseline
                            ? "fill-foreground font-bold"
                            : "fill-muted-foreground"
                      }`}
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Plot Area with clipping */}
              <g clipPath="url(#chartPlotArea)">
                {/* Area Fill for Score */}
                {scoreArea && <path d={scoreArea} fill="url(#scoreGradient)" />}

                {/* Score Curve */}
                {scorePath && (
                  <path
                    d={scorePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-primary"
                  />
                )}

                {/* Accuracy Curve */}
                {accuracyPath && (
                  <path
                    d={accuracyPath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="text-emerald-500"
                  />
                )}

                {/* Active Hover Guide Line */}
                {activeTrendPoint && (
                  <line
                    x1={getX(trendData.indexOf(activeTrendPoint))}
                    y1={paddingTop}
                    x2={getX(trendData.indexOf(activeTrendPoint))}
                    y2={baselineY}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="text-primary/50"
                  />
                )}

                {/* Accuracy Points */}
                {accuracyPoints.map((pt: ChartPoint, idx: number) => {
                  const isHovered = activeTrendPoint === pt.data;
                  return (
                    <circle
                      key={`acc-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3}
                      className={`fill-background stroke-emerald-500 transition-all duration-150 ${
                        isHovered ? "stroke-[2.5]" : "stroke-[1.5]"
                      }`}
                    />
                  );
                })}

                {/* Score Points */}
                {scorePoints.map((pt: ChartPoint, idx: number) => {
                  const isHovered = activeTrendPoint === pt.data;
                  return (
                    <circle
                      key={`score-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      className={`fill-background stroke-primary transition-all duration-150 ${
                        isHovered ? "stroke-[3] drop-shadow-xs" : "stroke-[2]"
                      }`}
                    />
                  );
                })}
              </g>

              {/* X-Axis Ticks & Clean Non-overlapping Labels */}
              {visibleIndices.map((i: number) => {
                const d = trendData[i];
                if (!d) return null;
                const x = getX(i);
                return (
                  <g key={`x-axis-${i}`}>
                    {/* Tick marker below baseline */}
                    <line
                      x1={x}
                      y1={baselineY}
                      x2={x}
                      y2={baselineY + 5}
                      stroke="currentColor"
                      className="text-border stroke-[1.5]"
                    />
                    {/* Date label */}
                    <text
                      x={x}
                      y={baselineY + 18}
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-muted-foreground"
                    >
                      {d.date}
                    </text>
                    {/* Attempt index indicator */}
                    <text
                      x={x}
                      y={baselineY + 30}
                      textAnchor="middle"
                      className="text-[8px] font-medium fill-muted-foreground/60"
                    >
                      Exam #{i + 1}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Full Column Hover Slices */}
              {trendData.map((d: PerformanceTrendItem, i: number) => {
                const x = getX(i);
                const colWidth =
                  trendData.length > 1
                    ? usableWidth / (trendData.length - 1)
                    : usableWidth;
                return (
                  <rect
                    key={`col-${i}`}
                    x={x - colWidth / 2}
                    y={paddingTop}
                    width={colWidth}
                    height={usableHeight + paddingBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverTrendPoint(d)}
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Active Hover / Current Result Details Banner */}
        {activeTrendPoint && (
          <div className="mt-2.5 p-2.5 sm:p-3 bg-muted/20 border border-border/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="text-[10px] font-bold bg-background shrink-0 border-border"
              >
                {activeTrendPoint.date}
              </Badge>
              <span className="font-bold text-foreground text-xs truncate">
                {activeTrendPoint.examName}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                ({activeTrendPoint.subject})
              </span>
            </div>
            <div className="flex items-center gap-3 font-bold text-xs shrink-0">
              <span className="inline-flex items-center gap-1.5 text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                Score: {activeTrendPoint.score}%
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                Accuracy: {activeTrendPoint.accuracy}%
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
