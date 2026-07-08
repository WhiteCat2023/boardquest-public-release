import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth';
import { navItem } from '../utils/list/adminSiderbarMenuList';

function DashboardLayout() {
    const { logout } = useAuth();
    return (
      <div className='flex'>
          <div className='sticky w-80'>
              <Sidebar navItem={navItem} logout={logout} />
          </div>
          
          <Outlet />
      </div>
  )
}

export default DashboardLayout