import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { LeaderboardStudent } from "../types/types";
import LeaderboardTableRow from "./LeaderboardTableRow";
import LeaderboardPagination from "./LeaderboardPagination";

interface LeaderboardTableProps {
  students: LeaderboardStudent[];
  totalCount: number;
  startIndex: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function LeaderboardTable({
  students,
  totalCount,
  startIndex,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: LeaderboardTableProps) {
  const showingStart = totalCount > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(startIndex + pageSize, totalCount);

  return (
    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
      <CardHeader className="border-b border-border bg-muted/40 py-3 px-4">
        <CardTitle className="text-xs sm:text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Live Candidate Rankings Roster</span>
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            Showing <strong className="text-foreground">{showingStart}</strong>-
            <strong className="text-foreground">{showingEnd}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> candidate(s)
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
            {students.map((student) => (
              <LeaderboardTableRow key={student.id} student={student} />
            ))}
          </tbody>
        </table>
      </div>

      {totalCount > 0 && (
        <LeaderboardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Card>
  );
}
