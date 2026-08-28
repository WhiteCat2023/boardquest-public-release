import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RotateCcw,
  X,
  GraduationCap,
  UserPlus,
  BarChart2,
  Eye,
  Zap,
  MapPin,
  Calendar,
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
import { useStudents } from "@/features/students";
import { getStudentEarnedBadges } from "@/utils/badgeUtils";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterStudentsTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
}

export default function ReviewCenterStudentsTab({
  reviewCenter,
}: ReviewCenterStudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const { data, isLoading } = useStudents({
    search: searchTerm,
    level: selectedLevel !== "ALL" ? selectedLevel : undefined,
    location: reviewCenter?.location && reviewCenter.location !== "Philippines" ? reviewCenter.location : undefined,
  });

  const studentsList = data?.students || [];
  const total = studentsList.length;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLevel("ALL");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || selectedLevel !== "ALL";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            placeholder="Search students by name, email..."
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

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="h-9 w-[125px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4+">Level 4+</SelectItem>
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

          <Link to="/student-management/create">
            <Button
              size="sm"
              className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-3.5 shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={13} />
              Enroll Student
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Students Table ── */}
      <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
        {!isLoading && studentsList.length === 0 ? (
          <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
            <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
              <GraduationCap size={40} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center gap-1 max-w-sm">
              <p className="font-bold text-foreground text-sm tracking-tight">
                No Enrolled Students Found
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchTerm
                  ? `No students matching "${searchTerm}" found for ${reviewCenter?.companyName || "this review center"}.`
                  : `There are currently no students registered under ${reviewCenter?.companyName || "this institution"}.`}
              </p>
            </div>
            <Link to="/student-management/create" className="mt-2">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl h-8.5 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Enroll New Candidate</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Student Profile
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Progression Level & XP
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Badges Earned
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Location
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
                {studentsList.map((student, idx) => {
                  const badges = getStudentEarnedBadges(student);

                  return (
                    <TableRow
                      key={student.id || idx}
                      className="hover:bg-accent/40 transition-colors group border-b border-border"
                    >
                      {/* Student Profile */}
                      <TableCell className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
                            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
                              {student.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[150px]">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Level & XP */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold gap-1 px-2 py-0.5 rounded-full"
                          >
                            <Zap size={10} className="fill-amber-500 text-amber-500" />
                            Lvl {student.level || 1}
                          </Badge>
                          <span className="text-[11px] font-semibold text-foreground/80">
                            {student.xp || 0} XP
                          </span>
                        </div>
                      </TableCell>

                      {/* Badges Earned */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                          {badges.slice(0, 2).map((badge) => {
                            const IconComp = badge.icon;
                            return (
                              <span
                                key={badge.id}
                                title={`${badge.title}: ${badge.description}`}
                                className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.bgColor} ${badge.color} ${badge.borderColor}`}
                              >
                                <IconComp size={9} className="stroke-[2.5]" />
                                {badge.title}
                              </span>
                            );
                          })}
                          {badges.length > 2 && (
                            <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                              +{badges.length - 2}
                            </span>
                          )}
                          {badges.length === 0 && (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              No badges yet
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <MapPin size={11} className="text-muted-foreground/70 shrink-0" />
                          <span className="truncate max-w-[110px]">
                            {student.location || reviewCenter?.location || "Philippines"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Enrolled Date */}
                      <TableCell className="hidden sm:table-cell py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <Calendar size={11} className="text-muted-foreground/70 shrink-0" />
                          <span>{formatDate(student.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/analytics?studentId=${student.id}`}>
                            <button
                              className="size-7 p-1 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-center"
                              title="View Student Performance"
                            >
                              <BarChart2 size={14} />
                            </button>
                          </Link>
                          <Link to={`/student-management/${student.id}`}>
                            <button
                              className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
                              title="View Student Profile"
                            >
                              <Eye size={14} />
                            </button>
                          </Link>
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
