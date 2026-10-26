import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import type { NavItemProps, NavContentProps } from "@/types/sidebarMenuItems";
import useAuth from "@/hooks/useAuth";
import boardQuestIcon from "@/assets/baordquest-no-title.png";
import { Button } from "@/components/ui/button";
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
import { usePendingReviewCount, useMyPendingRevisionCount } from "@/features/question-bank";
import {
  useCalendarStore,
  CalendarSidebar,
} from "@/features/review-center/components/calendar";
import {
  useSystemSettingsStore,
  SystemSettingsSidebar,
} from "@/features/system-settings";
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
  badge,
  badgeTooltip,
}: {
  content: NavContentProps;
  location: any;
  badge?: number | string;
  badgeTooltip?: string;
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

  const itemBadge = badge ?? content.badge;
  const hasBadge =
    itemBadge !== undefined &&
    itemBadge !== null &&
    itemBadge !== 0 &&
    itemBadge !== "0";

  if (!hasSubItems) {
    const isCalendarItem = content.path === "/calendar-management";
    const { setShowCalendarSubSidebar } = useCalendarStore();

    const isActive =
      location.pathname === content.path ||
      (content.path === "/question-bank/shared-library" &&
        (location.pathname === "/question-bank" ||
          location.pathname === "/question-bank/"));

    const tooltipText =
      badgeTooltip ||
      (hasBadge && typeof itemBadge === "number"
        ? `${content.title} (${itemBadge} pending)`
        : content.title);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={tooltipText}
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
          <Link
            to={content.path}
            onClick={() => {
              handleLinkClick();
              if (isCalendarItem) {
                setShowCalendarSubSidebar(true);
              }
            }}
            className="flex items-center w-full min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0 flex items-center justify-center">
                <DynamicIcon name={content.icon} size={15} className="shrink-0" />
                {hasBadge && (
                  <span
                    className="hidden group-data-[collapsible=icon]:block absolute -top-1 -right-1 size-2 rounded-full bg-rose-500 ring-2 ring-card animate-pulse"
                    aria-label={tooltipText || `${itemBadge} pending`}
                  />
                )}
              </div>
              <span className="group-data-[collapsible=icon]:hidden truncate">
                {content.title}
              </span>
            </div>

            {isCalendarItem && (
              <ChevronRight
                size={14}
                className="ml-auto text-muted-foreground/60 shrink-0 group-data-[collapsible=icon]:hidden transition-transform group-hover:translate-x-0.5"
              />
            )}

            {hasBadge && (
              <div className="shrink-0 ml-auto pl-1.5 group-data-[collapsible=icon]:hidden">
                <span
                  className={`
                    inline-flex items-center justify-center h-4.5 min-w-4.5 px-1.5 rounded-full text-[10px] font-extrabold leading-none tracking-tight select-none
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400 border border-rose-500/30"
                    }
                  `}
                >
                  {typeof itemBadge === "number" && itemBadge > 999
                    ? "999+"
                    : itemBadge}
                </span>
              </div>
            )}
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
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0 flex items-center justify-center">
            <DynamicIcon name={content.icon} size={15} className="shrink-0" />
            {hasBadge && (
              <span
                className="hidden group-data-[collapsible=icon]:block absolute -top-1 -right-1 size-2 rounded-full bg-rose-500 ring-2 ring-card animate-pulse"
                aria-label={badgeTooltip || `${itemBadge} pending`}
              />
            )}
          </div>
          <span className="group-data-[collapsible=icon]:hidden truncate">
            {content.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 group-data-[collapsible=icon]:hidden">
          {hasBadge && (
            <span
              className={`
                inline-flex items-center justify-center h-4.5 min-w-4.5 px-1.5 rounded-full text-[10px] font-extrabold leading-none tracking-tight select-none
                ${
                  isParentActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400 border border-rose-500/30"
                }
              `}
            >
              {typeof itemBadge === "number" && itemBadge > 999
                ? "999+"
                : itemBadge}
            </span>
          )}
          <div className="text-muted-foreground/60 hover:text-foreground transition-colors shrink-0">
            {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </div>
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
  const currentUserId = user?.id || (auth as any)?.data?.id;
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@boardquest.edu.ph";
  const currentUserRole = user?.role;

  const isReviewerRole = ["superadmin", "dean", "teamlead"].includes(
    (currentUserRole || "").toLowerCase(),
  );

  const canManageCalendar = [
    "superadmin",
    "dean",
    "teamlead",
    "teacher",
  ].includes((currentUserRole || "").toLowerCase());

  const { totalQuestions, authorsCount } = usePendingReviewCount({
    enabled: isReviewerRole,
  });

  const { pendingRevisionCount } = useMyPendingRevisionCount(currentUserId);

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

  const isCalendarRoute =
    location.pathname === "/calendar-management" ||
    location.pathname.startsWith("/calendar");

  const { showCalendarSubSidebar, setShowCalendarSubSidebar } = useCalendarStore();
  const isShowingCalendarSubSidebar = isCalendarRoute && showCalendarSubSidebar;

  const isSystemSettingsRoute =
    location.pathname === "/system-settings" ||
    location.pathname.startsWith("/system-settings");

  const {
    settings,
    showSystemSettingsSubSidebar,
    setShowSystemSettingsSubSidebar,
    initTheme,
  } = useSystemSettingsStore();
  const isShowingSystemSettingsSubSidebar =
    isSystemSettingsRoute && showSystemSettingsSubSidebar;

  const currentLogo = settings.logoUrl || boardQuestIcon;
  const currentSystemName = settings.systemName || "BoardQuest";

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <UISidebar
      collapsible="icon"
      className="font-sans bg-card text-foreground border-none"
    >
      <SidebarHeader className="p-2.5 pb-2 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-1 group-data-[collapsible=icon]:pt-2.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-1 py-1 rounded-lg hover:opacity-90 transition-opacity group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <img
            src={currentLogo}
            alt={currentSystemName}
            className="size-7 object-contain shrink-0 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:mx-auto"
          />
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground leading-tight">
              {currentSystemName}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight">
              {portalTitle}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {isShowingCalendarSubSidebar ? (
        <>
          <SidebarContent className="px-2.5 py-2 overflow-y-auto group-data-[collapsible=icon]:hidden">
            <CalendarSidebar
              onBack={() => setShowCalendarSubSidebar(false)}
              canManage={canManageCalendar}
            />
          </SidebarContent>
          <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-3 gap-2">
            <button
              type="button"
              onClick={() => setShowCalendarSubSidebar(true)}
              className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer"
              title="Academic Calendar"
            >
              <LucideIcons.Calendar size={16} />
            </button>
          </div>
        </>
      ) : isShowingSystemSettingsSubSidebar ? (
        <>
          <SidebarContent className="px-2.5 py-2 overflow-y-auto group-data-[collapsible=icon]:hidden">
            <SystemSettingsSidebar
              onBack={() => setShowSystemSettingsSubSidebar(false)}
            />
          </SidebarContent>
          <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-3 gap-2">
            <button
              type="button"
              onClick={() => setShowSystemSettingsSubSidebar(true)}
              className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer"
              title="System Settings"
            >
              <LucideIcons.Sliders size={16} />
            </button>
          </div>
        </>
      ) : (
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
                      (content: NavContentProps, contentIndex: number) => {
                        const isReviewItem =
                          content.path === "/question-bank/review-questions" ||
                          content.path === "/question-bank/review" ||
                          (content.subItems &&
                            content.subItems.some(
                              (s) =>
                                s.path === "/question-bank/review-questions" ||
                                s.path === "/question-bank/review",
                            ));

                        const isMyQuestionsItem =
                          content.path === "/question-bank/my-questions" ||
                          (content.subItems &&
                            content.subItems.some(
                              (s) => s.path === "/question-bank/my-questions",
                            ));

                        let itemBadge = content.badge;
                        let itemTooltip: string | undefined = undefined;

                        if (isReviewItem) {
                          itemBadge = authorsCount;
                          if (authorsCount > 0) {
                            itemTooltip = `Review Questions (${authorsCount} ${authorsCount === 1 ? "author" : "authors"} • ${totalQuestions} ${totalQuestions === 1 ? "question" : "questions"} pending)`;
                          }
                        } else if (isMyQuestionsItem) {
                          itemBadge = pendingRevisionCount;
                          if (pendingRevisionCount > 0) {
                            itemTooltip = `My Questions (${pendingRevisionCount} ${pendingRevisionCount === 1 ? "question" : "questions"} pending revision)`;
                          }
                        }

                        return (
                          <SidebarItem
                            key={contentIndex}
                            content={content}
                            location={location}
                            badge={itemBadge}
                            badgeTooltip={itemTooltip}
                          />
                        );
                      },
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
        </SidebarContent>
      )}

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
            ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"].includes(
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
