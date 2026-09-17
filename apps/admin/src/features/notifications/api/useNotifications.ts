import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import type { NotificationItem } from "../types/types";

interface UseNotificationsParams {
  unreadOnly?: boolean;
  search?: string;
  type?: string;
}

export function useNotifications({
  unreadOnly = false,
  search,
  type,
}: UseNotificationsParams = {}) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isAuthenticated = Boolean(auth?.accessToken || auth?.data?.user?.id || auth?.user?.id);

  return useQuery<{ notifications: NotificationItem[]; unreadCount: number }>({
    queryKey: ["notifications", { unreadOnly, search, type }],
    queryFn: async () => {
      try {
        const response = await axiosPrivate.get("/notifications/get", {
          params: {
            unreadOnly,
            search: search?.trim() || undefined,
            type: type && type !== "ALL" ? type : undefined,
          },
        });
        const data = response.data?.data || response.data || {};
        return {
          notifications: data.notifications || [],
          unreadCount: data.unreadCount ?? (data.notifications || []).filter((n: NotificationItem) => !n.isRead).length,
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
        return { notifications: [], unreadCount: 0 };
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
        return {
          ...oldData,
          notifications: [],
          unreadCount: 0,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
