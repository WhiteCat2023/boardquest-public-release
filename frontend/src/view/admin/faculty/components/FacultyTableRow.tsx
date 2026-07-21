import { Link } from "react-router-dom";
import { Eye, Trash2, Shield, Briefcase, Phone, Mail, Power, Clock, BookOpen } from "lucide-react";
import type { FacultyMember, RoleType } from "../types";
import { getRoleBadgeColor, isUserOnline } from "../utils/facultyUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";

interface FacultyTableRowProps {
  member: FacultyMember;
  canManage: boolean;
  onToggleStatus: (id: string, currentStatus: boolean, name: string) => void;
  onDelete: (id: string, name: string, role: RoleType) => void;
}

export default function FacultyTableRow({
  member,
  canManage,
  onToggleStatus,
  onDelete,
}: FacultyTableRowProps) {
  const isAccountActive = member.isActive !== false;
  const isOnline = isUserOnline(member.lastActiveAt, member.isActive);

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

  const handledCategories = member.handledCategories || [];

  return (
    <TableRow className="hover:bg-slate-50/30 transition-colors group border-b border-slate-100">
      {/* Profile */}
      <TableCell className="p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-slate-200 bg-slate-100">
              <AvatarFallback className="font-bold text-slate-600 uppercase text-xs bg-slate-100">
                {member.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Online/Offline Status Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white transition-colors ${
                isOnline ? "bg-emerald-500" : "bg-slate-300"
              }`}
              title={isOnline ? "Online Now" : "Offline"}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{member.name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              ID: {member.employeeId}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Contact Details */}
      <TableCell className="p-4">
        <div className="flex flex-col gap-0.5 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <Mail size={12} className="text-slate-400" /> {member.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={12} className="text-slate-400" /> {member.phoneNumber}
          </span>
        </div>
      </TableCell>

      {/* Scope / Department */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
          <Briefcase size={13} className="text-slate-400" />
          <span className="capitalize">{member.department?.name || "General"}</span>
        </div>
      </TableCell>

      {/* Handled Subjects / Categories */}
      <TableCell className="p-4">
        <div className="flex items-center gap-1 flex-wrap max-w-xs">
          {handledCategories.length > 0 ? (
            handledCategories.slice(0, 2).map((cat) => (
              <Badge
                key={cat.id}
                variant="outline"
                className="bg-indigo-50/70 text-indigo-700 border-indigo-200 text-[10px] font-bold py-0.5 px-2 rounded-md truncate max-w-[110px]"
                title={cat.name}
              >
                <BookOpen size={10} className="mr-1 shrink-0 inline" />
                <span className="truncate">{cat.name}</span>
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">Unassigned</span>
          )}
          {handledCategories.length > 2 && (
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold py-0.5 px-1.5 rounded-md"
              title={handledCategories.slice(2).map((c) => c.name).join(", ")}
            >
              +{handledCategories.length - 2} more
            </Badge>
          )}
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
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {/* Account active status */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isAccountActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isAccountActive ? "Active" : "Deactivated"}
          </Badge>
        </div>
      </TableCell>

      {/* Last Activity Column */}
      <TableCell className="p-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Clock size={12} className="text-slate-400" />
          {formatLastActive(member.lastActiveAt)}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="p-4 px-6 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/faculty-management/view/${member.id}`}>
            <button
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              title="View Faculty Details"
            >
              <Eye size={15} />
            </button>
          </Link>

          {canManage && (
            <button
              onClick={() => onToggleStatus(member.id, isAccountActive, member.name)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isAccountActive
                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                  : "text-amber-600 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title={isAccountActive ? "Deactivate Account" : "Activate Account"}
            >
              <Power size={15} />
            </button>
          )}

          {canManage ? (
            <button
              onClick={() => onDelete(member.id, member.name, member.role)}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title="Delete Faculty Account"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <span className="text-xs text-slate-300 font-semibold italic ml-2">Locked</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
