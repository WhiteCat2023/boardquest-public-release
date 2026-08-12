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
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3.5">
        <Avatar className="h-11 w-11 border border-primary/20 shadow-2xs">
          <AvatarFallback className="bg-primary/10 text-primary font-black text-base">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2 leading-tight">
            {name}
            {isRefetching && (
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary font-bold border-primary/20 animate-pulse px-1.5 py-0 flex items-center gap-1">
                <RefreshCw size={9} className="animate-spin" />
                Syncing
              </Badge>
            )}
          </h1>
          <span className="text-xs text-muted-foreground font-medium">{email}</span>
        </div>
      </div>

      {/* Header Compact Metric Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500 stroke-[2.5]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest leading-none">Readiness</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 leading-tight">{readinessScore}%</span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center gap-2">
          <Award size={16} className="text-amber-500 stroke-[2.5]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-widest leading-none">Level</span>
            <span className="text-xs font-black text-foreground leading-tight">Lvl {level}</span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 flex items-center gap-2">
          <Flame size={16} className="text-orange-500 stroke-[2.5]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-orange-700 dark:text-orange-300 uppercase tracking-widest leading-none">Streak</span>
            <span className="text-xs font-black text-foreground leading-tight">{streak} Days</span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500 stroke-[2.5]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest leading-none">XP Points</span>
            <span className="text-xs font-black text-foreground leading-tight">{xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
