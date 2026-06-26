import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function DashboardLayout() {
  return (
    <div className='flex'>
        <div className='sticky w-80'>
            <Sidebar />
        </div>
        
        <Outlet />
    </div>
  )
}

export default DashboardLayout