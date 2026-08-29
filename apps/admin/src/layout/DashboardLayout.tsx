import { Outlet } from "react-router-dom";
import Sidebar from "../components/custom/sidebar/Sidebar";
import useAuth from "../hooks/useAuth";
import { adminNavItem } from "../utils/menu-list/adminSiderbarMenuList";
import { teacherNavItem } from "../utils/menu-list/teacherSidebarMenulist";
import { teamLeadNavItem } from "../utils/menu-list/teamLeadSidebarMenuList";
import { superAdminNavItem } from "../utils/menu-list/superAdminSidebarMenuList";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import HeaderBreadcrumb from "../components/custom/breadcrumb/HeaderBreadcrumb";
import UserProfileWidget from "../components/UserProfileWidget";
import usePusherNotifications from "../hooks/usePusherNotifications";

const sidebarMenuMap: Record<string, any[]> = {
  superadmin: superAdminNavItem,
  dean: adminNavItem,
  teacher: teacherNavItem,
  teamlead: teamLeadNavItem,
};

function DashboardLayout() {
  usePusherNotifications();
  const { auth, logout } = useAuth();
  const currentUser = auth?.data?.user || auth?.user;
  const userRole = currentUser?.role?.toLowerCase();
  const currentNavItems = sidebarMenuMap[userRole as string] || [];

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "240px" } as React.CSSProperties}
    >
      <Sidebar navItem={currentNavItems} logout={logout} />
      <main className="flex flex-col flex-1 w-full bg-background h-screen overflow-hidden p-0 md:p-2 md:ps-0">
        <div className="md:border md:border-border h-full rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 min-w-0 bg-background">
          <div className="px-4 py-2 border-b bg-card border-border flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-4">
                <div className="h-4 w-px bg-border" />
                <HeaderBreadcrumb />
              </div>
            </div>
            <UserProfileWidget />
          </div>
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto flex flex-col">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
