import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Settings, Zap, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Student } from "../../types/types";

interface StudentProfileHeaderProps {
  student: Student;
  leaderboardRank?: number;
  onOpenScorecard?: () => void;
  onOpenFormula?: () => void;
  onAssignGuidance?: () => void;
}

export function StudentProfileHeader({
  student,
  leaderboardRank = 1,
  onOpenScorecard,
  onOpenFormula,
  onAssignGuidance,
}: StudentProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2.5">
      {/* Back to directory button */}
      <button
        onClick={() => navigate("/student-management")}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={14} />
        <span>Back to Student Directory</span>
      </button>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        {/* Left Side: Avatar, Name, Level & Leaderboard Rank */}
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-border shadow-xs bg-muted text-foreground">
            <AvatarFallback className="font-extrabold text-base sm:text-lg bg-primary/10 text-primary uppercase">
              {(student.name || "ST").slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            {/* Name + Level & Leaderboard Rank Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {student.name}
              </h1>

              {/* Student Level Badge */}
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs"
              >
                <Zap size={12} className="fill-amber-500 text-amber-500" />
                <span>Level {student.level || 1}</span>
              </Badge>

              {/* Leaderboard Rank Badge */}
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs"
              >
                <Trophy size={12} className="text-indigo-500 fill-indigo-500/20" />
                <span>Rank #{leaderboardRank} in Leaderboards</span>
              </Badge>

              {/* Total XP Badge */}
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
              >
                <Sparkles size={11} className="text-purple-500" />
                <span>{(student.xp || 0).toLocaleString()} Total XP</span>
              </Badge>
            </div>

            {/* Subtitle: Candidate details, Rank & Level info */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>{student.email}</span>
              <span>&bull;</span>
              <span className="font-semibold text-foreground/80">Level {student.level || 1} Aspirant</span>
              <span>&bull;</span>
              <span className="text-primary font-bold">Rank #{leaderboardRank} on Leaderboards</span>
              {student.location && (
                <>
                  <span>&bull;</span>
                  <span>{student.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {/* Info / Print Scorecard button (ⓘ) */}
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenScorecard}
            className="size-9 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted shadow-2xs cursor-pointer"
            title="Official Candidate Performance Scorecard"
          >
            <Info size={16} />
          </Button>

          {/* Manage / Point Formula button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFormula}
            className="h-9 px-3 text-xs font-bold rounded-xl border-border text-foreground hover:bg-muted shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Settings size={14} className="text-muted-foreground" />
            <span>Point Formula</span>
          </Button>

          {/* Primary Action Button (⚡ Assign Guidance / Intervene) */}
          <Button
            size="sm"
            onClick={onAssignGuidance}
            className="h-9 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Zap size={14} className="fill-current text-primary-foreground" />
            <span>Assign Guidance</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
