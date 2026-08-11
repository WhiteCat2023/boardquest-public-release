import { Link } from "react-router-dom";
import { Eye, Shield, Briefcase, Power, Clock, Lock } from "lucide-react";
import type { FacultyMember } from "@/features/faculty";
import { getRoleBadgeColor, isUserOnline } from "@/features/faculty/utils/facultyUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";

interface FacultyTableRowProps {
  member: FacultyMember;
  canManage: boolean;
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void;
}

export default function FacultyTableRow({
  member,
  canManage,
  onToggleStatus,
}: FacultyTableRowProps) {
  const isAccountActive = member?.isActive !== false;
  const isOnline = isUserOnline(member?.lastActiveAt, member?.isActive);
  const isSuperAdminAccount =
    member?.role === "SUPERADMIN" ||
    member?.username === "superadmin" ||
    member?.employeeId === "SA-0001";

  const formatLastActive = (dateStr?: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 5) return "Active now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <TableRow className="hover:bg-accent/40 transition-colors group border-b border-border">
      {/* Profile */}
      <TableCell className="py-2 px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <Avatar className="h-7 w-7 border border-border bg-muted">
              <AvatarFallback className="font-bold text-foreground uppercase text-[10px] bg-muted">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Online/Offline Status Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card transition-colors ${
                isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate max-w-[160px]">
              {member.name}
            </span>
            <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-tight">
              ID: {member.employeeId}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Scope / Department */}
      {/* <TableCell className="py-2 px-3">
        <div className="flex items-center gap-1 text-foreground text-[11px] font-medium">
          <Briefcase size={12} className="text-muted-foreground shrink-0" />
          <span className="capitalize truncate max-w-[130px]">{member.department?.name || "General"}</span>
        </div>
      </TableCell> */}

      {/* Authority Role */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${getRoleBadgeColor(
            member.role
          )}`}
        >
          <Shield size={9} />
          {member.role === "TEAMLEAD" ? "CO-ADMIN" : member.role}
        </Badge>
      </TableCell>

      {/* Account Status Column */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Online / Offline Indicator Badge */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`} />
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {/* Account active status */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
              isAccountActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {isAccountActive ? "Active" : "Deactivated"}
          </Badge>
        </div>
      </TableCell>

      {/* Last Activity Column */}
      <TableCell className="hidden sm:table-cell py-2 px-3">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Clock size={11} className="text-muted-foreground/70 shrink-0" />
          {formatLastActive(member.lastActiveAt)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-2 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/faculty-management/view/${member.id}`}>
            <button
              className="size-7 p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-all cursor-pointer flex items-center justify-center"
              title="View Faculty Details"
            >
              <Eye size={14} />
            </button>
          </Link>

          {canManage && !isSuperAdminAccount && (
            <button
              onClick={() => onToggleStatus(member.id, isAccountActive, member.name)}
              className={`size-7 p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                isAccountActive
                  ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                  : "text-amber-600 hover:text-emerald-600 hover:bg-emerald-500/10"
              }`}
              title={isAccountActive ? "Deactivate Account" : "Activate Account"}
            >
              <Power size={14} />
            </button>
          )}

          {canManage && isSuperAdminAccount && (
            <span
              className="size-7 p-1 text-muted-foreground/40 cursor-not-allowed flex items-center justify-center"
              title="System Super Admin account is protected and cannot be deactivated or deleted."
            >
              <Lock size={14} />
            </span>
          )}

          {!canManage && (
            <span className="text-[10px] text-muted-foreground/40 font-semibold italic ml-1">Locked</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
