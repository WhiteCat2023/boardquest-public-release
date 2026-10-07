import type { NotificationItem } from "../types/types";

/**
 * Groups an array of notification items by relative date (Today, Yesterday, or full date string).
 */
export function groupNotificationsByDate(
  notifications: NotificationItem[],
): { [key: string]: NotificationItem[] } {
  const groups: { [key: string]: NotificationItem[] } = {};

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  notifications.forEach((item) => {
    let dateKey: string;
    try {
      const d = new Date(item.createdAt);
      if (d.toDateString() === todayStr) {
        dateKey = "Today";
      } else if (d.toDateString() === yesterdayStr) {
        dateKey = "Yesterday";
      } else {
        dateKey = d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
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
