import { useReviewCenterAuth } from "./useReviewCenterAuth";

export const useAuth = () => {
  const authContext = useReviewCenterAuth();
  return {
    ...authContext,
    auth: {
      user: authContext.user,
      data: { user: authContext.user },
    },
    setAuth: () => {},
  };
};

export default useAuth;
