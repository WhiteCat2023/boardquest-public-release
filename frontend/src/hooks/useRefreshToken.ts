
import { AxiosInstance } from "../utils/AxiosInstance";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await AxiosInstance.get("/auth/refresh");
    setAuth((prev) => {
      return { 
        ...prev, 
        data: {
          user: {
            ...prev?.data?.user,
            id: response.data.data.id,
            role: response.data.data.role
          }
        },
        accessToken: response.data.data.accessToken };
    });
    return response.data.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
