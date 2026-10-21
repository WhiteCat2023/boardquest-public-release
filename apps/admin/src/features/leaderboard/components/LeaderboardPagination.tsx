import React from "react";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";

export interface LeaderboardPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function LeaderboardPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
}: LeaderboardPaginationProps) {
  return (
    <DataTablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
      hasNextPage={currentPage < totalPages}
      hasPreviousPage={currentPage > 1}
      onNext={() => onPageChange(currentPage + 1)}
      onPrevious={() => onPageChange(currentPage - 1)}
      itemLabel="candidates"
      variant="table-footer"
    />
  );
}

