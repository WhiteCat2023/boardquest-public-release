import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewCenterOverviewTab from "./ReviewCenterOverviewTab";
import ReviewCenterStudentsTab from "./ReviewCenterStudentsTab";
import ReviewCenterSchedulesTab from "./ReviewCenterSchedulesTab";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterTabsContentProps {
  activeTab: "overview" | "students" | "schedules";
  isLoading: boolean;
  reviewCenter?: ReviewCenterRepresentative | null;
  studentsCount: number;
  schedulesCount: number;
  formatDate: (dateString?: string) => string;
  onNavigateStudentsTab: () => void;
  onNavigateSchedulesTab: () => void;
}

export function ReviewCenterTabsContent({
  activeTab,
  isLoading,
  reviewCenter,
  studentsCount,
  schedulesCount,
  formatDate,
  onNavigateStudentsTab,
  onNavigateSchedulesTab,
}: ReviewCenterTabsContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (activeTab === "overview") {
    return (
      <ReviewCenterOverviewTab
        reviewCenter={reviewCenter || undefined}
        studentsCount={studentsCount}
        schedulesCount={schedulesCount}
        formatDate={formatDate}
        onNavigateStudentsTab={onNavigateStudentsTab}
        onNavigateSchedulesTab={onNavigateSchedulesTab}
      />
    );
  }

  if (activeTab === "students") {
    return <ReviewCenterStudentsTab reviewCenter={reviewCenter || undefined} />;
  }

  return <ReviewCenterSchedulesTab reviewCenter={reviewCenter || undefined} />;
}

export default ReviewCenterTabsContent;
