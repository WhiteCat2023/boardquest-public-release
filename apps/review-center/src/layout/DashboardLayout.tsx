import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/custom/sidebar/Sidebar";
import HeaderBreadcrumb from "@/components/custom/breadcrumb/HeaderBreadcrumb";
import UserProfileWidget from "@/components/custom/UserProfileWidget";

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-[80vw] bg-card border-r border-border z-50 h-full shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer z-50"
              aria-label="Close Sidebar"
            >
              <X className="size-4" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 w-full bg-background h-screen overflow-hidden p-0 md:p-2 md:ps-0 min-w-0">
        <div className="md:border md:border-border h-full md:rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0 min-w-0 bg-card">
          {/* Header Bar */}
          <header className="px-4 py-3 border-b bg-card border-border flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Open Sidebar"
              >
                <Menu className="size-5" />
              </button>
              <HeaderBreadcrumb />
            </div>
            <UserProfileWidget />
          </header>

          {/* Page Body */}
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto flex flex-col bg-background/50">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
