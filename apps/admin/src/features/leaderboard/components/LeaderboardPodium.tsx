import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, Flame } from "lucide-react";
import type { LeaderboardStudent } from "../types/types";

interface LeaderboardPodiumProps {
  top1?: LeaderboardStudent;
  top2?: LeaderboardStudent;
  top3?: LeaderboardStudent;
}

export default function LeaderboardPodium({
  top1,
  top2,
  top3,
}: LeaderboardPodiumProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
      {/* 2nd Place */}
      <Card className="border-slate-500/30 bg-slate-500/10 shadow-xs relative overflow-hidden flex flex-col justify-between order-2 md:order-1 rounded-2xl">
        <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
          <Medal className="w-20 h-20 text-slate-400" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 font-bold px-2 py-0.5 text-[10px]">
              🥈 2ND PLACE
            </Badge>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Lvl {top2?.level} Candidate
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground truncate">
              {top2?.name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {top2?.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Total XP
              </span>
              <span className="text-sm font-extrabold text-slate-300">
                {top2?.totalXP.toLocaleString()} XP
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Accuracy
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {top2?.accuracy}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1st Place Champion */}
      <Card className="border-amber-500/40 bg-amber-500/15 shadow-sm relative overflow-hidden flex flex-col justify-between order-1 md:order-2 ring-1 ring-amber-500/30 rounded-2xl">
        <div className="absolute top-0 right-0 p-3 opacity-25 pointer-events-none">
          <Crown className="w-22 h-22 text-amber-400 animate-pulse" />
        </div>
        <CardContent className="p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-500 text-amber-950 font-black px-2.5 py-0.5 text-[10.5px] gap-1 shadow-2xs">
              <Crown className="w-3 h-3 fill-amber-950" /> 1ST PLACE CHAMPION
            </Badge>
            <span className="text-xs font-bold text-amber-500">
              Lvl {top1?.level} Master
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-foreground truncate">
              {top1?.name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {top1?.email}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-amber-500/20 text-xs">
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Total XP
              </span>
              <span className="text-sm font-black text-amber-400">
                {top1?.totalXP.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Accuracy
              </span>
              <span className="text-sm font-black text-emerald-400">
                {top1?.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Streak
              </span>
              <span className="text-sm font-black text-orange-400 flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-orange-400" /> {top1?.streak}d
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3rd Place */}
      <Card className="border-orange-500/30 bg-orange-500/10 shadow-xs relative overflow-hidden flex flex-col justify-between order-3 rounded-2xl">
        <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
          <Award className="w-20 h-20 text-orange-400" />
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 font-bold px-2 py-0.5 text-[10px]">
              🥉 3RD PLACE
            </Badge>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Lvl {top3?.level} Candidate
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground truncate">
              {top3?.name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {top3?.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Total XP
              </span>
              <span className="text-sm font-extrabold text-orange-400">
                {top3?.totalXP.toLocaleString()} XP
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[9.5px] uppercase font-bold">
                Accuracy
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {top3?.accuracy}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
