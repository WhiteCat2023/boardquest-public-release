import { createContext, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
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
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    try {
      if (auth && (auth.accessToken || auth.data?.user?.id || auth.user?.id)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to sync auth state to localStorage:", e);
    }
  }, [auth]);

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
      const validateLoginInput = ValidateLoginInput(userData);
      if (!validateLoginInput.success) {
        return console.error("Login failed:", validateLoginInput.error.flatten().fieldErrors);
      }
      const response = await loginMutation.mutateAsync(userData);
      setAuth(response);
      console.log("Login successful:", response);
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Login failed:", error?.response?.data?.message || error);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuth({});
      localStorage.removeItem(AUTH_STORAGE_KEY);
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
