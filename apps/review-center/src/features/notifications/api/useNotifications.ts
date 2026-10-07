import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rcAxios } from "@/lib/axios";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import type { NotificationItem } from "../types/types";

export interface UseNotificationsParams {
  unreadOnly?: boolean;
  search?: string;
  type?: string;
  limit?: number;
  skip?: number;
}

export function useNotifications({
  unreadOnly = false,
  search,
  type,
  limit = 10,
  skip = 0,
}: UseNotificationsParams = {}) {
  const { user } = useReviewCenterAuth();
  const isAuthenticated = Boolean(user?.id);

  return useQuery<{
    notifications: NotificationItem[];
    unreadCount: number;
    hasMore: boolean;
  }>({
    queryKey: ["notifications", { unreadOnly, search, type, limit, skip }],
    queryFn: async () => {
      try {
        const response = await rcAxios.get("/notifications/get", {
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
          error?.response?.status === 403
        ) {
          return { notifications: [], unreadCount: 0, hasMore: false };
        }
        return { notifications: [], unreadCount: 0, hasMore: false };
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute polling fallback
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationsCount() {
  const { user } = useReviewCenterAuth();
  const isAuthenticated = Boolean(user?.id);

  return useQuery<number>({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      try {
        const response = await rcAxios.get("/notifications/unread-count");
        return response.data?.data?.unreadCount ?? response.data?.unreadCount ?? 0;
      } catch {
        return 0;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
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

export function useInfiniteNotifications({
  unreadOnly = false,
  search,
  type,
  limit = 15,
}: UseInfiniteNotificationsParams = {}) {
  const { user } = useReviewCenterAuth();
  const isAuthenticated = Boolean(user?.id);

  return useInfiniteQuery<NotificationPageResult>({
    queryKey: ["notifications", "infinite", { unreadOnly, search, type, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const skip = typeof pageParam === "number" ? pageParam : 0;
        const response = await rcAxios.get("/notifications/get", {
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
          error?.response?.status === 403
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
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rcAxios.patch(`/notifications/read/${id}`);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueriesData<any>(
        { queryKey: ["notifications"] },
        (old: any) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n: NotificationItem) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, (old.unreadCount || 1) - 1),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await rcAxios.patch("/notifications/read-all");
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueriesData<any>(
        { queryKey: ["notifications"] },
        (old: any) => {
          if (!old?.notifications) return old;
          return {
            ...old,
            notifications: old.notifications.map((n: NotificationItem) => ({
              ...n,
              isRead: true,
            })),
            unreadCount: 0,
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rcAxios.delete(`/notifications/delete/${id}`);
      return response.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueriesData<any>(
        { queryKey: ["notifications"] },
        (old: any) => {
          if (!old?.notifications) return old;
          const target = old.notifications.find((n: NotificationItem) => n.id === id);
          return {
            ...old,
            notifications: old.notifications.filter((n: NotificationItem) => n.id !== id),
            unreadCount:
              target && !target.isRead
                ? Math.max(0, (old.unreadCount || 1) - 1)
                : old.unreadCount,
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await rcAxios.delete("/notifications/clear-all");
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      queryClient.setQueriesData<any>(
        { queryKey: ["notifications"] },
        () => ({
          notifications: [],
          unreadCount: 0,
          hasMore: false,
        })
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });
}
