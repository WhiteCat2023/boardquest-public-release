import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default queryClient;
