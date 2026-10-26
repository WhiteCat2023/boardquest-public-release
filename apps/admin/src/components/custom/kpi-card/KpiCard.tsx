import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  target?: string | number;
  progress?: number;
  showProgress?: boolean;
  showRadial?: boolean;
  accentColor?: "default" | "emerald" | "amber" | "rose" | string;
  viewLink?: string;
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
  viewLink,
  className,
  onClick,
}: KpiCardProps) {
  const navigate = useNavigate();

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

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-border hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-w-0",
        className
      )}
    >
      {/* Top Row: Icon + Title + More Options */}
      <CardHeader className="flex justify-between p-0">
        <CardTitle className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "size-6 sm:size-7 rounded-lg border flex items-center justify-center shrink-0",
              "bg-muted/60",
              "border-border/40",
              "text-foreground/75"
            )}
          >
            <Icon className="size-3.5 sm:size-4 stroke-[2]" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-foreground/80 tracking-wider uppercase truncate">
            {title}
          </p>
        </CardTitle>
        {viewLink && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="p-1 -mr-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                title="Options"
              >
                <MoreHorizontal className="size-3.5 sm:size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-30 rounded-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={() => navigate(viewLink)}
                className="cursor-pointer flex items-center gap-2 text-[12px]"
              >
                <ExternalLink className="size-3 text-muted-foreground" />
                <span>View details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
      {subtitle && (<CardContent className="p-0">
        <p className="text-[10.5px] sm:text-[11.5px] text-muted-foreground truncate leading-tight">
          {subtitle}
        </p>
      </CardContent>)}
    </Card>
  );
}

export default KpiCard;
