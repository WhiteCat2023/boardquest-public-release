import useAuth from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';

const normalizeRole = (role?: any): string => {
  if (!role) return '';
  const s = String(role).toUpperCase().trim();
  if (s === 'SUPERADMIN') return 'SUPERADMIN';
  if (s === 'DEAN') return 'DEAN';
  if (s === 'TEAMLEAD') return 'TEAMLEAD';
  if (s === 'TEACHER') return 'TEACHER';
  return s;
};

const RequireAuth = ({ allowedRoles }: { allowedRoles: (string | number)[] }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const currentUser = auth?.data?.user || auth?.user;
    const userRole = currentUser?.role;

    const isSuperAdmin = normalizeRole(userRole) === 'SUPERADMIN';
    const isAllowed = isSuperAdmin || Boolean(userRole && allowedRoles?.some((allowed) => {
      if (allowed === userRole || String(allowed) === String(userRole)) return true;
      return normalizeRole(allowed) === normalizeRole(userRole);
    }));

    return (
      isAllowed
        ? <Outlet />
        : currentUser
          ? <Navigate to={"/unauthorized"} state={{ from: location }} replace />
          : <Navigate to={"/login"} state={{ from: location }} replace />
    );
}

export default RequireAuth;