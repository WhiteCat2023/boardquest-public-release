import rcAxios from "@/lib/axios";

export const useRefreshToken = () => {
  const refresh = async () => {
    try {
      const res = await rcAxios.get("/auth/me");
      return res.data?.data?.user || res.data?.user || null;
    } catch (err) {
      console.warn("Review center session refresh error:", err);
      return null;
    }
  };

  return refresh;
};

export default useRefreshToken;
