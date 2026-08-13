import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Crown, Flame, Sparkles, Search, TrendingUp, Award, Medal, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, UserX, Loader2 } from "lucide-react";
import { useStudents } from "@/features/students";
import type { LeaderboardStudent, LeaderboardCategory } from "../types/types";

export function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const [timeHorizon, setTimeHorizon] = useState<string>("all-time");

  const { data: studentsData, isLoading } = useStudents();
  const rawStudents = studentsData?.students || [];

  // Transform database students into leaderboard metrics
  const processedStudents: LeaderboardStudent[] = rawStudents.map((s: any) => {
    const exams = Array.isArray(s.examResults) ? s.examResults : [];
    const avgAccuracy = exams.length > 0
      ? Math.round(exams.reduce((acc: number, curr: any) => acc + (curr.accuracy || curr.score || 0), 0) / exams.length)
      : 0;

    const masteryList = Array.isArray(s.mastery) ? s.mastery : [];
    const masteredCount = masteryList.filter((m: any) => (m.proficiency || 0) >= 75).length;
    
    const sortedMastery = [...masteryList].sort((a: any, b: any) => (b.proficiency || 0) - (a.proficiency || 0));
    const topSubject = sortedMastery[0]?.subject || "General Review";

    const badgesCount = Array.isArray(s.achievements) ? s.achievements.length : 0;

    return {
      id: s.id,
      name: s.name || "Aspirant Candidate",
      email: s.email || "",
      level: s.level || 1,
      totalXP: s.xp || 0,
      accuracy: avgAccuracy,
      streak: s.streak || 0,
      masteredSubjectsCount: masteredCount,
      unlockedBadgesCount: badgesCount,
      rankChange: 0,
      topSubject,
      rank: 0,
    };
  });

  // Sort and filter students based on active category and search query
  const filteredStudents = processedStudents
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (category === "accuracy") return b.accuracy - a.accuracy;
      if (category === "streak") return b.streak - a.streak;
      if (category === "mastery") return b.masteredSubjectsCount - a.masteredSubjectsCount;
      return b.totalXP - a.totalXP;
    })
    .map((s, index) => ({ ...s, rank: index + 1 }));

  const top1 = filteredStudents[0];
  const top2 = filteredStudents[1];
  const top3 = filteredStudents[2];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Aspirant Leaderboard & Gamification Rankings
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time candidate rankings compiled strictly from live database performance metrics.
          </p>
        </div>

        <Select value={timeHorizon} onValueChange={setTimeHorizon}>
          <SelectTrigger className="w-40 font-semibold">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All-Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card className="border-border p-12 flex flex-col items-center justify-center text-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Fetching real student leaderboard data from database...</p>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="border-border p-12 flex flex-col items-center justify-center text-center gap-3 bg-card/50">
          <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Candidate Rankings Available</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {searchTerm
              ? `No student matching "${searchTerm}" was found.`
              : "Enrolled student candidates will automatically appear on the live leaderboard as they complete evaluation quests."}
          </p>
        </Card>
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          {filteredStudents.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* 2nd Place */}
              <Card className="border-slate-500/30 bg-slate-500/10 shadow-sm relative overflow-hidden flex flex-col justify-between order-2 md:order-1">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Medal className="w-20 h-20 text-slate-400" />
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 font-bold px-2.5 py-1">
                      2ND PLACE
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">Lvl {top2?.level} Candidate</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-foreground">{top2?.name}</h3>
                    <p className="text-xs text-muted-foreground">{top2?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total XP</span>
                      <span className="text-base font-extrabold text-slate-300">{top2?.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Accuracy</span>
                      <span className="text-base font-extrabold text-emerald-400">{top2?.accuracy}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place Champion */}
              <Card className="border-amber-500/40 bg-amber-500/15 shadow-md relative overflow-hidden flex flex-col justify-between order-1 md:order-2 ring-2 ring-amber-500/30">
                <div className="absolute top-0 right-0 p-3 opacity-25">
                  <Crown className="w-24 h-24 text-amber-400 animate-pulse" />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-500 text-amber-950 font-black px-3 py-1 text-xs gap-1">
                      <Crown className="w-3.5 h-3.5 fill-amber-950" /> 1ST PLACE CHAMPION
                    </Badge>
                    <span className="text-xs font-bold text-amber-500">Lvl {top1?.level} Master</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-foreground">{top1?.name}</h3>
                    <p className="text-xs text-muted-foreground">{top1?.email}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-500/20 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total XP</span>
                      <span className="text-lg font-black text-amber-400">{top1?.totalXP.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Accuracy</span>
                      <span className="text-lg font-black text-emerald-400">{top1?.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Streak</span>
                      <span className="text-lg font-black text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-4 h-4 fill-orange-400" /> {top1?.streak}d
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="border-orange-500/30 bg-orange-500/10 shadow-sm relative overflow-hidden flex flex-col justify-between order-3">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <Award className="w-20 h-20 text-orange-400" />
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 font-bold px-2.5 py-1">
                      3RD PLACE
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">Lvl {top3?.level} Candidate</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-foreground">{top3?.name}</h3>
                    <p className="text-xs text-muted-foreground">{top3?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total XP</span>
                      <span className="text-base font-extrabold text-orange-400">{top3?.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Accuracy</span>
                      <span className="text-base font-extrabold text-emerald-400">{top3?.accuracy}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCategory("overall")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === "overall"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Overall XP Leaders
              </button>

              <button
                type="button"
                onClick={() => setCategory("accuracy")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === "accuracy"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Accuracy Champions
              </button>

              <button
                type="button"
                onClick={() => setCategory("streak")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === "streak"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Streak Warriors
              </button>

              <button
                type="button"
                onClick={() => setCategory("mastery")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === "mastery"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Subject Mastery
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Main Rankings Table */}
          <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="border-b border-border bg-accent/30 py-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Live Candidate Rankings Roster
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  Showing {filteredStudents.length} candidates
                </span>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent/40 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Level</th>
                    <th className="py-3.5 px-4">Total XP</th>
                    <th className="py-3.5 px-4">Accuracy</th>
                    <th className="py-3.5 px-4">Streak</th>
                    <th className="py-3.5 px-4">Top Subject</th>
                    <th className="py-3.5 px-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student) => {
                    const isTop3 = student.rank <= 3;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-accent/20 transition-colors ${
                          isTop3 ? "bg-accent/10 font-medium" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          {student.rank === 1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs">🥇 1</span>}
                          {student.rank === 2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-500/20 text-slate-300 font-extrabold text-xs">🥈 2</span>}
                          {student.rank === 3 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 font-extrabold text-xs">🥉 3</span>}
                          {student.rank > 3 && <span className="font-extrabold text-muted-foreground">#{student.rank}</span>}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                            Lvl {student.level}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-primary">
                          {student.totalXP.toLocaleString()} XP
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`font-bold ${student.accuracy >= 85 ? "text-emerald-500" : "text-foreground"}`}>
                            {student.accuracy}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-orange-500">
                            <Flame className="w-3.5 h-3.5 fill-orange-500/20" /> {student.streak} Days
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-semibold text-muted-foreground">
                          {student.topSubject}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {student.rankChange > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500">
                              <ArrowUpRight className="w-4 h-4" /> +{student.rankChange}
                            </span>
                          ) : student.rankChange < 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-500">
                              <ArrowDownRight className="w-4 h-4" /> {student.rankChange}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-muted-foreground">
                              <Minus className="w-3.5 h-3.5" /> 0
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default LeaderboardPage;
