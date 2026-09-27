import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Zap, Flame, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { LeaderboardStudent } from "../types/types";

interface LeaderboardTableRowProps {
  student: LeaderboardStudent;
}

export default function LeaderboardTableRow({ student }: LeaderboardTableRowProps) {
  const isTop3 = student.rank <= 3;

  return (
    <tr
      className={`hover:bg-accent/30 transition-colors ${
        isTop3 ? "bg-accent/10" : ""
      }`}
    >
      <td className="py-3 px-4 text-center">
        {student.rank === 1 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-extrabold text-[11px]">
            🥇 1
          </span>
        )}
        {student.rank === 2 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-500/30 font-extrabold text-[11px]">
            🥈 2
          </span>
        )}
        {student.rank === 3 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-extrabold text-[11px]">
            🥉 3
          </span>
        )}
        {student.rank > 3 && (
          <span className="font-extrabold text-muted-foreground text-xs">
            #{student.rank}
          </span>
        )}
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground text-xs truncate max-w-[150px]">
              {student.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              {student.email}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold gap-1 px-2 py-0.5 rounded-full"
        >
          <Zap size={10} className="fill-amber-500 text-amber-500" />
          Lvl {student.level}
        </Badge>
      </td>

      <td className="py-3 px-4 font-extrabold text-primary text-xs">
        {student.totalXP.toLocaleString()} XP
      </td>

      <td className="py-3 px-4">
        <span
          className={`font-bold text-xs ${
            student.accuracy >= 85
              ? "text-emerald-600 dark:text-emerald-400"
              : student.accuracy >= 60
              ? "text-foreground"
              : "text-destructive"
          }`}
        >
          {student.accuracy}%
        </span>
      </td>

      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 font-bold text-xs text-orange-600 dark:text-orange-400">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          {student.streak} Days
        </span>
      </td>

      <td className="py-3 px-4 text-xs font-semibold text-muted-foreground">
        {student.topSubject}
      </td>

      <td className="py-3 px-4 text-right">
        {student.rankChange > 0 ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{student.rankChange}
          </span>
        ) : student.rankChange < 0 ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-destructive">
            <ArrowDownRight className="w-3.5 h-3.5" /> {student.rankChange}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-muted-foreground">
            <Minus className="w-3 h-3" /> 0
          </span>
        )}
      </td>
    </tr>
  );
}
