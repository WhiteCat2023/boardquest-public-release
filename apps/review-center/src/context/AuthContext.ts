import { createContext } from "react";

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

export interface ReviewCenterAuthContextType {
  user: ReviewCenterUser | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isError: boolean;
  errorMessage: string | null;
}

export const ReviewCenterAuthContext = createContext<ReviewCenterAuthContextType | undefined>(undefined);
