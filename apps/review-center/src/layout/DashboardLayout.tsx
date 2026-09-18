import { Outlet } from "react-router-dom";
import Sidebar from "@/components/custom/sidebar/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import HeaderBreadcrumb from "@/components/custom/breadcrumb/HeaderBreadcrumb";

export function DashboardLayout() {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "240px" } as React.CSSProperties}
    >
      <Sidebar />

      <main className="flex flex-col flex-1 w-full bg-background h-screen overflow-hidden p-0 md:p-2 md:ps-0">
        <div className="px-4 py-2 bg-card border-border flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-4">
              <div className="h-4 w-px bg-border" />
              <HeaderBreadcrumb />
            </div>
          </div>
        </div>
        <div className="md:border md:border-border h-full rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 min-w-0 bg-background">
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto flex flex-col p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export default DashboardLayout;
