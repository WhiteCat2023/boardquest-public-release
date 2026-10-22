import { useReviewCenterAuth } from "./useReviewCenterAuth";

export const useAuth = () => {
  const authContext = useReviewCenterAuth();

  const setAuth = (updater: any) => {
    if (typeof updater === "function") {
      authContext.setUser((prevUser) => {
        const dummyPrev = {
          user: prevUser,
          data: { user: prevUser },
        };
        const next = updater(dummyPrev);
        return next?.data?.user || next?.user || next || null;
      });
    } else {
      const nextUser = updater?.data?.user || updater?.user || updater || null;
      authContext.setUser(nextUser);
    }
  };

  return {
    ...authContext,
    auth: {
      user: authContext.user,
      data: { user: authContext.user },
    },
    setAuth,
  };
};

export default useAuth;
