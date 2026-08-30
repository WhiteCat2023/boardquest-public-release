import rcAxios from "@/lib/axios";

export const useRefreshToken = () => {
  const refresh = async () => {
    return rcAxios
      .get("/auth/refresh")
      .then((res) => {
        const userData = res.data?.data?.user || res.data?.user;
        const accessToken = res.data?.data?.accessToken;
        return { user: userData, accessToken };
      })
      .catch((err) => {
        console.error("Review center session refresh failed:", err);
        return null;
      });
  };

  return refresh;
};

export default useRefreshToken;
