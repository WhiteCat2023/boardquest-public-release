import { useMemo } from "react";
import type { StudentAnalyticsResult, PerformanceTrendItem } from "../types/types";
import {
  type PerformanceGraphsTabProps,
  PerformanceTrendChart,
  CategoryProficiencyCard,
  DifficultyBreakdownCard,
} from "./graphs";

export type { PerformanceGraphsTabProps };

export function PerformanceGraphsTab({ report }: PerformanceGraphsTabProps) {
  const trendData = useMemo<PerformanceTrendItem[]>(
    () =>
      Array.isArray(report?.performanceTrend) ? report.performanceTrend : [],
    [report]
  );
  const masteryList = Array.isArray(report?.metrics?.mastery)
    ? report.metrics.mastery
    : [];
  const easyData = report?.difficultyBreakdown?.easy || {
    attempted: 0,
    accuracy: 0,
  };
  const mediumData = report?.difficultyBreakdown?.medium || {
    attempted: 0,
    accuracy: 0,
  };
  const hardData = report?.difficultyBreakdown?.hard || {
    attempted: 0,
    accuracy: 0,
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
      {/* SVG Exam Score & Accuracy Trend Line Graph */}
      <PerformanceTrendChart trendData={trendData} />

      {/* Category Mastery & Question Difficulty Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4 min-w-0">
        <CategoryProficiencyCard masteryList={masteryList} />
        <DifficultyBreakdownCard
          easyData={easyData}
          mediumData={mediumData}
          hardData={hardData}
        />
      </div>
    </div>
  );
}

export default PerformanceGraphsTab;
