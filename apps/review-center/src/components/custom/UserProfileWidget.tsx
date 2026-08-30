import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Mail, Building2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

export function UserProfileWidget() {
  const { user, logout } = useReviewCenterAuth();
  const navigate = useNavigate();

  const userName = user?.name || "Representative";
  const userEmail = user?.email || "rc@boardquest.edu";
  const companyName = user?.companyName || user?.reviewCenter?.name || "Review Center";

  const initials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "RC";

  return (
    <div className="flex items-center gap-3 font-sans">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 p-1.5 px-2.5 rounded-2xl hover:bg-accent transition-all duration-150 outline-hidden group cursor-pointer border border-transparent hover:border-border font-sans">
            <div className="flex flex-col items-end hidden sm:flex text-right">
              <span className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {user?.employeeId || "RC-REPRESENTATIVE"}
              </span>
            </div>

            <Avatar className="size-8 transition-transform group-hover:scale-105 border-primary/20">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-2 shadow-xl rounded-2xl" align="end">
          <DropdownMenuLabel className="p-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate">
                  {userName}
                </span>
                <Badge variant="outline" className="text-[8.5px] border-primary/30 bg-primary/10 text-primary">
                  REPRESENTATIVE
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1">
                <Mail className="size-3 text-primary shrink-0" /> {userEmail}
              </span>
              <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <Building2 className="size-3 text-primary shrink-0" /> {companyName}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2.5 text-xs py-2 px-2.5 rounded-xl cursor-pointer"
          >
            <User className="size-3.5 text-muted-foreground" />
            <span>Profile & Organization</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2.5 text-xs py-2 px-2.5 rounded-xl cursor-pointer"
          >
            <Settings className="size-3.5 text-muted-foreground" />
            <span>Portal Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={logout}
            className="flex items-center gap-2.5 text-xs py-2 px-2.5 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer font-bold"
          >
            <LogOut className="size-3.5 text-destructive" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserProfileWidget;
