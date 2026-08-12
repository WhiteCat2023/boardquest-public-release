import { useState } from "react";
import { TrendingUp, BarChart2, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult, PerformanceTrendItem } from "../types/types";

interface PerformanceGraphsTabProps {
  report: StudentAnalyticsResult;
}

export function PerformanceGraphsTab({ report }: PerformanceGraphsTabProps) {
  const [hoverTrendPoint, setHoverTrendPoint] = useState<PerformanceTrendItem | null>(null);

  const trendData = Array.isArray(report?.performanceTrend) ? report.performanceTrend : [];
  const masteryList = Array.isArray(report?.metrics?.mastery) ? report.metrics.mastery : [];
  const easyData = report?.difficultyBreakdown?.easy || { attempted: 0, accuracy: 0 };
  const mediumData = report?.difficultyBreakdown?.medium || { attempted: 0, accuracy: 0 };
  const hardData = report?.difficultyBreakdown?.hard || { attempted: 0, accuracy: 0 };

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 36;
  const paddingY = 24;
  const minVal = 40;
  const maxVal = 100;

  const getX = (idx: number) => {
    const step = trendData.length > 1 ? (svgWidth - paddingX * 2) / (trendData.length - 1) : 0;
    return paddingX + idx * step;
  };

  const getY = (val: number) => {
    const usableHeight = svgHeight - paddingY * 2;
    const ratio = (val - minVal) / (maxVal - minVal);
    return svgHeight - paddingY - ratio * usableHeight;
  };

  const scorePoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.score), data: d }));
  const accuracyPoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.accuracy), data: d }));

  const scorePath = scorePoints.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[idx - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const scoreArea = scorePoints.length > 0
    ? `${scorePath} L ${scorePoints[scorePoints.length - 1].x},${svgHeight - paddingY} L ${scorePoints[0].x},${svgHeight - paddingY} Z`
    : "";

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150">
      {/* SVG Exam Score & Accuracy Trend Line Graph */}
      <Card className="border border-border/70 rounded-2xl bg-card p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase">
              <TrendingUp size={14} className="text-primary" />
              Performance Score & Accuracy History
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Exam scores and accuracy benchmarked against 75% target.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold">
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

        {/* SVG Chart Render */}
        <div className="relative w-full overflow-x-auto py-1">
          {trendData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground font-medium italic gap-1">
              <TrendingUp size={24} className="text-muted-foreground/30" />
              No exam performance history recorded yet.
            </div>
          ) : (
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto max-h-[260px] overflow-visible"
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              {[40, 60, 75, 90, 100].map((val) => {
                const y = getY(val);
                const isBenchmark = val === 75;
                return (
                  <g key={val}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      stroke="currentColor" 
                      strokeDasharray={isBenchmark ? "4 4" : "2 2"}
                      className={isBenchmark ? "text-amber-500/80 stroke-[1.5]" : "text-border/40"}
                    />
                    <text 
                      x={paddingX - 6} 
                      y={y + 3} 
                      textAnchor="end" 
                      className={`text-[8px] font-bold ${isBenchmark ? "fill-amber-500 font-black" : "fill-muted-foreground"}`}
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Area Fill for Score */}
              <path d={scoreArea} fill="url(#scoreGradient)" />

              {/* Score Curve */}
              <path 
                d={scorePath} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                className="text-primary"
              />

              {/* Accuracy Curve */}
              <path 
                d={accuracyPoints.reduce((acc, pt, idx, arr) => {
                  if (idx === 0) return `M ${pt.x},${pt.y}`;
                  const prev = arr[idx - 1];
                  const cx = (prev.x + pt.x) / 2;
                  return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
                }, "")} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="3 3"
                className="text-emerald-500"
              />

              {/* Score Points */}
              {scorePoints.map((pt, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoverTrendPoint(pt.data)}>
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="4.5" 
                    className="fill-background stroke-primary stroke-[2] hover:r-6 transition-all"
                  />
                </g>
              ))}

              {/* Date Labels below */}
              {trendData.map((d, i) => (
                <text 
                  key={i} 
                  x={getX(i)} 
                  y={svgHeight - 6} 
                  textAnchor="middle" 
                  className="text-[8px] font-bold fill-muted-foreground"
                >
                  {d.date}
                </text>
              ))}
            </svg>
          )}

          {/* Hover Info Tooltip Banner */}
          {hoverTrendPoint && (
            <div className="mt-2 p-2.5 bg-card/90 border border-border/80 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-100 shadow-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-bold bg-background">
                  {hoverTrendPoint.date}
                </Badge>
                <span className="font-bold text-foreground text-xs">{hoverTrendPoint.examName}</span>
                <span className="text-[11px] text-muted-foreground">({hoverTrendPoint.subject})</span>
              </div>
              <div className="flex items-center gap-3 font-bold text-xs">
                <span className="text-primary">Score: {hoverTrendPoint.score}%</span>
                <span className="text-emerald-500">Accuracy: {hoverTrendPoint.accuracy}%</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Category Mastery & Question Difficulty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Category Mastery Bar Chart */}
        <Card className="lg:col-span-7 border border-border/70 rounded-2xl bg-card p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart2 size={14} className="text-primary" />
              Category Proficiency vs Target (75%)
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {masteryList.map((m: any, idx: number) => {
              const isPassing = m.proficiency >= 75;
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{m.subject}</span>
                    <span className={`font-black ${isPassing ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}`}>
                      {m.proficiency}%
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassing ? "bg-emerald-500" : m.proficiency >= 55 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${m.proficiency}%` }}
                    />
                    <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-foreground/60 z-10" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Difficulty Level Breakdown */}
        <Card className="lg:col-span-5 border border-border/70 rounded-2xl bg-card p-4 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              Performance by Difficulty
            </h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Easy */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Easy Difficulty</h4>
                <span className="text-[10px] text-muted-foreground">{easyData.attempted} Questions Answered</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{easyData.accuracy}%</span>
                <span className="block text-[8px] font-extrabold text-muted-foreground uppercase">Accuracy</span>
              </div>
            </div>

            {/* Medium */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Medium Difficulty</h4>
                <span className="text-[10px] text-muted-foreground">{mediumData.attempted} Questions Answered</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{mediumData.accuracy}%</span>
                <span className="block text-[8px] font-extrabold text-muted-foreground uppercase">Accuracy</span>
              </div>
            </div>

            {/* Hard */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">Hard / Board Level</h4>
                <span className="text-[10px] text-muted-foreground">{hardData.attempted} Questions Answered</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-rose-600 dark:text-rose-400">{hardData.accuracy}%</span>
                <span className="block text-[8px] font-extrabold text-muted-foreground uppercase">Accuracy</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
