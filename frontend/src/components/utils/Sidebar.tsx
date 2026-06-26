import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

function Sidebar() {
    const navItem = [
        {
            title: "Dashboard",
            path: "/"
        }
    ]

    
    
  return (
    <div className='bg-slate-300 h-screen w-full flex flex-col gap-4 p-4'>
        <h1 className='text-xl font-bold mb-8'>Faculty Portal</h1>

        {navItem.map((item, index) => (
            <Link key={index} to={item.path} className='text-slate-700 hover:text-slate-900 hover:bg-slate-300 p-2 rounded-md'>
                {item.title}
            </Link> 
        ))}

       <LogoutButton />
    </div>
  )
}

export default Sidebar