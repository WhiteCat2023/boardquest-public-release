import { Link } from "react-router-dom";
import { Eye, Shield, Briefcase, Power, Clock, Lock } from "lucide-react";
import type { FacultyMember, RoleType } from "../types";
import { getRoleBadgeColor, isUserOnline } from "../utils/facultyUtils";
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
      <TableCell className="p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-border bg-muted">
              <AvatarFallback className="font-bold text-foreground uppercase text-xs bg-muted">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Online/Offline Status Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card transition-colors ${
                isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{member.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              ID: {member.employeeId}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Scope / Department */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 text-foreground text-xs font-semibold">
          <Briefcase size={13} className="text-muted-foreground" />
          <span className="capitalize">{member.department?.name || "General"}</span>
        </div>
      </TableCell>

      {/* Authority Role */}
      <TableCell className="p-4">
        <Badge
          variant="outline"
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getRoleBadgeColor(
            member.role
          )}`}
        >
          <Shield size={10} />
          {member.role === "TEAMLEAD" ? "CO-ADMIN" : member.role}
        </Badge>
      </TableCell>

      {/* Account Status Column */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Online / Offline Indicator Badge */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`} />
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {/* Account active status */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
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
      <TableCell className="p-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Clock size={12} className="text-muted-foreground/70" />
          {formatLastActive(member.lastActiveAt)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="p-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/faculty-management/view/${member.id}`}>
            <button
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-all cursor-pointer"
              title="View Faculty Details"
            >
              <Eye size={15} />
            </button>
          </Link>

          {canManage && !isSuperAdminAccount && (
            <button
              onClick={() => onToggleStatus(member.id, isAccountActive, member.name)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isAccountActive
                  ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                  : "text-amber-600 hover:text-emerald-600 hover:bg-emerald-500/10"
              }`}
              title={isAccountActive ? "Deactivate Account" : "Activate Account"}
            >
              <Power size={15} />
            </button>
          )}

          {canManage && isSuperAdminAccount && (
            <span
              className="p-2 text-muted-foreground/40 cursor-not-allowed"
              title="System Super Admin account is protected and cannot be deactivated or deleted."
            >
              <Lock size={15} />
            </span>
          )}

          {!canManage && (
            <span className="text-xs text-muted-foreground/40 font-semibold italic ml-2">Locked</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
