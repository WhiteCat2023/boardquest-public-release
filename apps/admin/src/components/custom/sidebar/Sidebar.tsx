import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavItemProps, NavContentProps } from "@/types/sidebarMenuItems";
import useAuth from "@/hooks/useAuth";
import boardQuestIcon from "@/assets/baordquest-no-title.png";
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
  navItem: NavItemProps[];
  logout?: () => void;
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

  // Check if any sub-item is currently active (pathname + query search match)
  const isAnySubActive =
    hasSubItems &&
    content.subItems!.some(
      (sub) => location.pathname + location.search === sub.path,
    );

  const [isOpen, setIsOpen] = useState(isAnySubActive);

  // Sync open state with location changes
  useEffect(() => {
    if (isAnySubActive) {
      setIsOpen(true);
    }
  }, [location.pathname, location.search, isAnySubActive]);

  if (!hasSubItems) {
    const isActive =
      location.pathname === content.path ||
      (content.path === "/question-bank/shared-library" &&
        (location.pathname === "/question-bank" ||
          location.pathname === "/question-bank/"));
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

      {/* Sub-items block */}
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

function Sidebar({ navItem, logout: logoutProp }: SidebarContentProps) {
  const location = useLocation();
  const { auth, logout: authLogout } = useAuth();
  const logout = logoutProp || authLogout;

  const user = auth?.data?.user || auth?.user;
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@boardquest.edu.ph";
  const currentUserRole = user?.role;

  const getPortalTitle = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
        return "Super Admin Portal";
      case "DEAN":
        return "Dean Portal";
      case "TEAMLEAD":
        return "Team Lead Portal";
      case "TEACHER":
      default:
        return "Faculty Portal";
    }
  };

  const portalTitle = getPortalTitle(currentUserRole);

  return (
    <UISidebar
      collapsible="icon"
      className="font-sans bg-card text-foreground border-none"
    >
      <SidebarHeader className="p-2.5 pb-0.5 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-1 group-data-[collapsible=icon]:pt-2.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-1 py-1 rounded-lg hover:opacity-90 transition-opacity group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <img
            src={boardQuestIcon}
            alt="BoardQuest"
            className="size-7 object-contain shrink-0 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:mx-auto"
          />
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground leading-tight">
              BoardQuest
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight">
              {portalTitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2.5 gap-1.5 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-1">
        {navItem
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

      <SidebarFooter>
        <NavUser
          user={{
            name: userName,
            email: userEmail,
            avatar: user?.avatarUrl || "",
          }}
          logout={logout}
          accountPath="/profile-settings"
          notificationsPath="/notifications"
          settingsPath={
            ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(
              (currentUserRole || "").toUpperCase(),
            )
              ? "/settings"
              : undefined
          }
        />
      </SidebarFooter>
    </UISidebar>
  );
}

export default Sidebar;
