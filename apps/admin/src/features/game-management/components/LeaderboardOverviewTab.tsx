import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Crown, Loader2, UserX } from "lucide-react";
import { useStudents } from "@/features/students";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  email: string;
  level: number;
  totalXP: number;
  streak: number;
  unlockedBadges: number;
}

export function LeaderboardOverviewTab() {
  const { data: studentsData, isLoading } = useStudents();
  const rawStudents = studentsData?.students || [];

  const leaderboardList: LeaderboardUser[] = rawStudents
    .map((s: any) => ({
      id: s.id,
      name: s.name || "Aspirant Candidate",
      email: s.email || "",
      level: s.level || 1,
      totalXP: s.xp || 0,
      streak: s.streak || 0,
      unlockedBadges: Array.isArray(s.achievements) ? s.achievements.length : 0,
      rank: 0,
    }))
    .sort((a, b) => b.totalXP - a.totalXP)
    .map((s, index) => ({ ...s, rank: index + 1 }));

  if (isLoading) {
    return (
      <Card className="border-border p-8 flex flex-col items-center justify-center text-center gap-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">
          Loading database student rankings...
        </p>
      </Card>
    );
  }

  if (leaderboardList.length === 0) {
    return (
      <Card className="border-border p-8 flex flex-col items-center justify-center text-center gap-2 bg-card/50">
        <UserX className="w-6 h-6 text-muted-foreground" />
        <h4 className="text-sm font-bold text-foreground">
          No Student Rankings Available
        </h4>
        <p className="text-xs text-muted-foreground">
          Enrolled student candidates will appear here as they earn XP.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards */}
      {leaderboardList.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboardList.slice(0, 3).map((student) => {
            const isRank1 = student.rank === 1;
            const isRank2 = student.rank === 2;

            return (
              <Card
                key={student.id}
                className={`border transition-all shadow-2xs relative overflow-hidden ${
                  isRank1
                    ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20"
                    : isRank2
                      ? "bg-slate-500/10 border-slate-500/30"
                      : "bg-orange-500/10 border-orange-500/30"
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Rank #{student.rank} Leader
                    </span>
                    <h4 className="text-base font-extrabold text-foreground mt-0.5">
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-primary">
                        Lvl {student.level}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-bold">
                        {student.totalXP.toLocaleString()} XP
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      isRank1
                        ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                        : isRank2
                          ? "bg-slate-500/20 text-slate-300 border-slate-500/40"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                    }`}
                  >
                    {isRank1 ? (
                      <Crown className="w-6 h-6" />
                    ) : (
                      <Trophy className="w-5 h-5" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="border-border shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border bg-accent/30 p-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Student Gamification
            Leaderboard
          </CardTitle>
          <CardDescription className="text-xs">
            Live rankings based on total earned XP, student level, and active
            streak milestones.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-accent/40 text-muted-foreground text-[10px] uppercase font-bold">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Aspirant Candidate</th>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Total XP</th>
                <th className="py-2.5 px-3">Streak</th>
                <th className="py-2.5 px-3 text-right">Badges Unlocked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboardList.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-accent/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-extrabold text-foreground">
                    #{user.rank}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-foreground">
                    <div>{user.name}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">
                      {user.email}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 font-bold text-[10px]"
                    >
                      Level {user.level}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-primary">
                    {user.totalXP.toLocaleString()} XP
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-orange-500/20" />{" "}
                      {user.streak} Days
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-muted-foreground">
                    {user.unlockedBadges} Badges
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
