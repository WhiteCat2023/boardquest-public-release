import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/custom/sidebar/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import HeaderBreadcrumb from "@/components/custom/breadcrumb/HeaderBreadcrumb";
import { SystemSearchBar } from "@/components/custom/search/SystemSearchBar";
import { NotificationDropdown } from "@/features/notifications";
import { FirstLoginDialog } from "@/features/auth";
import useNotificationStream from "@/hooks/useNotificationStream";

export function DashboardLayout() {
  useNotificationStream();
  const location = useLocation();

  const isCalendarRoute =
    location.pathname === "/calendar" ||
    location.pathname === "/schedules" ||
    location.pathname.startsWith("/calendar") ||
    location.pathname.startsWith("/schedules");

  const sidebarWidth = "240px";

  return (
    <SidebarProvider
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      <Sidebar />

      <main className="flex flex-col flex-1 w-full bg-background h-screen overflow-hidden p-0 md:p-2 md:ps-0">
        <div className="h-10 sm:h-11 px-3 bg-card border-border flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2.5">
              <Separator orientation="vertical" className="h-3.5 bg-border/80" />
              <HeaderBreadcrumb />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SystemSearchBar />
            <NotificationDropdown />
          </div>
        </div>
        <div className="md:border md:border-border h-full rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 min-w-0 bg-background">
          <div
            className={`flex-1 min-h-0 min-w-0 flex flex-col ${
              isCalendarRoute
                ? "overflow-hidden"
                : "overflow-y-auto p-3 sm:p-4 md:p-5"
            }`}
          >
            <Outlet />
          </div>
        </div>
      </main>

      <FirstLoginDialog />
    </SidebarProvider>
  );
}

export default DashboardLayout;
