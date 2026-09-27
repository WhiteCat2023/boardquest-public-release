import { useState, useDeferredValue, useMemo } from "react";
import { useInfiniteNotifications } from "../api/useNotifications";
import {
  NotificationsHeader,
  NotificationsFilterBar,
  NotificationsList,
} from "../components";
import { groupNotificationsByDate } from "../utils/groupNotifications";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotifications({
    unreadOnly,
    search: deferredSearch,
    type: selectedType,
    limit: 15,
  });

  const allNotifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) || [],
    [data],
  );
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  // Group notifications directly by date (filtering is done on backend)
  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(allNotifications),
    [allNotifications],
  );

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 max-w-5xl mx-auto w-full font-sans bg-background text-foreground animate-in fade-in duration-150">
      {/* Compact Header Toolbar */}
      <NotificationsHeader
        unreadCount={unreadCount}
        totalNotifications={allNotifications.length}
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />

      {/* Compact Filter & Search Bar */}
      <NotificationsFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        unreadOnly={unreadOnly}
        onToggleUnreadOnly={() => setUnreadOnly((prev) => !prev)}
        unreadCount={unreadCount}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* Date Grouped Notifications Stream Container */}
      <NotificationsList
        isLoading={isLoading}
        allNotifications={allNotifications}
        groupedNotifications={groupedNotifications}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={() => fetchNextPage()}
      />
    </div>
  );
}
