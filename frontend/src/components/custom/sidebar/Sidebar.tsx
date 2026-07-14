import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { LogOut } from 'lucide-react';
import type { NavItemProps, NavContentProps } from '@/utils/list/adminSiderbarMenuList';
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
} from "@/components/ui/sidebar"

type LucideIconName = keyof typeof LucideIcons;

function DynamicIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const IconComponent = LucideIcons[name as LucideIconName] as React.ElementType | undefined;
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
}

interface SidebarContentProps {
  navItem: NavItemProps[];
  logout?: () => void;
}

function Sidebar({ navItem, logout }: SidebarContentProps) {
  const location = useLocation();

  return (
    <UISidebar collapsible="icon" className="font-[Poppins] bg-white border-r border-gray-100">
      <SidebarHeader className="mb-6 p-5 pb-0 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:mb-4 group-data-[collapsible=icon]:pt-5">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight truncate group-data-[collapsible=icon]:hidden">
          Faculty Portal
        </h1>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center font-bold text-gray-800 tracking-tight">
          FP
        </div>
      </SidebarHeader>

      <SidebarContent className="px-5 gap-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:gap-2">
        {navItem.map((item: NavItemProps, index: number) => (
          <SidebarGroup key={index} className="p-0">
            <SidebarGroupLabel className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase px-2 bg-transparent group-data-[collapsible=icon]:z-[-1]">
              {item.sideBarCategoryName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2">
                {item.content.map((content: NavContentProps, contentIndex: number) => {
                  const isActive = location.pathname === content.path;
                  return (
                    <SidebarMenuItem key={contentIndex} >
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive} 
                        tooltip={content.title}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium z-10
                          transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center
                          ${isActive
                            ? '!bg-[#E9B0B0] !text-[#A70202]'
                            : '!text-gray-500 hover:!bg-gray-100 hover:!text-gray-800 hover:!text-[#A70202]'
                          }
                        `}
                      >
                        <Link to={content.path}>
                          <DynamicIcon name={content.icon} size={18} className="shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{content.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto px-5 pb-5 pt-4 border-t border-gray-100 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:border-t-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              tooltip="Logout"
              className="flex items-center gap-3 w-full px-3 py-2.5 h-auto rounded-xl text-sm font-medium !text-gray-500 hover:!bg-gray-100 hover:!text-gray-800 transition-all duration-150 group-data-[collapsible=icon]:justify-center"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
}

export default Sidebar;