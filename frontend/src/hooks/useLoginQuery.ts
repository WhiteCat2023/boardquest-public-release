import { useQuery } from "@tanstack/react-query";
import AxiosInstance from "@/utils/AxiosInstance";
type LoginRequest = any;

const Login = (inputs: LoginRequest) => useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
        const response = await AxiosInstance.post("/auth/login", inputs);
        return response.data;
    }
});

export default Login;