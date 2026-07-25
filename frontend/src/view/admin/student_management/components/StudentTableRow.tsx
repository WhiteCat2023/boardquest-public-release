import { Link } from "react-router-dom";
import { Eye, MapPin, Calendar, Zap } from "lucide-react";
import type { Student } from "../hooks/useStudent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { getStudentEarnedBadges } from "@/utils/badgeUtils";

interface StudentTableRowProps {
  student: Student;
}

export default function StudentTableRow({ student }: StudentTableRowProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const badges = getStudentEarnedBadges(student);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <TableRow className="hover:bg-accent/40 transition-colors group border-b border-border">
      {/* Student Profile */}
      <TableCell className="p-4 px-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary">
            <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary uppercase">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
              {student.name}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {student.email}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Level & XP */}
      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold gap-1 px-2.5 py-0.5 rounded-full">
            <Zap size={11} className="fill-amber-500 text-amber-500" />
            Lvl {student.level || 1}
          </Badge>
          <span className="text-xs font-semibold text-foreground/80">
            {student.xp || 0} XP
          </span>
        </div>
      </TableCell>

      {/* Badges Earned */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 flex-wrap max-w-[220px]">
          {unlockedBadges.slice(0, 3).map((badge) => {
            const IconComp = badge.icon;
            return (
              <span
                key={badge.id}
                title={`${badge.title}: ${badge.description}`}
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bgColor} ${badge.color} ${badge.borderColor}`}
              >
                <IconComp size={10} className="stroke-[2.5]" />
                {badge.title}
              </span>
            );
          })}
          {unlockedBadges.length > 3 && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              +{unlockedBadges.length - 3}
            </span>
          )}
        </div>
      </TableCell>

      {/* Location */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <MapPin size={13} className="text-muted-foreground/70" />
          <span>{student.location || "Philippines"}</span>
        </div>
      </TableCell>

      {/* Date Joined */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Calendar size={13} className="text-muted-foreground/70" />
          <span>{formatDate(student.createdAt)}</span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="p-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/student-management/view/${student.id}`}>
            <button
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all cursor-pointer"
              title="View Student Profile"
            >
              <Eye size={15} />
            </button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
