import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    return (

    (auth as any)?.data?.user?.role && allowedRoles?.includes((auth as any).data.user.role)
        ? <Outlet />
        : (auth as any)?.data?.user
          ? <Navigate to={"/unauthorized"} state={{ from: location }} replace />
          : <Navigate to={"/login"} state={{ from: location }} replace />
    );
}

export default RequireAuth;