import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
    const userRole = currentUser?.role;

    return (
      userRole && allowedRoles?.includes(userRole)
        ? <Outlet />
        : currentUser
          ? <Navigate to={"/unauthorized"} state={{ from: location }} replace />
          : <Navigate to={"/login"} state={{ from: location }} replace />
    );
}

export default RequireAuth;