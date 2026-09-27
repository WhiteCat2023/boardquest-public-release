import React from "react";
import { Bell, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
} from "../api/useNotifications";

interface NotificationsHeaderProps {
  unreadCount: number;
  totalNotifications: number;
  isLoading: boolean;
  onRefresh: () => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export function NotificationsHeader({
  unreadCount,
  totalNotifications,
  isLoading,
  onRefresh,
  onMarkAllAsRead,
  onClearAll,
}: NotificationsHeaderProps) {
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllNotificationsMutation = useClearAllNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleClearAll = () => {
    clearAllNotificationsMutation.mutate();
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
          <Bell size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-full"
              >
                {unreadCount} Unread
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            Track system notifications, approvals, and security updates grouped by
            date.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 text-xs gap-1 rounded-xl border-border hover:bg-accent cursor-pointer px-2.5"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </Button>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="h-8 text-xs gap-1 rounded-xl border-border hover:bg-primary/10 text-primary cursor-pointer font-bold px-2.5"
          >
            <CheckCheck size={13} />
            {markAllAsReadMutation.isPending ? "Marking..." : "Mark All Read"}
          </Button>
        )}

        {totalNotifications > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearAllNotificationsMutation.isPending}
            className="h-8 text-xs gap-1 rounded-xl border-border hover:bg-destructive/10 text-destructive cursor-pointer font-bold px-2.5"
          >
            <Trash2 size={13} />
            {clearAllNotificationsMutation.isPending
              ? "Clearing..."
              : "Clear All"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NotificationsHeader;
