import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { User, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserProfileWidget() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const user = (auth as any)?.data?.user;
  const userName = user?.name || "User Name";
  const userEmail = user?.email || "user@example.com";
  const userRole = user?.role || "USER";

  const initials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toUpperCase()) {
      case "SUPERADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ADMIN":
        return "bg-red-50 text-[#A70202] border-red-200";
      case "TEAMLEAD":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TEACHER":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-1.5 px-2.5 rounded-2xl hover:bg-slate-100/80 transition-all duration-150 outline-hidden group cursor-pointer focus:ring-2 focus:ring-[#A70202]/10 border border-transparent hover:border-slate-200">
          <div className="flex flex-col items-end hidden sm:flex text-right">
            <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#A70202] transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              {userEmail}
            </span>
          </div>

          <Avatar className="h-9 w-9 border border-slate-200 shadow-2xs group-hover:border-[#A70202]/30 transition-colors">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-red-50 text-[#A70202] font-extrabold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl animate-in fade-in-80 slide-in-from-top-2 duration-150"
      >
        {/* User Details Header */}
        <DropdownMenuLabel className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl mb-1 flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-slate-200 bg-red-50 text-[#A70202] shrink-0">
            <AvatarFallback className="font-extrabold text-xs bg-[#A70202]/10 text-[#A70202]">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate leading-snug">
              {userName}
            </span>
            <span className="text-[11px] text-slate-400 truncate leading-none mb-1.5">
              {userEmail}
            </span>
            <Badge
              variant="outline"
              className={`w-fit text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${getRoleBadgeStyle(userRole)}`}
            >
              {userRole}
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        {/* Menu Items */}
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => navigate("/profile-settings")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#A70202] hover:bg-red-50/70 transition-colors cursor-pointer"
          >
            <User size={15} className="text-slate-400 group-hover:text-[#A70202]" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          {["SUPERADMIN", "ADMIN", "TEAMLEAD"].includes(userRole.toUpperCase()) && (
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#A70202] hover:bg-red-50/70 transition-colors cursor-pointer"
            >
              <Settings size={15} className="text-slate-400" />
              <span>System Settings</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/90 transition-colors cursor-pointer"
        >
          <LogOut size={15} className="text-red-500" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
