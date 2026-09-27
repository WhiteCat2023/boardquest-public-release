import React from "react";
import { Calendar } from "lucide-react";
import NotificationCard from "./NotificationItem";
import type { NotificationItem } from "../types/types";

interface NotificationDateGroupProps {
  groupLabel: string;
  items: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationDateGroup({
  groupLabel,
  items,
  onMarkAsRead,
  onDelete,
}: NotificationDateGroupProps) {
  return (
    <div className="divide-y divide-border/60">
      {/* Date Group Sticky Header */}
      <div className="bg-muted/60 px-4 py-1.5 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/80 flex items-center justify-between sticky top-0 backdrop-blur-xs z-5">
        <span className="flex items-center gap-1.5 text-foreground/80">
          <Calendar size={12} className="text-primary" />
          {groupLabel}
        </span>
        <span className="text-[10px] font-normal text-muted-foreground">
          {items.length} {items.length === 1 ? "notification" : "notifications"}
        </span>
      </div>

      {/* Grouped Notification Cards */}
      {items.map((notif) => (
        <NotificationCard
          key={notif.id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NotificationDateGroup;
