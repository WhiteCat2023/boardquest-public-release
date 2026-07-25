import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
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
import appContent from "../locales/en.appcontent.json";

export default function UserProfileWidget() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const user = (auth as any)?.data?.user;
  const userName = user?.name || appContent.superadmin.name;
  const userEmail = user?.email || appContent.superadmin.email;
  const userRole = user?.role || appContent.superadmin.role;

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
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "ADMIN":
        return "bg-primary/10 text-primary border-primary/20";
      case "TEAMLEAD":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "TEACHER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-1.5 px-2.5 rounded-2xl hover:bg-accent transition-all duration-150 outline-hidden group cursor-pointer focus:ring-2 focus:ring-ring/20 border border-transparent hover:border-border font-sans">
          <div className="flex flex-col items-end hidden sm:flex text-right">
            <span className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {userName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
              {userEmail}
            </span>
          </div>

          <Avatar className="h-9 w-9 border border-border shadow-2xs group-hover:border-primary/30 transition-colors bg-muted">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-popover rounded-2xl border border-border shadow-xl animate-in fade-in-80 slide-in-from-top-2 duration-150 font-sans text-popover-foreground"
      >
        {/* User Details Header */}
        <DropdownMenuLabel className="p-3 bg-muted/50 border border-border rounded-xl mb-1 flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-border bg-primary/10 text-primary shrink-0">
            <AvatarFallback className="font-extrabold text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-bold text-foreground truncate leading-snug">
              {userName}
            </span>
            <span className="text-[11px] text-muted-foreground truncate leading-none mb-1.5">
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

        <DropdownMenuSeparator className="my-1.5 bg-border" />

        {/* Menu Items */}
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem
            onClick={() => navigate("/profile-settings")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors cursor-pointer"
          >
            <User size={15} className="text-muted-foreground group-hover:text-primary" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          {["SUPERADMIN", "ADMIN", "TEAMLEAD"].includes(userRole.toUpperCase()) && (
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors cursor-pointer"
            >
              <Settings size={15} className="text-muted-foreground" />
              <span>System Settings</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-border" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut size={15} className="text-destructive" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
