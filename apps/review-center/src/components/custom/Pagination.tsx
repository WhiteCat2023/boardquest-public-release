import React from "react";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemName?: string;
  className?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [3, 6, 9, 12, 24],
  onPageChange,
  onPageSizeChange,
  itemName = "assessments",
  className = "",
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const pages = getPageNumbers(currentPage, safeTotalPages);

  // Compute item range for human-readable indicator
  let rangeStart = 0;
  let rangeEnd = 0;
  if (totalItems !== undefined && totalItems > 0 && pageSize) {
    rangeStart = (currentPage - 1) * pageSize + 1;
    rangeEnd = Math.min(currentPage * pageSize, totalItems);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border font-sans select-none ${className}`}
    >
      {/* ── Left: Range & Total Items Counter ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
        {totalItems !== undefined ? (
          totalItems > 0 ? (
            <span>
              Showing{" "}
              <strong className="font-bold text-foreground">
                {rangeStart}-{rangeEnd}
              </strong>{" "}
              of <strong className="font-bold text-foreground">{totalItems}</strong>{" "}
              {itemName}
            </span>
          ) : (
            <span>No {itemName} found</span>
          )
        ) : (
          <span>
            Page <strong className="font-bold text-foreground">{currentPage}</strong> of{" "}
            <strong className="font-bold text-foreground">{safeTotalPages}</strong>
          </span>
        )}
      </div>

      {/* ── Right: Page Size Selector & Controls ── */}
      <div className="flex flex-wrap items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Optional Page Size Selector */}
        {pageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-xs font-semibold bg-card border-border shadow-xs px-2 cursor-pointer">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs font-medium cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page Buttons Pill Container */}
        <UIPagination className="w-auto mx-0">
          <PaginationContent className="gap-1 bg-card border border-border px-2 py-1 rounded-xl shadow-xs">
            {/* Previous Page */}
            <PaginationItem>
              <PaginationPrevious
                text="Prev"
                className={`text-xs font-semibold cursor-pointer h-7 px-2 ${
                  currentPage <= 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    onPageChange(currentPage - 1);
                  }
                }}
              />
            </PaginationItem>

            {/* Page Numbers */}
            {pages.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis className="size-7" />
                  </PaginationItem>
                );
              }

              const isActive = p === currentPage;

              return (
                <PaginationItem key={`page-${p}`}>
                  <PaginationLink
                    isActive={isActive}
                    size="sm"
                    className="size-7 text-xs font-bold cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next Page */}
            <PaginationItem>
              <PaginationNext
                text="Next"
                className={`text-xs font-semibold cursor-pointer h-7 px-2 ${
                  currentPage >= safeTotalPages ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < safeTotalPages) {
                    onPageChange(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </UIPagination>
      </div>
    </div>
  );
}

export default Pagination;
