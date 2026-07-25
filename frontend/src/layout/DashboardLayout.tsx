import { Outlet } from 'react-router-dom'
import Sidebar from '../components/custom/sidebar/Sidebar'
import useAuth from '../hooks/useAuth';
import { adminNavItem } from '../utils/menu-list/adminSiderbarMenuList';
import { teacherNavItem } from '../utils/menu-list/teacherSidebarMenulist';
import { teamLeadNavItem } from '../utils/menu-list/teamLeadSidebarMenuList';
import { superAdminNavItem } from '../utils/menu-list/superAdminSidebarMenuList';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import HeaderBreadcrumb from '../components/custom/breadcrumb/HeaderBreadcrumb';
import UserProfileWidget from '../components/UserProfileWidget';

const sidebarMenuMap: Record<string, any[]> = {
  superadmin: superAdminNavItem,
  admin: adminNavItem,
  teacher: teacherNavItem,
  teamlead: teamLeadNavItem,
};

function DashboardLayout() {
    const { auth, logout } = useAuth();
    const currentNavItems = sidebarMenuMap[(auth as any)?.data?.user?.role?.toLowerCase() as string] || [];

    return (
      <SidebarProvider style={{ '--sidebar-width': '300px' } as React.CSSProperties}>
        <Sidebar navItem={currentNavItems} logout={logout} />
        <main className="flex flex-col flex-1 w-full bg-background min-h-screen">
          <div className="p-4 border-b bg-card border-border flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <HeaderBreadcrumb />
            </div>
            <UserProfileWidget />
          </div>
          <div className="flex-1 overflow-auto ">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    )
}

export default DashboardLayout