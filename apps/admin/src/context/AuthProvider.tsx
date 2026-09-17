import { createContext, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosInstance } from "@/utils/AxiosInstance";
import { queryClient } from "@/main";
import { type LoginRequest } from "@/types/types";
import { ValidateLoginInput } from "../utils/ValidateInput";

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  [key: string]: unknown;
}

export interface AuthState {
  data?: {
    user?: AuthUser;
    [key: string]: unknown;
  };
  user?: AuthUser;
  accessToken?: string;
  [key: string]: unknown;
}

export type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  login: (userData: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginMutation: any;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_STORAGE_KEY = "bq_auth_session";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // In-memory auth state only - not persisted to localStorage for security
  const [auth, setAuth] = useState<AuthState>({});

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Clean up any legacy localStorage session on mount
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await AxiosInstance.post("/auth/login", credentials);
      return response.data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await AxiosInstance.post("/auth/logout");
      return response.data;
    },
  });

  const login = async (userData: LoginRequest) => {
    try {
      const validateLoginInput = ValidateLoginInput(userData);
      if (!validateLoginInput.success) {
        return console.error("Login failed:", validateLoginInput.error.flatten().fieldErrors);
      }
      const response = await loginMutation.mutateAsync(userData);
      const rawData = response?.data || response;
      const user = rawData?.user || rawData;

      setAuth({
        ...response,
        data: {
          ...rawData,
          user,
        },
        user,
        accessToken: rawData?.accessToken || response?.accessToken,
      });

      console.log("Login successful:", response);
      navigate(from === "/login" ? "/" : from, { replace: true });
    } catch (error: any) {
      console.error("Login failed:", error?.response?.data?.message || error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuth({});
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loginMutation }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
