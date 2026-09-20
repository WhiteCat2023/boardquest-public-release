import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Crown,
  Flame,
  Sparkles,
  Search,
  TrendingUp,
  Award,
  Medal,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  UserX,
  Loader2,
  X,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useStudents } from "@/features/students";
import LeaderboardHeader from "../components/LeaderboardHeader";
import type { LeaderboardStudent, LeaderboardCategory } from "../types/types";

export function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const [timeHorizon, setTimeHorizon] = useState<string>("all-time");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const { data: studentsData, isLoading } = useStudents({ search: searchTerm });
  const rawStudents = studentsData?.students || [];

  // Transform database students into leaderboard metrics
  const processedStudents: LeaderboardStudent[] = rawStudents.map((s: any) => {
    const exams = Array.isArray(s.examResults) ? s.examResults : [];
    const avgAccuracy =
      exams.length > 0
        ? Math.round(
            exams.reduce(
              (acc: number, curr: any) =>
                acc + (curr.accuracy || curr.score || 0),
              0
            ) / exams.length
          )
        : 0;

    const masteryList = Array.isArray(s.mastery) ? s.mastery : [];
    const masteredCount = masteryList.filter(
      (m: any) => (m.proficiency || 0) >= 75
    ).length;

    const sortedMastery = [...masteryList].sort(
      (a: any, b: any) => (b.proficiency || 0) - (a.proficiency || 0)
    );
    const topSubject = sortedMastery[0]?.subject || "General Review";

    const badgesCount = Array.isArray(s.achievements)
      ? s.achievements.length
      : 0;

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

  // Sort students based on active category (search filtering performed on backend)
  const filteredStudents = processedStudents
    .sort((a, b) => {
      if (category === "accuracy") return b.accuracy - a.accuracy;
      if (category === "streak") return b.streak - a.streak;
      if (category === "mastery")
        return b.masteredSubjectsCount - a.masteredSubjectsCount;
      return b.totalXP - a.totalXP;
    })
    .map((s, index) => ({ ...s, rank: index + 1 }));

  const top1 = filteredStudents[0];
  const top2 = filteredStudents[1];
  const top3 = filteredStudents[2];

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, timeHorizon, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, startIndex, pageSize]);

  // Generate visible page numbers for pagination buttons
  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* ── Page Header ── */}
      <LeaderboardHeader />

      {isLoading ? (
        <Card className="border-border p-16 flex flex-col items-center justify-center text-center gap-3 bg-card rounded-2xl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Fetching candidate standings from database...
          </p>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="border-border p-16 flex flex-col items-center justify-center text-center gap-3 bg-card rounded-2xl">
          <div className="p-3.5 rounded-3xl bg-muted/60 text-muted-foreground/60 border border-border">
            <UserX className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            No Candidate Rankings Available
          </h3>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            {searchTerm
              ? `No student matching "${searchTerm}" was found.`
              : "Enrolled student candidates will automatically appear on the live leaderboard as they complete evaluation quests."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              Reset Search
            </button>
          )}
        </Card>
      ) : (
        <>
          {/* ── Top 3 Podium Showcase (Only if 3+ candidates) ── */}
          {filteredStudents.length >= 3 && !searchTerm && (
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
          )}

          {/* ── Unified Redesigned Toolbar ── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 px-3 bg-card border border-border/80 rounded-2xl shadow-2xs">
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 bg-muted/50 p-1 border border-border/80 rounded-xl overflow-x-auto w-full lg:w-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setCategory("overall")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  category === "overall"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Trophy size={13} className="text-amber-500" />
                <span>Overall XP</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("accuracy")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  category === "accuracy"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles size={13} className="text-emerald-500" />
                <span>Accuracy</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("streak")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  category === "streak"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Flame size={13} className="text-orange-500" />
                <span>Streaks</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory("mastery")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  category === "mastery"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck size={13} className="text-blue-500" />
                <span>Subject Mastery</span>
              </button>
            </div>

            {/* Right Side: Search Input + Time Horizon Selector */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                <Input
                  type="text"
                  placeholder="Search candidate by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 h-9 bg-muted/30 border border-border/80 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger className="h-9 w-[125px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground shrink-0">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all-time">All-Time</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Main Rankings Table ── */}
          <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
            <CardHeader className="border-b border-border bg-muted/40 py-3 px-4">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Live Candidate Rankings Roster</span>
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  Showing{" "}
                  <strong className="text-foreground">
                    {filteredStudents.length > 0 ? startIndex + 1 : 0}
                  </strong>
                  -
                  <strong className="text-foreground">
                    {Math.min(startIndex + pageSize, filteredStudents.length)}
                  </strong>{" "}
                  of <strong className="text-foreground">{filteredStudents.length}</strong> candidate(s)
                </span>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Total XP</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4">Top Subject</th>
                    <th className="py-3 px-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedStudents.map((student) => {
                    const isTop3 = student.rank <= 3;

                    return (
                      <tr
                        key={student.id}
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
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ── */}
            {filteredStudents.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20 text-xs font-sans">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>
                    Page <strong className="text-foreground">{currentPage}</strong> of{" "}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>

                  {/* Rows per page selector */}
                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                    <span className="text-[11px] text-muted-foreground">Per page:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[68px] text-xs bg-background rounded-lg border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title="First Page"
                  >
                    <ChevronsLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Prev</span>
                  </Button>

                  {/* Dynamic Page Buttons */}
                  <div className="flex items-center gap-1 mx-1">
                    {visiblePages.map((page, idx) =>
                      page === "..." ? (
                        <span key={`dots-${idx}`} className="px-1 text-muted-foreground text-xs">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${page}`}
                          type="button"
                          onClick={() => setCurrentPage(Number(page))}
                          className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title="Last Page"
                  >
                    <ChevronsRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default LeaderboardPage;

