import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showFeedback } from "@/components/modal";
import useAuth from "./useAuth";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const formatBaseUrl = (url: string) => {
  const trimmed = url.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1") || trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
};
const BASE_URL = formatBaseUrl(rawUrl);

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
            showFeedback.info(data.title, {
              description: data.message,
            });

            // Invalidate React Query notification and domain caches
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardAnalyticsSummary"] });
          }
        } catch (err) {
          console.warn("Error parsing notification SSE payload:", err);
        }
      });

      eventSource.addEventListener("questions-updated", (_event: MessageEvent) => {
        try {
          // Instantly refresh all question list, review desk, and category stats
          queryClient.invalidateQueries({ queryKey: ["questions"] });
          queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
          queryClient.invalidateQueries({ queryKey: ["dashboardAnalyticsSummary"] });
        } catch (err) {
          console.warn("Error processing questions-updated SSE event:", err);
        }
      });

      eventSource.addEventListener("analytics-updated", (_event: MessageEvent) => {
        try {
          // Instantly refresh dashboard analytics summary
          queryClient.invalidateQueries({ queryKey: ["dashboardAnalyticsSummary"] });
        } catch (err) {
          console.warn("Error processing analytics-updated SSE event:", err);
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
