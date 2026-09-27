import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "../../api/useCategories";

interface CategoryCardGridProps {
  categories: Category[];
  isLoading?: boolean;
  canManage?: boolean;
  onEdit?: (category: Category) => void;
}

export function CategoryCardGrid({
  categories,
  isLoading = false,
  canManage = false,
  onEdit,
}: CategoryCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl bg-muted" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 bg-muted rounded-md" />
                <Skeleton className="h-3 w-20 bg-muted rounded-md" />
              </div>
            </div>
            <div className="pt-2.5 flex justify-between items-center border-t border-border/50">
              <Skeleton className="h-6 w-20 bg-muted rounded-md" />
              <div className="flex items-center gap-1">
                <Skeleton className="size-7 bg-muted rounded-md" />
                <Skeleton className="size-7 bg-muted rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id || cat._id}
          category={cat}
          canManage={canManage}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default CategoryCardGrid;
