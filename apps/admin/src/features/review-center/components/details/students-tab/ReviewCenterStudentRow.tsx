import { Link } from "react-router-dom";
import { GraduationCap, Eye, Zap, Gamepad2, Calendar } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReviewCenterCandidateItem } from "../../../api/useReviewCenter";
import { formatEnrolledDate } from "./studentsTabTypes";

interface ReviewCenterStudentRowProps {
  candidate: ReviewCenterCandidateItem;
  onSelectCandidateForScores: (candidate: ReviewCenterCandidateItem) => void;
}

export default function ReviewCenterStudentRow({
  candidate,
  onSelectCandidateForScores,
}: ReviewCenterStudentRowProps) {
  const isPlayingGame = Boolean(
    candidate.studentId || candidate.studentDetails
  );
  const details = candidate.studentDetails;

  return (
    <TableRow className="hover:bg-accent/40 transition-colors group border-b border-border">
      {/* Candidate Profile */}
      <TableCell className="py-2.5 px-4">
        <button
          type="button"
          onClick={() => onSelectCandidateForScores(candidate)}
          className="flex items-center gap-2.5 text-left cursor-pointer group/cand w-fit"
          title="Click to view Review Center scores & transcript"
        >
          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0 group-hover/cand:scale-105 transition-transform">
            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
              {candidate.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground text-xs group-hover/cand:text-primary transition-colors truncate max-w-[170px]">
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
        </button>
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
              <Zap size={10} className="fill-amber-500 text-amber-500" />
              Lvl {details.level || 1}
            </Badge>
            <span className="text-[11px] font-semibold text-foreground/80">
              {details.xp || 0} XP
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Gamepad2 size={12} className="text-muted-foreground/50 shrink-0" />
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
          <Calendar size={11} className="text-muted-foreground/70 shrink-0" />
          <span>
            {formatEnrolledDate(candidate.enrolledAt || candidate.createdAt)}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-2.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCandidateForScores(candidate)}
            className="h-7 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg gap-1.5 cursor-pointer"
            title="View Review Center Scores & Transcript"
          >
            <GraduationCap size={13} />
            <span>Scores</span>
          </Button>

          {candidate.studentId ? (
            <Link to={`/student-management/${candidate.studentId}`}>
              <button
                className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
                title="View BoardQuest Game Profile & Progress"
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
}
