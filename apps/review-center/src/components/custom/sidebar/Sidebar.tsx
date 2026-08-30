import { NavLink, useLocation } from "react-router-dom";
import { LogOut, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewCenterNavItems, type NavItem } from "@/utils/menu-list/reviewCenterSidebarMenuList";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

interface SidebarProps {
  navItems?: NavItem[];
}

export function Sidebar({ navItems = reviewCenterNavItems }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useReviewCenterAuth();

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col shrink-0 font-sans select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center gap-3 shrink-0">
        <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-md">
          BQ
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-foreground tracking-tight">BOARDQUEST</span>
            <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-md">
              RC
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold truncate">
            Review Center Portal
          </span>
        </div>
      </div>

      {/* Partner Center Info Badge */}
      <div className="px-3.5 pt-4 pb-2 shrink-0">
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground truncate">
              {user?.companyName || user?.reviewCenter?.name || "Partner Center"}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              ID: {user?.employeeId || "RC-PARTNER"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-extrabold uppercase text-muted-foreground/70 tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.url ||
            (item.url !== "/dashboard" && location.pathname.startsWith(item.url));

          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
