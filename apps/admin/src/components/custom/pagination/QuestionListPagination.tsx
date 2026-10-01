import React from "react";
import DataTablePagination, {
  type DataTablePaginationProps,
} from "./DataTablePagination";

export interface QuestionListPaginationProps
  extends Partial<DataTablePaginationProps> {
  currentPage: number;
  hasNextPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPageSelect?: (page: number) => void;
  maxPageReached?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  className?: string;
  variant?: "table-footer" | "card" | "standalone";
}

export default function QuestionListPagination({
  currentPage,
  hasNextPage,
  onNext,
  onPrevious,
  onPageSelect,
  maxPageReached,
  totalPages,
  totalItems,
  pageSize = 10,
  itemLabel = "entries",
  className = "",
  variant = "card",
  ...rest
}: QuestionListPaginationProps) {
  const resolvedTotalPages =
    totalPages !== undefined
      ? totalPages
      : maxPageReached && maxPageReached > 1
      ? maxPageReached
      : undefined;

  return (
    <DataTablePagination
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      onNext={onNext}
      onPrevious={onPrevious}
      onPageSelect={onPageSelect}
      totalPages={resolvedTotalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      itemLabel={itemLabel}
      className={className}
      variant={variant}
      {...rest}
    />
  );
}

export { DataTablePagination };
