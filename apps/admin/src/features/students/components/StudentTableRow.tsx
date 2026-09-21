import { Link } from "react-router-dom";
import { Eye, MapPin, Calendar, Zap, UserCheck } from "lucide-react";
import type { Student } from "@/features/students";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import useRoleFlags from "@/hooks/useRoleFlags";

interface StudentTableRowProps {
  student: Student & {
    avgAccuracy?: number;
    isFailing?: boolean;
    activeGuidance?: any;
  };
  onAssignGuidance?: (student: any) => void;
}

export default function StudentTableRow({
  student,
  onAssignGuidance,
}: StudentTableRowProps) {
  const { isAdminOrSuperAdmin, isTeamLead } = useRoleFlags();
  const canAssignGuidance = (isAdminOrSuperAdmin || isTeamLead) && !!onAssignGuidance;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <TableRow className="hover:bg-accent/40 transition-colors group border-b border-border">
      {/* Student Profile */}
      <TableCell className="py-2 px-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 border border-primary/20 bg-primary/10 text-primary shrink-0">
            <AvatarFallback className="font-bold text-[10px] bg-primary/10 text-primary uppercase">
              {student.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors truncate max-w-[140px]">
                {student.name}
              </span>
              {student.isFailing && (
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 rounded-full font-bold"
                >
                  At Risk
                </Badge>
              )}
              {student.activeGuidance && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold"
                >
                  Guided
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
              {student.email}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Progression Level */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold gap-1 px-2 py-0.5 rounded-full inline-flex items-center"
        >
          <Zap size={10} className="fill-amber-500 text-amber-500" />
          Lvl {student.level || 1}
        </Badge>
      </TableCell>

      {/* EXP */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <span className="text-[11px] font-bold text-foreground/80">
          {(student.xp || 0).toLocaleString()} XP
        </span>
      </TableCell>

      {/* Location */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <MapPin size={11} className="text-muted-foreground/70 shrink-0" />
          <span className="truncate max-w-[110px]">
            {student.location || "Philippines"}
          </span>
        </div>
      </TableCell>

      {/* Date Joined */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Calendar size={11} className="text-muted-foreground/70 shrink-0" />
          <span>{formatDate(student.createdAt)}</span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-2 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {canAssignGuidance && (
            <button
              type="button"
              onClick={() => onAssignGuidance(student)}
              className="hidden sm:inline-flex h-7 px-2 text-[10.5px] font-bold rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer items-center gap-1"
              title="Assign Guidance Advisor"
            >
              <UserCheck size={12} />
              Assign Guidance
            </button>
          )}
          <Link to={`/student-management/${student.id}`}>
            <button
              className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
              title="View Student Profile & Performance"
            >
              <Eye size={14} />
            </button>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
