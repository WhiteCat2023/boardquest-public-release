import React from "react";
import { Card } from "@/components/ui/card";
import { NotificationDateGroup } from "./NotificationDateGroup";
import { NotificationsEmptyState } from "./NotificationsEmptyState";
import { NotificationsLoadMore } from "./NotificationsLoadMore";
import type { NotificationItem } from "../types/types";

interface NotificationsListProps {
  isLoading: boolean;
  allNotifications: NotificationItem[];
  groupedNotifications: { [key: string]: NotificationItem[] };
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationsList({
  isLoading,
  allNotifications,
  groupedNotifications,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onMarkAsRead,
  onDelete,
}: NotificationsListProps) {
  const dateGroupKeys = Object.keys(groupedNotifications);

  return (
    <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden p-0 font-sans">
      {isLoading ? (
        <div className="p-10 text-center text-xs text-muted-foreground italic font-medium">
          Loading notification records...
        </div>
      ) : allNotifications.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        <div className="divide-y divide-border">
          {dateGroupKeys.map((groupLabel) => {
            const groupItems = groupedNotifications[groupLabel];
            return (
              <NotificationDateGroup
                key={groupLabel}
                groupLabel={groupLabel}
                items={groupItems}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            );
          })}

          <NotificationsLoadMore
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNotifications={allNotifications.length > 0}
            onFetchNextPage={onFetchNextPage}
          />
        </div>
      )}
    </Card>
  );
}

export default NotificationsList;
