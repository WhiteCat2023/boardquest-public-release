import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth';
import { adminNavItem } from '../utils/list/adminSiderbarMenuList';
import { teacherNavItem } from '../utils/list/teacherSidebarMenulist';
import { teamLeadNavItem } from '../utils/list/teamLeadSidebarMenuList';
import { superAdminNavItem } from '../utils/list/superAdminSidebarMenuList';
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import type { AuthContextType } from '../context/AuthProvider';

const sidebarMenuMap: Record<string, any[]> = {
  superadmin: superAdminNavItem,
  admin: adminNavItem,
  teacher: teacherNavItem,
  teamlead: teamLeadNavItem,
};

function DashboardLayout() {
    const { auth, logout } = useAuth();
    const currentNavItems = sidebarMenuMap[auth?.data?.user?.role?.toLowerCase() as string] || [];

    return (
      <SidebarProvider style={{ '--sidebar-width': '300px' } as React.CSSProperties}>
        <Sidebar navItem={currentNavItems} logout={logout} />
        <main className="flex flex-col flex-1 w-full bg-slate-50 min-h-screen">
          <div className="p-4 border-b bg-white border-slate-100 flex items-center">
            <SidebarTrigger />
          </div>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    )
}

export default DashboardLayout