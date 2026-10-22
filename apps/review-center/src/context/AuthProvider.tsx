import { useState, useEffect, type ReactNode } from "react";
import { isAxiosError } from "axios";
import rcAxios from "../lib/axios";
import { ReviewCenterAuthContext, type ReviewCenterUser, type UpdateProfilePayload } from "./AuthContext";

export function ReviewCenterAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<ReviewCenterUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const res = await rcAxios.get("/auth/me");
        const userData = res.data?.data?.user || res.data?.user;
        if (isMounted) {
          setUser(userData || null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
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
    } catch (err: unknown) {
      setIsError(true);
      let msg = "Failed to log in to Review Center portal";
      if (isAxiosError(err)) {
        msg =
          (err.response?.data as { message?: string } | undefined)?.message ||
          err.message ||
          msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      setErrorMessage(msg);
      throw new Error(msg, { cause: err });
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

  const updateProfile = async (data: UpdateProfilePayload) => {
    try {
      const res = await rcAxios.put("/auth/profile", data);
      const updatedUser = res.data?.data?.user || res.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        return updatedUser;
      }
      throw new Error("Invalid response from server");
    } catch (err: unknown) {
      let msg = "Failed to update profile";
      if (isAxiosError(err)) {
        msg =
          (err.response?.data as { message?: string } | undefined)?.message ||
          err.message ||
          msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      throw new Error(msg, { cause: err });
    }
  };

  return (
    <ReviewCenterAuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        logout,
        updateProfile,
        isError,
        errorMessage,
      }}
    >
      {children}
    </ReviewCenterAuthContext.Provider>
  );
}

export default ReviewCenterAuthProvider;
