
import { AxiosInstance } from "../utils/AxiosInstance";
import useAuth from "@/hooks/useAuth";

// Module-level lock/promise to prevent multiple simultaneous refresh calls
let refreshPromise: Promise<string | null> | null = null;

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async (): Promise<string | null> => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const res = await AxiosInstance.get("/auth/refresh");
        const resData = res.data?.data;
        const user = resData?.user || {
          id: resData?.id,
          role: resData?.role,
          email: resData?.email,
        };
        const accessToken = resData?.accessToken;

        setAuth((prev) => ({
          ...prev,
          data: {
            ...prev?.data,
            user: {
              ...prev?.data?.user,
              ...user,
            },
          },
          user: {
            ...(prev?.user || {}),
            ...user,
          },
          accessToken,
        }));

        return accessToken || null;
      } catch (err) {
        setAuth({});
        try {
          localStorage.removeItem("bq_auth_session");
        } catch {
          // ignore
        }
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  return refresh;
};

export default useRefreshToken;
