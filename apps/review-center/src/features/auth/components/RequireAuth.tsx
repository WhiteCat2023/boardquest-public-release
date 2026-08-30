import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { Loader2 } from "lucide-react";

const normalizeRole = (role?: unknown): string => {
  if (!role) return "";
  return String(role).toUpperCase().trim();
};

export interface RequireAuthProps {
  allowedRoles?: (string | number)[];
}

export const RequireAuth = ({ allowedRoles }: RequireAuthProps) => {
  const { user, isLoading } = useReviewCenterAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-3 font-sans">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Verifying Review Center Credentials...
        </p>
      </div>
    );
  }

  const userRole = user?.role;

  const isAllowed =
    !allowedRoles || allowedRoles.length === 0
      ? Boolean(user)
      : Boolean(
          userRole &&
            allowedRoles.some((allowed) => {
              if (allowed === userRole || String(allowed) === String(userRole)) {
                return true;
              }
              return normalizeRole(allowed) === normalizeRole(userRole);
            })
        );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
