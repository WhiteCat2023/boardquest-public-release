import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import type { NavItemProps, NavContentProps } from '@/types/sidebarMenuItems';
import { useState, useEffect } from 'react';
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

function SidebarItem({ content, location }: { content: NavContentProps; location: any }) {
  const hasSubItems = !!content.subItems && content.subItems.length > 0;
  
  // Check if any sub-item is currently active (pathname + query search match)
  const isAnySubActive = hasSubItems && content.subItems!.some(
    sub => location.pathname + location.search === sub.path
  );
  
  const [isOpen, setIsOpen] = useState(isAnySubActive);

  // Sync open state with location changes
  useEffect(() => {
    if (isAnySubActive) {
      setIsOpen(true);
    }
  }, [location.pathname, location.search, isAnySubActive]);

  if (!hasSubItems) {
    const isActive = location.pathname === content.path;
    return (
      <SidebarMenuItem>
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
  }

  const isParentActive = location.pathname === content.path || isAnySubActive;

  return (
    <SidebarMenuItem className="flex flex-col w-full">
      <SidebarMenuButton 
        onClick={() => setIsOpen(!isOpen)}
        tooltip={content.title}
        className={`
          flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer
          transition-all duration-150 w-full h-auto group-data-[collapsible=icon]:justify-center
          ${isParentActive
            ? 'bg-slate-100/80 text-gray-800 font-semibold'
            : '!text-gray-500 hover:!bg-gray-100 hover:!text-[#A70202]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <DynamicIcon name={content.icon} size={18} className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">{content.title}</span>
        </div>
        <div className="group-data-[collapsible=icon]:hidden text-gray-400 hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </SidebarMenuButton>

      {/* Sub-items block */}
      {isOpen && (
        <div className="pl-6 mt-1 flex flex-col gap-1 border-l border-slate-100 ml-5 group-data-[collapsible=icon]:hidden animate-in slide-in-from-top-1 duration-150">
          {content.subItems!.map((sub, idx) => {
            const isSubActive = location.pathname + location.search === sub.path;
            return (
              <Link
                key={idx}
                to={sub.path}
                className={`
                  text-xs py-1.5 px-3 rounded-lg font-medium transition-all duration-150
                  ${isSubActive
                    ? 'text-[#A70202] bg-[#E9B0B0]/40 font-semibold'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      )}
    </SidebarMenuItem>
  );
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
                {item.content.map((content: NavContentProps, contentIndex: number) => (
                  <SidebarItem 
                    key={contentIndex} 
                    content={content} 
                    location={location} 
                  />
                ))}
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