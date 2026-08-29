import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "./useAuth";
import { getPusherClient } from "@/lib/pusher";

export function usePusherNotifications() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const userRole = currentUser?.role?.toLowerCase();

  useEffect(() => {
    if (!currentUser?.id) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelsToSubscribe: string[] = [];

    // 1. Role-based channel
    if (userRole) {
      channelsToSubscribe.push(`role-${userRole}`);
      if (["superadmin", "dean", "teamlead"].includes(userRole)) {
        channelsToSubscribe.push("role-reviewer");
      }
    }

    // 2. Global broadcast channel
    channelsToSubscribe.push("role-all");

    // 3. User-specific channel
    channelsToSubscribe.push(`user-${currentUser.id}`);

    // 4. Admin events channel (for real-time table sync)
    channelsToSubscribe.push("admin-events");

    const uniqueChannels = Array.from(new Set(channelsToSubscribe));
    const subscribedChannels = uniqueChannels.map((chName) => pusher.subscribe(chName));

    const handleNotification = (data: any) => {
      if (data && data.title) {
        // Trigger live toast alert
        toast.info(data.title, {
          description: data.message,
        });

        // Invalidate React Query notification and domain caches
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
        queryClient.invalidateQueries({ queryKey: ["questions"] });
        queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
      }
    };

    const handleQuestionsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });
    };

    subscribedChannels.forEach((ch) => {
      ch.bind("notification", handleNotification);
      ch.bind("questions-updated", handleQuestionsUpdated);
    });

    return () => {
      subscribedChannels.forEach((ch) => {
        ch.unbind("notification", handleNotification);
        ch.unbind("questions-updated", handleQuestionsUpdated);
        pusher.unsubscribe(ch.name);
      });
    };
  }, [currentUser?.id, userRole, queryClient]);
}

export default usePusherNotifications;
