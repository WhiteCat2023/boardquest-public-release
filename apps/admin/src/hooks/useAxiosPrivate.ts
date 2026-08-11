import { AxiosInstance } from "@/utils/AxiosInstance";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "@/hooks/useAuth";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = AxiosInstance.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] =
            `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    const responseIntercept = AxiosInstance.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        const prevRequest = error?.config;
        const isAuthRequest =
          prevRequest?.url?.includes("/auth/login") ||
          prevRequest?.url?.includes("/auth/refresh");

        if (
          error?.response?.status === 401 &&
          !prevRequest?.sent &&
          !isAuthRequest
        ) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          if (newAccessToken) {
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return AxiosInstance(prevRequest);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      AxiosInstance.interceptors.request.eject(requestIntercept);
      AxiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return AxiosInstance;
};

export default useAxiosPrivate;
