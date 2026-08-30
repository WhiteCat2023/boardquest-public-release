import { useEffect } from "react";
import rcAxios from "@/lib/axios";
import useRefreshToken from "./useRefreshToken";
import { useReviewCenterAuth } from "./useReviewCenterAuth";

export const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { user } = useReviewCenterAuth();

  useEffect(() => {
    const responseIntercept = rcAxios.interceptors.response.use(
      (response) => response,
      async (error: any) => {
        const prevRequest = error?.config;
        const isAuthRequest =
          prevRequest?.url?.includes("/auth/login") ||
          prevRequest?.url?.includes("/auth/me");

        if (
          error?.response?.status === 401 &&
          !prevRequest?._retry &&
          !isAuthRequest
        ) {
          prevRequest._retry = true;
          const refreshedUser = await refresh();
          if (refreshedUser) {
            return rcAxios(prevRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      rcAxios.interceptors.response.eject(responseIntercept);
    };
  }, [user, refresh]);

  return rcAxios;
};

export default useAxiosPrivate;
