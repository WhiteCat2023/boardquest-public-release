
import { AxiosInstance } from "../utils/AxiosInstance";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    return AxiosInstance.get("/auth/refresh").then((res) => {
      setAuth((prev) => {
        return { 
          ...prev, 
          data: {
            user: {
              ...prev?.data?.user,
              id: res.data.data.id,
              role: res.data.data.role
            }
          }, 
          accessToken: res.data.data.accessToken 
        };
      });
      return res.data.data.accessToken;
    }).catch((err) => {
      console.log(err);
      return;
    });
  };
  return refresh;
};

export default useRefreshToken;
