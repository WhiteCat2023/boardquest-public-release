import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RotateCcw,
  X,
  GraduationCap,
  BarChart2,
  Eye,
  Zap,
  Calendar,
  Gamepad2,
  Tag,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useReviewCenterCandidates } from "../../api/useReviewCenter";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterStudentsTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
}

export default function ReviewCenterStudentsTab({
  reviewCenter,
}: ReviewCenterStudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("ALL");
  const [selectedGameStatus, setSelectedGameStatus] = useState<string>("ALL");

  const { data, isLoading } = useReviewCenterCandidates(reviewCenter?.id, {
    search: searchTerm,
    schoolYear: selectedSchoolYear !== "ALL" ? selectedSchoolYear : undefined,
  });

  const candidatesList = data?.candidates || [];
  const schoolYears = data?.schoolYears || [];

  // Filter candidates by game status if selected
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((c) => {
      if (selectedGameStatus === "REGISTERED") {
        return Boolean(c.studentId || c.studentDetails);
      }
      if (selectedGameStatus === "UNREGISTERED") {
        return !c.studentId && !c.studentDetails;
      }
      return true;
    });
  }, [candidatesList, selectedGameStatus]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSchoolYear("ALL");
    setSelectedGameStatus("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedSchoolYear !== "ALL" ||
    selectedGameStatus !== "ALL";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* ── Search & Filter Controls Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-2xs w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search enrolled candidates by name, email, ID..."
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* School Year Filter */}
          <Select
            value={selectedSchoolYear}
            onValueChange={setSelectedSchoolYear}
          >
            <SelectTrigger className="h-9 w-[140px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="All School Years" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All School Years</SelectItem>
              {schoolYears.map((sy) => (
                <SelectItem key={sy} value={sy} className="text-xs">
                  S.Y. {sy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Game Status Filter */}
          <Select
            value={selectedGameStatus}
            onValueChange={setSelectedGameStatus}
          >
            <SelectTrigger className="h-9 w-[145px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="Game Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Game Status</SelectItem>
              <SelectItem value="REGISTERED">Playing Game</SelectItem>
              <SelectItem value="UNREGISTERED">Not in Game Yet</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1 cursor-pointer px-2.5"
            >
              <RotateCcw size={12} />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Candidates Table ── */}
      <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
        {!isLoading && filteredCandidates.length === 0 ? (
          <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
            <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
              <GraduationCap size={40} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center gap-1 max-w-sm">
              <p className="font-bold text-foreground text-sm tracking-tight">
                No Enrolled Candidates Found
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchTerm
                  ? `No students matching "${searchTerm}" found for ${reviewCenter?.companyName || "this review center"}.`
                  : `There are currently no candidates enrolled under ${reviewCenter?.companyName || "this institution"}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Student Candidate
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    School Year
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    BoardQuest Game Status
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Enrollment Status
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Enrolled Date
                  </TableHead>
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredCandidates.map((candidate, idx) => {
                  const isPlayingGame = Boolean(
                    candidate.studentId || candidate.studentDetails
                  );
                  const details = candidate.studentDetails;

                  return (
                    <TableRow
                      key={candidate.id || idx}
                      className="hover:bg-accent/40 transition-colors group border-b border-border"
                    >
                      {/* Candidate Profile */}
                      <TableCell className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
                            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
                              {candidate.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[170px]">
                              {candidate.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate max-w-[170px]">
                              <span>{candidate.email}</span>
                              {candidate.schoolId && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-muted-foreground/80">
                                    {candidate.schoolId}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* School Year */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <Badge
                          variant="secondary"
                          className="bg-muted text-foreground/80 border-border text-[10px] font-bold"
                        >
                          S.Y. {candidate.schoolYear || "2026-2027"}
                        </Badge>
                      </TableCell>

                      {/* BoardQuest Game Status */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        {isPlayingGame && details ? (
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold gap-1 px-2 py-0.5 rounded-full"
                            >
                              <Zap
                                size={10}
                                className="fill-amber-500 text-amber-500"
                              />
                              Lvl {details.level || 1}
                            </Badge>
                            <span className="text-[11px] font-semibold text-foreground/80">
                              {details.xp || 0} XP
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Gamepad2
                              size={12}
                              className="text-muted-foreground/50 shrink-0"
                            />
                            <span className="text-[10.5px] font-medium italic">
                              Not in Game Yet
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Enrollment Status */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            candidate.status === "COMPLETED"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : candidate.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {candidate.status || "Enrolled"}
                        </Badge>
                      </TableCell>

                      {/* Enrolled Date */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <Calendar
                            size={11}
                            className="text-muted-foreground/70 shrink-0"
                          />
                          <span>
                            {formatDate(
                              candidate.enrolledAt || candidate.createdAt
                            )}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {candidate.studentId ? (
                            <Link
                              to={`/student-management/${candidate.studentId}`}
                            >
                              <button
                                className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
                                title="View Student Profile & Performance"
                              >
                                <Eye size={14} />
                              </button>
                            </Link>
                          ) : (
                            <span
                              className="text-[10px] font-medium text-muted-foreground/60 px-2 py-0.5 bg-muted/40 rounded border border-border/40"
                              title="Student has not registered a BoardQuest game account yet"
                            >
                              Unregistered
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
