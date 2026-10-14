import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReviewCenterAuth } from "./useReviewCenterAuth";

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
  const { user } = useReviewCenterAuth();

  useEffect(() => {
    if (!user?.id) return;

    const streamUrl = `${BASE_URL}/review-center-app/notifications/stream`;
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
            queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
            queryClient.invalidateQueries({ queryKey: ["candidates"] });
            queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
            queryClient.invalidateQueries({ queryKey: ["schedules"] });
          }
        } catch (err) {
          console.warn("Error parsing notification SSE payload:", err);
        }
      });

      eventSource.addEventListener("candidates-updated", () => {
        try {
          queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidates"] });
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        } catch (err) {
          console.warn("Error processing candidates-updated SSE event:", err);
        }
      });

      eventSource.addEventListener("schedules-updated", () => {
        try {
          queryClient.invalidateQueries({ queryKey: ["reviewSchedules"] });
          queryClient.invalidateQueries({ queryKey: ["schedules"] });
        } catch (err) {
          console.warn("Error processing schedules-updated SSE event:", err);
        }
      });

      eventSource.addEventListener("scores-updated", () => {
        try {
          queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
          queryClient.invalidateQueries({ queryKey: ["assessments"] });
        } catch (err) {
          console.warn("Error processing scores-updated SSE event:", err);
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
  }, [user?.id, queryClient]);
}

export default useNotificationStream;
