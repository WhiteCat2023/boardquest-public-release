import { isToday, isYesterday, format } from "date-fns";
import type { NotificationItem } from "../types/types";

/**
 * Groups an array of notification items by relative date (Today, Yesterday, or full date string).
 */
export function groupNotificationsByDate(
  notifications: NotificationItem[]
): { [key: string]: NotificationItem[] } {
  const groups: { [key: string]: NotificationItem[] } = {};

  notifications.forEach((item) => {
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
}
