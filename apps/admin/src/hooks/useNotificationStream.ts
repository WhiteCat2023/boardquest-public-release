import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "./useAuth";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/$/, "")}/api`;

export function useNotificationStream() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;

  useEffect(() => {
    if (!currentUser?.id) return;

    const streamUrl = `${BASE_URL}/notifications/stream`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(streamUrl, {
        withCredentials: true,
      });

      eventSource.addEventListener("notification", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.title) {
            // Trigger instant toast notification
            toast.info(data.title, {
              description: data.message,
            });

            // Invalidate React Query notification and domain caches
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
          }
        } catch (err) {
          console.warn("Error parsing notification SSE payload:", err);
        }
      });

      eventSource.onerror = () => {
        // Native EventSource auto-reconnects based on server retry directive
      };
    } catch (err) {
      console.warn("Failed to establish notification SSE stream:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser?.id, queryClient]);
}

export default useNotificationStream;
