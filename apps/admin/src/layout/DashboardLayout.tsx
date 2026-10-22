import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/custom/sidebar/Sidebar";
import useAuth from "../hooks/useAuth";
import { adminNavItem } from "../utils/menu-list/adminSiderbarMenuList";
import { teacherNavItem } from "../utils/menu-list/teacherSidebarMenulist";
import { teamLeadNavItem } from "../utils/menu-list/teamLeadSidebarMenuList";
import { superAdminNavItem } from "../utils/menu-list/superAdminSidebarMenuList";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import HeaderBreadcrumb from "../components/custom/breadcrumb/HeaderBreadcrumb";
import { NotificationDropdown } from "@/features/notifications";
import { SystemSearchBar } from "../components/custom/search/SystemSearchBar";
import usePusherNotifications from "../hooks/usePusherNotifications";
import { FirstLoginDialog } from "@/features/auth";
import { useCalendarStore } from "@/features/review-center/components/calendar";

const sidebarMenuMap: Record<string, any[]> = {
  superadmin: superAdminNavItem,
  dean: adminNavItem,
  teacher: teacherNavItem,
  teamlead: teamLeadNavItem,
};

function DashboardLayout() {
  usePusherNotifications();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const currentUser = auth?.data?.user || auth?.user;
  const userRole = currentUser?.role?.toLowerCase();
  const currentNavItems = sidebarMenuMap[userRole as string] || [];

  const isCalendarRoute =
    location.pathname === "/calendar-management" ||
    location.pathname.startsWith("/calendar");
  const { showCalendarSubSidebar } = useCalendarStore();
  const isShowingCalendarSubSidebar = isCalendarRoute && showCalendarSubSidebar;

  const sidebarWidth = "250px";

  return (
    <SidebarProvider
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      <Sidebar navItem={currentNavItems} logout={logout} />

      <main className="flex flex-col flex-1 w-full bg-background h-screen overflow-hidden p-0 md:p-2 md:ps-0">
        <div className="h-10 sm:h-11 px-3 bg-background border-border/70 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2.5">
              <div className="h-3.5 w-px bg-border/80" />
              <HeaderBreadcrumb />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SystemSearchBar />
            <NotificationDropdown />
          </div>
        </div>
        <div className="md:border md:border-border h-full rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 min-w-0 bg-background">
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto flex flex-col">
            <Outlet />
          </div>
        </div>
      </main>
      <FirstLoginDialog />
    </SidebarProvider>
  );
}

export default DashboardLayout;
