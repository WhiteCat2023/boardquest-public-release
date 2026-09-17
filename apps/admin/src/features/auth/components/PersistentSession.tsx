import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useRefreshToken from '@/hooks/useRefreshToken';
import useAuth from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

function PersistentSession() {
    const { auth, logout } = useAuth();
    const refresh = useRefreshToken();
    const hasUserId = Boolean(auth?.data?.user?.id || (auth as any)?.user?.id || (auth as any)?.id);
    const [isLoading, setIsLoading] = useState(!hasUserId);

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                const token = await refresh();
                if (!token && isMounted) {
                    await logout();
                }
            } catch (err) {
                console.error("Session refresh error:", err);
                if (isMounted) {
                    await logout();
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (!hasUserId) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, []); // Run once on session mount

    if (isLoading && !hasUserId) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground font-sans">
                <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" variant="default" />
                    <p className="text-xs font-semibold text-muted-foreground animate-pulse">Loading session...</p>
                </div>
            </div>
        );
    }

    return <Outlet />;
}

export default PersistentSession;