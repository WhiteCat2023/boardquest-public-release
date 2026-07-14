import { Link, useLocation, Outlet } from "react-router-dom"
import { UserCircle, Settings as SettingsIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../components/ui/sidebar"

function SettingLayout() {
  const location = useLocation();

  return (
    <SidebarProvider style={{ '--sidebar-width': '260px' } as React.CSSProperties}>
      <div className="flex w-full min-h-[calc(100vh-4.1rem)]">
        {/* Local Page-Level Settings Sidebar */}
        <Sidebar className="border-r border-slate-100 bg-white" collapsible="none">
          <SidebarContent className="px-4 py-6 gap-6">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase px-2 mb-2 bg-transparent">
                Settings
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === "/profile-settings"}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium z-10 h-auto w-full
                        transition-all duration-155
                        ${location.pathname === "/profile-settings"
                          ? '!bg-[#E9B0B0]/20 border border-[#E9B0B0]/30 !text-[#A70202]'
                          : '!text-gray-500 hover:!bg-gray-50 hover:!text-gray-700'
                        }
                      `}
                    >
                      <Link to="/profile-settings">
                        <UserCircle size={18} className="shrink-0 text-[#A70202]" />
                        <span>Profile Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === "/settings"}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium z-10 h-auto w-full
                        transition-all duration-155
                        ${location.pathname === "/settings"
                          ? '!bg-[#E9B0B0]/20 border border-[#E9B0B0]/30 !text-[#A70202]'
                          : '!text-gray-500 hover:!bg-gray-50 hover:!text-gray-700'
                        }
                      `}
                    >
                      <Link to="/settings">
                        <SettingsIcon size={18} className="shrink-0 text-[#A70202]" />
                        <span>System Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Settings Views Content */}
        <div className="flex-1 p-8 bg-slate-50/50">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default SettingLayout