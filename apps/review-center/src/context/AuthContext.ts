import { createContext } from "react";

export interface ReviewCenterUser {
  id: string;
  employeeId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName: string;
  phonenumber?: string;
  location?: string;
  role: "REVIEW_CENTER_REPRESENTATIVE";
  mustChangePassword?: boolean;
  termsAcceptedAt?: string | Date | null;
  reviewCenterId?: string;
  reviewCenter?: {
    id: string;
    name: string;
    location?: string;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  phonenumber?: string;
  companyName?: string;
  location?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ReviewCenterAuthContextType {
  user: ReviewCenterUser | null;
  setUser: React.Dispatch<React.SetStateAction<ReviewCenterUser | null>>;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<ReviewCenterUser>;
  isError: boolean;
  errorMessage: string | null;
}

export const ReviewCenterAuthContext = createContext<ReviewCenterAuthContextType | undefined>(undefined);
