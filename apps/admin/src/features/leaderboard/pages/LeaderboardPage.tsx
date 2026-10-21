import { useState, useMemo, useEffect } from "react";
import { useStudents } from "@/features/students";
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";
import { Trophy, Sparkles, Flame, ShieldCheck } from "lucide-react";
import {
  LeaderboardHeader,
  LeaderboardPodium,
  LeaderboardToolbar,
  LeaderboardTable,
  LeaderboardEmptyState,
  LeaderboardLoadingState,
} from "../components";
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

  const categoryTabs: NavTabItem<LeaderboardCategory>[] = [
    {
      id: "overall",
      label: "Overall XP",
      icon: <Trophy size={14} className="text-amber-500" />,
    },
    {
      id: "accuracy",
      label: "Accuracy",
      icon: <Sparkles size={14} className="text-emerald-500" />,
    },
    {
      id: "streak",
      label: "Streaks",
      icon: <Flame size={14} className="text-orange-500" />,
    },
    {
      id: "mastery",
      label: "Subject Mastery",
      icon: <ShieldCheck size={14} className="text-blue-500" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full font-sans bg-background text-foreground">
      {/* ── Page Header ── */}
      <LeaderboardHeader />

      {/* ── Standardized Category Navigation Tabs ── */}
      <StandardNavTabs<LeaderboardCategory>
        tabs={categoryTabs}
        activeTab={category}
        onTabChange={(newCat) => setCategory(newCat)}
        showScrollButtons="auto"
        rightContent={
          filteredStudents.length > 0 ? (
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>Total Candidates:</span>
              <span className="text-foreground font-bold">
                {filteredStudents.length}
              </span>
            </div>
          ) : null
        }
      />

      {isLoading ? (
        <LeaderboardLoadingState />
      ) : (
        <>
          {/* ── Top 3 Podium Showcase (Only if 3+ candidates and no active search) ── */}
          {filteredStudents.length >= 3 && !searchTerm && (
            <LeaderboardPodium top1={top1} top2={top2} top3={top3} />
          )}

          {/* ── Unified Search & Filter Toolbar ── */}
          <LeaderboardToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            timeHorizon={timeHorizon}
            onTimeHorizonChange={setTimeHorizon}
          />

          {/* ── Main Rankings Table or Empty State ── */}
          {filteredStudents.length === 0 ? (
            <LeaderboardEmptyState
              searchTerm={searchTerm}
              onResetSearch={() => setSearchTerm("")}
            />
          ) : (
            <LeaderboardTable
              students={paginatedStudents}
              totalCount={filteredStudents.length}
              startIndex={startIndex}
              pageSize={pageSize}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default LeaderboardPage;
