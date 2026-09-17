import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, ExternalLink, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "../api/useNotifications";
import NotificationCard from "./NotificationItem";
import type { NotificationFilterTab } from "../types/types";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>("ALL");

  const { data, isLoading } = useNotifications({
    unreadOnly: filterTab === "UNREAD",
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllNotificationsMutation = useClearAllNotifications();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleClearAll = () => {
    clearAllNotificationsMutation.mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative size-7.5 sm:size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer border border-transparent hover:border-border outline-hidden focus:ring-2 focus:ring-ring/20 font-sans"
          title="Notifications"
        >
          <Bell size={15} />
          {/* Animated Unread Notification Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-primary text-[8px] font-extrabold text-primary-foreground ring-1.5 ring-background animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-80 slide-in-from-top-2 duration-150 text-card-foreground font-sans overflow-hidden"
      >
        {/* Dropdown Header Bar */}
        <div className="p-3.5 px-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Bell size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Notifications
              </span>
              <span className="text-[10px] text-muted-foreground">
                Stay informed on system events & activities.
              </span>
            </div>
          </div>

          {unreadCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] font-extrabold bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-full"
            >
              {unreadCount} New
            </Badge>
          )}
        </div>

        {/* Filter Tabs & Bulk Actions Bar */}
        <div className="p-2 px-3 border-b border-border bg-card flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterTab === "ALL"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("UNREAD")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                filterTab === "UNREAD"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-2 flex items-center gap-1 cursor-pointer font-bold"
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                <span className="hidden sm:inline">Read All</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg px-2 flex items-center gap-1 cursor-pointer font-bold"
                title="Clear all notifications"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground italic font-medium">
              Loading notification updates...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
              <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border">
                <Inbox size={22} />
              </div>
              <span className="text-xs font-bold text-foreground">
                No Notifications
              </span>
              <span className="text-[11px] text-muted-foreground max-w-xs">
                {filterTab === "UNREAD"
                  ? "You are all caught up! No unread notifications."
                  : "No notifications recorded in your account yet."}
              </span>
            </div>
          ) : (
            notifications.map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Footer Navigation Link */}
        <div className="p-2 px-3 border-t border-border bg-muted/20 text-center flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono">
            {notifications.length}{" "}
            {notifications.length === 1 ? "entry" : "entries"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1 py-1"
          >
            Notification Center <ExternalLink size={12} />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
