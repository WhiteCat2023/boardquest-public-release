import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavItemProps, NavContentProps } from "@/types/sidebarMenuItems";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

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
      (content.path === "/question-bank/my-questions" &&
        (location.pathname === "/question-bank" || location.pathname === "/question-bank/"));
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={content.title}
          className={`
            flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium z-10
            transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2
            ${
              isActive
                ? "!bg-[#E9B0B0] !text-[#A70202] dark:!bg-primary/20 dark:!text-primary font-bold dark:border dark:border-primary/30 shadow-2xs"
                : "!text-gray-600 hover:!bg-gray-100 hover:!text-[#A70202] dark:!text-sidebar-foreground/70 dark:hover:!bg-sidebar-accent dark:hover:!text-primary"
            }
          `}
        >
          <Link to={content.path} onClick={handleLinkClick}>
            <DynamicIcon name={content.icon} size={16} className="shrink-0" />
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
          flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer
          transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2
          ${
            isParentActive
              ? "bg-slate-100/80 text-gray-800 font-semibold dark:bg-sidebar-accent dark:text-sidebar-accent-foreground"
              : "!text-gray-600 hover:!bg-gray-100 hover:!text-[#A70202] dark:!text-sidebar-foreground/70 dark:hover:!bg-sidebar-accent dark:hover:!text-primary"
          }
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <DynamicIcon name={content.icon} size={16} className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden truncate">
            {content.title}
          </span>
        </div>
        <div className="group-data-[collapsible=icon]:hidden text-gray-400 hover:text-gray-600 dark:text-sidebar-foreground/50 dark:hover:text-sidebar-foreground transition-colors shrink-0">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </SidebarMenuButton>

      {/* Sub-items block */}
      {isOpen && (
        <div className="pl-3 mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 dark:border-sidebar-border ml-4 group-data-[collapsible=icon]:hidden animate-in slide-in-from-top-1 duration-150">
          {content.subItems!.map((sub, idx) => {
            const isSubActive =
              location.pathname + location.search === sub.path;
            return (
              <Link
                key={idx}
                to={sub.path}
                onClick={handleLinkClick}
                className={`
                  text-[11px] sm:text-xs py-1.5 px-2.5 rounded-md font-medium transition-all duration-150 truncate
                  ${
                    isSubActive
                      ? "text-[#A70202] bg-[#E9B0B0]/40 font-semibold dark:text-primary dark:bg-primary/20 dark:border dark:border-primary/30"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-sidebar-foreground/70 dark:hover:text-sidebar-foreground dark:hover:bg-sidebar-accent"
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

function Sidebar({ navItem }: SidebarContentProps) {
  const location = useLocation();
  const { auth } = useAuth();
  const currentUserRole = auth?.data?.user?.role || auth?.user?.role;

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

  const getPortalInitials = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "SUPERADMIN":
        return "SAP";
      case "DEAN":
        return "DP";
      case "TEAMLEAD":
        return "TLP";
      case "TEACHER":
      default:
        return "FP";
    }
  };

  const portalTitle = getPortalTitle(currentUserRole);
  const portalInitials = getPortalInitials(currentUserRole);

  return (
    <UISidebar
      collapsible="icon"
      className="font-sans bg-white dark:bg-sidebar text-gray-800 dark:text-sidebar-foreground border-r border-gray-100 dark:border-sidebar-border"
    >
      <SidebarHeader className="mb-3 p-3.5 pb-0 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:pt-3">
        <h1 className="text-sm sm:text-base font-bold text-gray-800 dark:text-sidebar-foreground tracking-tight truncate group-data-[collapsible=icon]:hidden">
          {portalTitle}
        </h1>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center font-bold text-xs bg-accent text-foreground rounded-md size-8 mx-auto">
          {portalInitials}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-3.5 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:gap-2">
        {navItem
          .filter(
            (item: NavItemProps) => item.content && item.content.length > 0,
          )
          .map((item: NavItemProps, index: number) => (
            <SidebarGroup key={index} className="p-0">
              <SidebarGroupLabel className="text-[10px] font-semibold text-gray-400 dark:text-sidebar-foreground/50 tracking-wider uppercase px-2 py-0.5 bg-transparent group-data-[collapsible=icon]:hidden">
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
    </UISidebar>
  );
}

export default Sidebar;
