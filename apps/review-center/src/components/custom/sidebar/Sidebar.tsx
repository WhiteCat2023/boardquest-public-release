import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  reviewCenterNavItem,
} from "@/utils/menu-list/reviewCenterSidebarMenuList";
import type { NavItemProps, NavContentProps } from "@/types/sidebarMenuItems";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import boardQuestLogo from "@/assets/baordquest-no-title.png";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

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

interface SidebarContentProps {
  navItems?: NavItemProps[];
  navItem?: NavItemProps[];
}

function SidebarItem({
  content,
  location,
}: {
  content: NavContentProps;
  location: any;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const hasSubItems = !!content.subItems && content.subItems.length > 0;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isAnySubActive =
    hasSubItems &&
    content.subItems!.some(
      (sub) => location.pathname + location.search === sub.path,
    );

  const [isOpen, setIsOpen] = useState(isAnySubActive);

  useEffect(() => {
    if (isAnySubActive) {
      setIsOpen(true);
    }
  }, [location.pathname, location.search, isAnySubActive]);

  if (!hasSubItems) {
    const isActive =
      location.pathname === content.path ||
      (content.path !== "/dashboard" &&
        content.path !== "/" &&
        location.pathname.startsWith(content.path));

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={content.title}
          className={`
            flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold z-10
            transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2
            ${
              isActive
                ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-2xs dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }
          `}
        >
          <Link to={content.path} onClick={handleLinkClick}>
            <DynamicIcon name={content.icon} size={15} className="shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden truncate">
              {content.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const isParentActive = location.pathname === content.path || isAnySubActive;

  return (
    <SidebarMenuItem className="flex flex-col w-full">
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip={content.title}
        className={`
          flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer
          transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2
          ${
            isParentActive
              ? "bg-muted/70 text-foreground font-bold"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <DynamicIcon name={content.icon} size={15} className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden truncate">
            {content.title}
          </span>
        </div>
        <div className="group-data-[collapsible=icon]:hidden text-muted-foreground/60 hover:text-foreground transition-colors shrink-0">
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </div>
      </SidebarMenuButton>

      {isOpen && (
        <div className="pl-2.5 mt-0.5 flex flex-col gap-0.5 border-l border-border/80 ml-3.5 group-data-[collapsible=icon]:hidden animate-in slide-in-from-top-1 duration-150">
          {content.subItems!.map((sub, idx) => {
            const isSubActive =
              location.pathname + location.search === sub.path;
            return (
              <Link
                key={idx}
                to={sub.path}
                onClick={handleLinkClick}
                className={`
                  text-[11px] py-1 px-2 rounded-md font-semibold transition-all duration-150 truncate
                  ${
                    isSubActive
                      ? "text-primary bg-primary/10 font-bold border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      )}
    </SidebarMenuItem>
  );
}

export function Sidebar({
  navItems = reviewCenterNavItem,
  navItem,
}: SidebarContentProps) {
  const items = navItem || navItems;
  const location = useLocation();
  const { user, logout } = useReviewCenterAuth();

  return (
    <UISidebar
      collapsible="icon"
      className="font-sans bg-card text-foreground border-none"
    >
      {/* ── 1. Brand Header ── */}
      <SidebarHeader className="p-2.5 pb-0.5 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-1 group-data-[collapsible=icon]:pt-2.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-1 py-1 rounded-lg hover:opacity-90 transition-opacity group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <img
            src={boardQuestLogo}
            alt="BoardQuest"
            className="size-7 object-contain shrink-0 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:mx-auto"
          />
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground leading-tight">
              BoardQuest
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight">
              Review Center Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── 2. Navigation Content ── */}
      <SidebarContent className="px-2.5 gap-1.5 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-1">
        {items
          .filter(
            (item: NavItemProps) => item.content && item.content.length > 0,
          )
          .map((item: NavItemProps, index: number) => (
            <SidebarGroup key={index} className="p-0">
              <SidebarGroupLabel className="text-[9.5px] font-bold text-muted-foreground/60 tracking-wider uppercase px-2 py-0.5 bg-transparent group-data-[collapsible=icon]:hidden">
                {item.sideBarCategoryName}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:gap-1">
                  {item.content.map(
                    (content: NavContentProps, contentIndex: number) => (
                      <SidebarItem
                        key={contentIndex}
                        content={content}
                        location={location}
                      />
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>

      {/* ── 3. Bottom User Profile (NavUser) ── */}
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Representative",
            email: user?.email || "rep@reviewcenter.edu.ph",
            avatar: (user as any)?.avatarUrl || "",
          }}
          logout={logout}
          accountPath="/settings"
          settingsPath="/settings"
        />
      </SidebarFooter>
    </UISidebar>
  );
}

export default Sidebar;
