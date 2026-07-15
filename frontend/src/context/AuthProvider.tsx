import { createContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { type LoginRequest } from "@/types/types";
import { ValidateLoginInput } from "../utils/ValidateInput";

export type AuthContextType = {
  auth: object;
  setAuth: React.Dispatch<React.SetStateAction<object>>;
  login: (userData: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginMutation: ReturnType<typeof useMutation>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const axiosPrivate = useAxiosPrivate();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await axiosPrivate.post("/auth/login", credentials);
      return response.data;
    },
  });

  const logoutMutation = useMutation({
      mutationFn: async () => {
      const response = await axiosPrivate.post("/auth/logout");
      return response.data;
      }
  });

  const login = async (userData: LoginRequest) => {
    try {
      const validateLoginInput = ValidateLoginInput(userData)
      if (!validateLoginInput.success) {
        return console.error("Login failed:", validateLoginInput.error.flatten().fieldErrors);
      }
      const response = await loginMutation.mutateAsync(userData);
      setAuth(response);
      console.log("Login successful:", response);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login failed:", error?.response?.data?.message || error);
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loginMutation }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
