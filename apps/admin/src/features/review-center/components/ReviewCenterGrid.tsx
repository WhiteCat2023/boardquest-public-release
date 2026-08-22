import type { ReviewCenterRepresentative } from "@/features/review-center";
import ReviewCenterCard from "./ReviewCenterCard";
import ReviewCenterCardSkeleton from "./ReviewCenterCardSkeleton";
import ReviewCenterEmptyState from "./ReviewCenterEmptyState";

interface ReviewCenterGridProps {
  items: ReviewCenterRepresentative[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onView: (item: ReviewCenterRepresentative) => void;
  onEdit: (item: ReviewCenterRepresentative) => void;
  onDelete?: (item: ReviewCenterRepresentative) => void;
}

export default function ReviewCenterGrid({
  items,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  onView,
  onEdit,
  onDelete,
}: ReviewCenterGridProps) {
  if (isLoading) {
    return <ReviewCenterCardSkeleton />;
  }

  if (items.length === 0) {
    return (
      <ReviewCenterEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ReviewCenterCard
          key={item.id}
          reviewCenter={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
