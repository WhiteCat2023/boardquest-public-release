import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "./utils";
import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";

const ACCENT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-500",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-500",
  },
  destructive: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
  },
  default: {
    bg: "bg-muted/60",
    border: "border-border/40",
    text: "text-foreground/75",
  },
};

export interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  target?: string | number;
  progress?: number;
  showProgress?: boolean;
  showRadial?: boolean;
  accentColor?: string;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function KpiCard({
  icon: Icon,
  title,
  value,
  subtitle,
  target,
  progress,
  showProgress,
  showRadial = true,
  accentColor,
  isLoading = false,
  className,
  onClick,
}: KpiCardProps) {
  const hasProgress = showProgress ?? (target !== undefined || progress !== undefined);

  const totalPct =
    progress !== undefined
      ? Math.round(progress)
      : typeof value === "number" && typeof target === "number" && target > 0
        ? Math.round((value / target) * 100)
        : !isNaN(Number(value)) && !isNaN(Number(target)) && Number(target) > 0
          ? Math.round((Number(value) / Number(target)) * 100)
          : undefined;

  const circumference = 2 * Math.PI * 22; // radius = 22
  const arcOffset =
    totalPct !== undefined
      ? circumference - (Math.min(100, Math.max(0, totalPct)) / 100) * circumference
      : circumference;

  const accent = accentColor ? ACCENT_STYLES[accentColor] : null;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-border hover:shadow-xs transition-all flex flex-col justify-between min-w-0",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Top Row: Icon + Title */}
      <CardHeader className="flex justify-between p-0">
        <CardTitle className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "size-6 sm:size-7 rounded-lg border flex items-center justify-center shrink-0",
              accent ? accent.bg : "bg-muted/60",
              accent ? accent.border : "border-border/40",
              accent ? accent.text : "text-foreground/75"
            )}
          >
            <Icon className="size-3.5 sm:size-4 stroke-[2]" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-foreground/80 tracking-wider uppercase truncate">
            {title}
          </p>
        </CardTitle>
      </CardHeader>

      {/* Middle Row: Large Value / Progress */}
      <CardContent className="p-0">
        {isLoading ? (
          <Skeleton className="h-8 w-16 rounded mt-1" />
        ) : hasProgress ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate font-mono">
                {typeof value === "number" ? value.toLocaleString() : value}
                {target !== undefined && (
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    / {typeof target === "number" ? target.toLocaleString() : target}
                  </span>
                )}
              </span>
              {totalPct !== undefined && (
                <Progress
                  value={totalPct}
                  className="h-1.5 mt-1 [&>div]:bg-primary"
                />
              )}
            </div>

            {/* Radial arc */}
            {showRadial && totalPct !== undefined && (
              <div className="shrink-0 relative hidden sm:flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-muted/40"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={arcOffset}
                    className="text-primary transition-all duration-700"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-foreground">
                  {totalPct}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground block truncate font-mono">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        )}
      </CardContent>

      {/* Bottom Row: Context Subtitle */}
      {subtitle && (
        <CardContent className="p-0">
          <p className="text-[10.5px] sm:text-[11.5px] text-muted-foreground truncate leading-tight">
            {subtitle}
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default KpiCard;
