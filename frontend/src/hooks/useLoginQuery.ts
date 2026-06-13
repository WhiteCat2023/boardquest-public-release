import { useQuery } from "@tanstack/react-query";
import AxiosInstance from "@/utils/axiosInstance";
import type { LoginRequest } from "../utils/query/auth";

const Login = (inputs: LoginRequest) => useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
        const response = await AxiosInstance.post("/auth/login", inputs);
        return response.data;
    }
});

export default Login;