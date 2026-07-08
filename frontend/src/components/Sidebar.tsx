import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { LogOut } from 'lucide-react';
// import useAuth from '../../hooks/useAuth';
// import { navItem } from '@/utils/list/adminSiderbarMenuList';
import type { NavItemProps, NavContentProps } from '@/utils/list/adminSiderbarMenuList';

type LucideIconName = keyof typeof LucideIcons;

function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const IconComponent = LucideIcons[name as LucideIconName] as React.ElementType | undefined;
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

interface SidebarContentProps {
  navItem: NavItemProps[];
  logout: () => void;
}

function Sidebar({ navItem, logout }: SidebarContentProps) {
  const location = useLocation();
  // const { logout } = useAuth();

  return (
    <div
      className="bg-white h-screen w-full flex flex-col p-5 font-[Poppins] border-r border-gray-100"
      style={{ width: '300px' }}
    >
      {/* Logo / App name */}
      <div className="mb-8">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">Faculty Portal</h1>
      </div>

      {/* Nav sections */}
      <nav className="flex flex-col gap-6 flex-1 overflow-y-auto">
        {navItem.map((item: NavItemProps, index: number) => (
          <div key={index} className="flex flex-col gap-1">
            {/* Category label */}
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1 px-2">
              {item.sideBarCategoryName}
            </p>

            {/* Nav links */}
            {item.content.map((content: NavContentProps, contentIndex: number) => {
              const isActive = location.pathname === content.path;
              return (
                <Link
                  key={contentIndex}
                  to={content.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 w-full
                    ${isActive
                      ? 'bg-[#E9B0B0] text-[#A70202]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                >
                  <span className={isActive ? 'text-gray' : 'text-gray-400'}>
                    <DynamicIcon name={content.icon} size={18} />
                  </span>
                  {content.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout pinned to bottom */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150"
        >
          <LogOut size={18} className="text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;