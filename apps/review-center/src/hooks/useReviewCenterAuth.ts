import { useContext } from "react";
import {
  ReviewCenterAuthContext,
  type ReviewCenterAuthContextType,
} from "../context/AuthContext";

export function useReviewCenterAuth(): ReviewCenterAuthContextType {
  const context = useContext(ReviewCenterAuthContext);
  if (!context) {
    throw new Error(
      "useReviewCenterAuth must be used within a ReviewCenterAuthProvider",
    );
  }
  return context;
}

export default useReviewCenterAuth;
