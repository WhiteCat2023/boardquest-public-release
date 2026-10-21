import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import useRefreshToken from "@/hooks/useRefreshToken";
import { Spinner } from "@/components/ui/spinner";

export function RedirectIfAuthenticated() {
  const { auth } = useAuth();
  const refresh = useRefreshToken();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const target = from === "/login" ? "/" : from;

  const currentUser = auth?.data?.user || auth?.user;
  const hasUser = Boolean(
    currentUser?.id ||
      (currentUser as any)?._id ||
      (auth as any)?.id ||
      auth?.accessToken,
  );
  const [isChecking, setIsChecking] = useState(!hasUser);

  useEffect(() => {
    let isMounted = true;

    if (hasUser) {
      setIsChecking(false);
      return;
    }

    const verifyExistingSession = async () => {
      try {
        await refresh();
      } catch {
        // Not logged in or session expired
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyExistingSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking && !hasUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground font-sans">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" variant="default" />
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  const authenticated = Boolean(
    auth?.data?.user?.id ||
      (auth as any)?.user?.id ||
      (auth as any)?.id ||
      auth?.accessToken,
  );

  if (authenticated) {
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

export default RedirectIfAuthenticated;
