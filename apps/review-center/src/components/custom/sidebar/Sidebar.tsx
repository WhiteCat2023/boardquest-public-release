import { useState, useEffect, useRef } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  ChevronsUpDown,
  LogOut,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  reviewCenterNavItem,
} from "@/utils/menu-list/reviewCenterSidebarMenuList";
import type { NavItemProps, NavContentProps } from "@/types/sidebarMenuItems";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import boardQuestLogo from "@/assets/baordquest-no-title.png";

type LucideIconName = keyof typeof LucideIcons;

function DynamicIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = LucideIcons[name as LucideIconName] as
    | React.ElementType
    | undefined;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
}

interface SidebarProps {
  navItems?: NavItemProps[];
  isCollapsed?: boolean;
}

export function Sidebar({
  navItems = reviewCenterNavItem,
  isCollapsed = false,
}: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useReviewCenterAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RC";

  return (
    <aside
      className={cn(
        "h-screen bg-card text-foreground border-none flex flex-col shrink-0 font-sans select-none z-30 transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── 1. Brand Header ── */}
      <div className="h-16 px-4 border-none flex items-center justify-between shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity min-w-0"
        >
          <img
            src={boardQuestLogo}
            alt="BoardQuest"
            className="size-7 object-contain shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-foreground">
                  BOARDQUEST
                </span>
                <span className="text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-md shrink-0">
                  RC
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold truncate">
                Review Center Portal
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── 2. Navigation Content ── */}
      <div className="flex-1 px-2 py-3 overflow-y-auto space-y-3">
        {navItems.map((category: NavItemProps, catIdx: number) => (
          <div key={catIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase">
                {category.sideBarCategoryName}
              </div>
            )}

            <div className="space-y-0.5">
              {category.content.map(
                (item: NavContentProps, itemIdx: number) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/dashboard" &&
                      location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group cursor-pointer",
                        isActive
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )}
                    >
                      <DynamicIcon
                        name={item.icon}
                        size={16}
                        className={cn(
                          "shrink-0 transition-transform group-hover:scale-105",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. Bottom User Profile (NavUser) with Popover Menu ── */}
      <div className="p-2 border-none shrink-0 relative" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={cn(
            "w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent/80 transition-colors text-left group cursor-pointer",
            isUserMenuOpen ? "bg-accent text-foreground" : ""
          )}
        >
          <Avatar className="size-8 rounded-lg border border-border shrink-0">
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate leading-tight">
                {user?.name || "Representative"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate leading-tight">
                {user?.email || "rep@reviewcenter.edu.ph"}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <ChevronsUpDown className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
          )}
        </button>

        {/* ── Floating Popup Menu ── */}
        {isUserMenuOpen && (
          <div className="absolute bottom-16 left-2 right-2 w-[calc(100%-16px)] min-w-[220px] bg-card border border-border rounded-2xl shadow-2xl p-1.5 z-50 text-foreground font-sans animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Header User Card */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
              <Avatar className="size-8 rounded-lg border border-border shrink-0">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-foreground truncate">
                  {user?.name || "Representative"}
                </span>
                <span className="text-[10.5px] text-muted-foreground truncate">
                  {user?.email || "rep@reviewcenter.edu.ph"}
                </span>
              </div>
            </div>

            <div className="h-px bg-border my-1" />

            {/* Clean Menu Items */}
            <div className="space-y-0.5 text-xs font-medium">
              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
              >
                <ShieldCheck className="size-4" />
                <span>Account</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
              >
                <Bell className="size-4" />
                <span>Notifications</span>
              </Link>

              <div className="h-px bg-border my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer text-left"
              >
                <LogOut className="size-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
