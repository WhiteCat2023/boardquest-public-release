import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { auth }= useAuth();
    const location = useLocation();

    return (
      // auth?.data?.roles?.find((role: string) => allowedRoles?.includes(role))
      //     ? <Outlet />
      //     : auth?.user
      //         ? <Navigate to="/unauthorized" state={{ from: location }} replace />
      //         : <Navigate to="/login" state={{ from: location }} replace />

    //   auth?.data?.user?.role?.find((role: string) => allowedRoles?.includes(role)) 
    auth?.data?.user?.role && allowedRoles?.includes(auth.data.user.role)
        ? <Outlet />
        : <Navigate to="/home" state={{ from: location }} replace />
    );
}

export default RequireAuth;