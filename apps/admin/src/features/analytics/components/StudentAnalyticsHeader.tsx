import { ShieldCheck, Award, Flame, Sparkles, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult } from "../types/types";

interface StudentAnalyticsHeaderProps {
  report: StudentAnalyticsResult;
  isRefetching: boolean;
}

export function StudentAnalyticsHeader({ report, isRefetching }: StudentAnalyticsHeaderProps) {
  const name = report?.studentInfo?.name || "Student";
  const email = report?.studentInfo?.email || "";
  const readinessScore = report?.studentInfo?.readinessScore ?? 0;
  const level = report?.studentInfo?.level ?? 1;
  const streak = report?.studentInfo?.streak ?? 0;
  const xp = report?.studentInfo?.xp ?? 0;
  const initials = (name || "ST").slice(0, 2).toUpperCase();

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 min-w-0">
      {/* Student Profile Info */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-primary/20 shadow-2xs shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-black text-sm sm:text-base">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight flex items-center gap-2 leading-tight truncate">
            <span className="truncate">{name}</span>
            {isRefetching && (
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary font-bold border-primary/20 animate-pulse px-1.5 py-0 flex items-center gap-1 shrink-0">
                <RefreshCw size={9} className="animate-spin" />
                Syncing
              </Badge>
            )}
          </h1>
          <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{email}</span>
        </div>
      </div>

      {/* Header Compact Metric Badges: Grid on Mobile (2x2), Flex on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap md:items-center gap-2 w-full md:w-auto shrink-0">
        {/* Readiness */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2 min-w-0">
          <ShieldCheck size={16} className="text-emerald-500 stroke-[2.5] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider leading-none truncate">Readiness</span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight truncate">{readinessScore}%</span>
          </div>
        </div>

        {/* Level */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center gap-2 min-w-0">
          <Award size={16} className="text-amber-500 stroke-[2.5] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider leading-none truncate">Level</span>
            <span className="text-xs sm:text-sm font-black text-foreground leading-tight truncate">Lvl {level}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 flex items-center gap-2 min-w-0">
          <Flame size={16} className="text-orange-500 stroke-[2.5] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-extrabold text-orange-700 dark:text-orange-300 uppercase tracking-wider leading-none truncate">Streak</span>
            <span className="text-xs sm:text-sm font-black text-foreground leading-tight truncate">{streak} Days</span>
          </div>
        </div>

        {/* XP Points */}
        <div className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 flex items-center gap-2 min-w-0">
          <Sparkles size={16} className="text-indigo-500 stroke-[2.5] shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider leading-none truncate">XP Points</span>
            <span className="text-xs sm:text-sm font-black text-foreground leading-tight truncate">{xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

