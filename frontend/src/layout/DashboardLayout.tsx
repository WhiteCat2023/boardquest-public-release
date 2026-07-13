import { Outlet } from 'react-router-dom'
import Sidebar from '../components/custom/sidebar/Sidebar'
import useAuth from '../hooks/useAuth';
import { adminNavItem } from '../utils/list/adminSiderbarMenuList';
import { teacherNavItem } from '../utils/list/teacherSidebarMenulist';
import { teamLeadNavItem } from '../utils/list/teamLeadSidebarMenuList';
import { superAdminNavItem } from '../utils/list/superAdminSidebarMenuList';
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
    const currentNavItems = sidebarMenuMap[auth?.data?.user?.role?.toLowerCase() as string] || [];

    return (
      <SidebarProvider style={{ '--sidebar-width': '300px' } as React.CSSProperties}>
        <Sidebar navItem={currentNavItems} logout={logout} />
        <main className="flex flex-col flex-1 w-full bg-slate-50 min-h-screen">
          <div className="p-4 border-b bg-white border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-slate-200" />
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