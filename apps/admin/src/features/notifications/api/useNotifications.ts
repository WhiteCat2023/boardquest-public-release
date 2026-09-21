import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import type { NotificationItem } from "../types/types";

export interface UseNotificationsParams {
  unreadOnly?: boolean;
  search?: string;
  type?: string;
  limit?: number;
  skip?: number;
}

export interface UseInfiniteNotificationsParams {
  unreadOnly?: boolean;
  search?: string;
  type?: string;
  limit?: number;
}

export interface NotificationPageResult {
  notifications: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
  nextSkip: number;
}

export function useNotifications({
  unreadOnly = false,
  search,
  type,
  limit = 10,
  skip = 0,
}: UseNotificationsParams = {}) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth?.accessToken || auth?.data?.user?.id || auth?.user?.id);

  return useQuery<{
    notifications: NotificationItem[];
    unreadCount: number;
    hasMore: boolean;
  }>({
    queryKey: ["notifications", { unreadOnly, search, type, limit, skip }],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/notifications/get", {
          params: {
            unreadOnly,
            search: search?.trim() || undefined,
            type: type && type !== "ALL" ? type : undefined,
            limit,
            skip,
          },
        });
        const data = response.data?.data || response.data || {};
        return {
          notifications: data.notifications || [],
          unreadCount:
            data.unreadCount ??
            (data.notifications || []).filter((n: NotificationItem) => !n.isRead).length,
          hasMore: Boolean(data.hasMore),
        };
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          throw error;
        }
        console.warn("Failed to fetch notifications:", error);
        return { notifications: [], unreadCount: 0, hasMore: false };
      }
    },
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      if (!isAuthenticated || query.state.error) {
        return false;
      }
      return 10000;
    },
  });
}

export function useInfiniteNotifications({
  unreadOnly = false,
  search,
  type,
  limit = 15,
}: UseInfiniteNotificationsParams = {}) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth?.accessToken || auth?.data?.user?.id || auth?.user?.id);

  return useInfiniteQuery<NotificationPageResult>({
    queryKey: ["notifications", "infinite", { unreadOnly, search, type, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const skip = typeof pageParam === "number" ? pageParam : 0;
        const response = await axiosPrivate.get("/notifications/get", {
          params: {
            unreadOnly,
            search: search?.trim() || undefined,
            type: type && type !== "ALL" ? type : undefined,
            limit,
            skip,
          },
        });
        const data = response.data?.data || response.data || {};
        const notifications: NotificationItem[] = data.notifications || [];
        const hasMore = Boolean(data.hasMore);
        return {
          notifications,
          unreadCount: data.unreadCount ?? 0,
          hasMore,
          nextSkip: skip + notifications.length,
        };
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.status === 401 ||
          error?.status === 403
        ) {
          throw error;
        }
        console.warn("Failed to fetch infinite notifications:", error);
        return { notifications: [], unreadCount: 0, hasMore: false, nextSkip: 0 };
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextSkip : undefined),
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      if (!isAuthenticated || query.state.error) {
        return false;
      }
      return 10000;
    },
  });
}

export function useMarkNotificationAsRead() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.patch(`/notifications/${id}/read`);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              const updatedNotifications = (page.notifications || []).map((item: NotificationItem) =>
                item.id === id ? { ...item, isRead: true } : item
              );
              return {
                ...page,
                notifications: updatedNotifications,
                unreadCount: Math.max(0, (page.unreadCount || 0) - 1),
              };
            }),
          };
        }
        const updatedNotifications = (oldData.notifications || []).map((item: NotificationItem) =>
          item.id === id ? { ...item, isRead: true } : item
        );
        const unreadCount = updatedNotifications.filter((n: NotificationItem) => !n.isRead).length;
        return {
          ...oldData,
          notifications: updatedNotifications,
          unreadCount,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.patch("/notifications/read-all");
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              notifications: (page.notifications || []).map((item: NotificationItem) => ({
                ...item,
                isRead: true,
              })),
              unreadCount: 0,
            })),
          };
        }
        const updatedNotifications = (oldData.notifications || []).map((item: NotificationItem) => ({
          ...item,
          isRead: true,
        }));
        return {
          ...oldData,
          notifications: updatedNotifications,
          unreadCount: 0,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosPrivate.delete(`/notifications/${id}`);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              const updatedNotifications = (page.notifications || []).filter(
                (item: NotificationItem) => item.id !== id
              );
              return {
                ...page,
                notifications: updatedNotifications,
              };
            }),
          };
        }
        const updatedNotifications = (oldData.notifications || []).filter(
          (item: NotificationItem) => item.id !== id
        );
        const unreadCount = updatedNotifications.filter((n: NotificationItem) => !n.isRead).length;
        return {
          ...oldData,
          notifications: updatedNotifications,
          unreadCount,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useClearAllNotifications() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosPrivate.delete("/notifications/clear-all");
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.pages)) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              notifications: [],
              unreadCount: 0,
              hasMore: false,
            })),
          };
        }
        return {
          ...oldData,
          notifications: [],
          unreadCount: 0,
          hasMore: false,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
