import { useState } from "react";
import { isToday, isYesterday, format } from "date-fns";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Inbox,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "../api/useNotifications";
import NotificationCard from "../components/NotificationItem";
import type { NotificationItem } from "../types/types";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, refetch } = useNotifications({ unreadOnly });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllNotificationsMutation = useClearAllNotifications();

  const allNotifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Filter notifications based on search & category type
  const filteredNotifications = allNotifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "ALL" || n.type.toUpperCase() === selectedType.toUpperCase();

    return matchesSearch && matchesType;
  });

  // Group filtered notifications by date
  const groupedNotifications = (() => {
    const groups: { [key: string]: NotificationItem[] } = {};

    filteredNotifications.forEach((item) => {
      let dateKey: string;
      try {
        const d = new Date(item.createdAt);
        if (isToday(d)) {
          dateKey = "Today";
        } else if (isYesterday(d)) {
          dateKey = "Yesterday";
        } else {
          dateKey = format(d, "MMMM d, yyyy");
        }
      } catch {
        dateKey = "Earlier";
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  })();

  const dateGroupKeys = Object.keys(groupedNotifications);

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 max-w-5xl mx-auto w-full font-sans bg-background text-foreground animate-in fade-in duration-150">
      {/* Compact Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
            <Bell size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              Notification Center
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Track system notifications, approvals, and security updates grouped by date.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
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
              onClick={() => markAllAsReadMutation.mutate()}
              className="h-8 text-xs gap-1 rounded-xl border-border hover:bg-primary/10 text-primary cursor-pointer font-bold px-2.5"
            >
              <CheckCheck size={13} />
              Mark All Read
            </Button>
          )}

          {allNotifications.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => clearAllNotificationsMutation.mutate()}
              className="h-8 text-xs gap-1 rounded-xl border-border hover:bg-destructive/10 text-destructive cursor-pointer font-bold px-2.5"
            >
              <Trash2 size={13} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Compact Filter & Search Bar */}
      <Card className="bg-card border border-border rounded-xl shadow-2xs overflow-hidden p-2.5 px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 h-8 text-xs bg-muted/30 border-border rounded-lg focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0">
            <button
              type="button"
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-2.5 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                unreadOnly
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-accent hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>

            <div className="h-3.5 w-px bg-border mx-1 hidden sm:block" />

            {(["ALL", "QUESTION_APPROVED", "STUDENT_ASSIGNED", "SYSTEM_UPDATE", "INFO"] as const).map((t) => {
              const isActive = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {t === "QUESTION_APPROVED"
                    ? "Questions"
                    : t === "STUDENT_ASSIGNED"
                    ? "Guidance"
                    : t === "SYSTEM_UPDATE"
                    ? "System"
                    : t}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Date Grouped Notifications Stream Container */}
      <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden p-0 font-sans">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-muted-foreground italic font-medium">
            Loading notification records...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Inbox size={26} />
            </div>
            <h3 className="text-xs font-bold text-foreground">No Notifications Found</h3>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              There are no notification entries matching your current filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dateGroupKeys.map((groupLabel) => {
              const groupItems = groupedNotifications[groupLabel];
              return (
                <div key={groupLabel} className="divide-y divide-border/60">
                  {/* Date Group Sticky Header */}
                  <div className="bg-muted/60 px-4 py-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/80 flex items-center justify-between sticky top-0 backdrop-blur-xs z-5">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <Calendar size={12} className="text-primary" />
                      {groupLabel}
                    </span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {groupItems.length} {groupItems.length === 1 ? "notification" : "notifications"}
                    </span>
                  </div>

                  {/* Grouped Notification Cards */}
                  {groupItems.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                      onDelete={(id) => deleteNotificationMutation.mutate(id)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
