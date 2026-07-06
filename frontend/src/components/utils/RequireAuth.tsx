import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    return (

    auth?.data?.user?.role && allowedRoles?.includes(auth.data.user.role)
        ? <Outlet />
        : auth?.data?.user
          ? <Navigate to={"/unauthorized"} state={{ from: location }} replace />
          : <Navigate to={"/login"} state={{ from: location }} replace />
    );
}

export default RequireAuth;