import type { StudentAnalyticsResult, PerformanceTrendItem } from "../../types/types";

export interface PerformanceGraphsTabProps {
  report: StudentAnalyticsResult;
}

export interface ChartPoint {
  x: number;
  y: number;
  data: PerformanceTrendItem;
  index: number;
}

export interface ChartDimensions {
  svgWidth: number;
  svgHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  usableWidth: number;
  usableHeight: number;
  baselineY: number;
}

export function computeChartDimensions(itemCount: number): ChartDimensions {
  const svgWidth = Math.max(680, itemCount * 36);
  const svgHeight = 250;
  const paddingLeft = 46;
  const paddingRight = 24;
  const paddingTop = 24;
  const paddingBottom = 46;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = svgHeight - paddingBottom;

  return {
    svgWidth,
    svgHeight,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    usableWidth,
    usableHeight,
    baselineY,
  };
}

export function generateSmoothCurvePath(points: ChartPoint[]): string {
  return points.reduce(
    (acc: string, pt: ChartPoint, idx: number, arr: ChartPoint[]) => {
      if (idx === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    },
    ""
  );
}

export function computeVisibleXAxisIndices(totalCount: number): number[] {
  if (totalCount <= 6) {
    return Array.from({ length: totalCount }, (_, i) => i);
  }
  const count = 5;
  const step = (totalCount - 1) / count;
  const indices = new Set<number>();
  indices.add(0);
  for (let i = 1; i < count; i++) {
    indices.add(Math.round(i * step));
  }
  indices.add(totalCount - 1);
  return Array.from(indices).sort((a: number, b: number) => a - b);
}
