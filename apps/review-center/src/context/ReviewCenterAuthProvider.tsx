import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import rcAxios from "../lib/axios";

export interface ReviewCenterUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  companyName: string;
  phonenumber?: string;
  location?: string;
  role: "REVIEW_CENTER_REPRESENTATIVE";
  reviewCenterId?: string;
  reviewCenter?: {
    id: string;
    name: string;
    location?: string;
  };
}

interface ReviewCenterAuthContextType {
  user: ReviewCenterUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isError: boolean;
  errorMessage: string | null;
}

const ReviewCenterAuthContext = createContext<ReviewCenterAuthContextType | undefined>(undefined);

export function ReviewCenterAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ReviewCenterUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await rcAxios.get("/auth/me");
      const userData = res.data?.data?.user || res.data?.user;
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      const res = await rcAxios.post("/auth/login", credentials);
      const userData = res.data?.data?.user || res.data?.user;
      
      if (userData) {
        setUser(userData);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setIsError(true);
      const msg = err.response?.data?.message || err.message || "Failed to log in to Review Center portal";
      setErrorMessage(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await rcAxios.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <ReviewCenterAuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isError,
        errorMessage,
      }}
    >
      {children}
    </ReviewCenterAuthContext.Provider>
  );
}

export function useReviewCenterAuth() {
  const context = useContext(ReviewCenterAuthContext);
  if (!context) {
    throw new Error("useReviewCenterAuth must be used within a ReviewCenterAuthProvider");
  }
  return context;
}
