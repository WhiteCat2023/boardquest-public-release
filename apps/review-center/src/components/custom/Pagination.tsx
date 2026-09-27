import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        <div className="inline-flex items-center gap-1 bg-card border border-border px-2 py-1 rounded-xl shadow-xs">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:text-muted-foreground/30 disabled:cursor-not-allowed transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-muted"
            title="Previous Page"
          >
            <ChevronLeft className="size-3.5 stroke-[2.5]" />
            <span className="hidden md:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-0.5">
            {pages.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 py-0.5 text-muted-foreground text-xs font-semibold"
                  >
                    {p}
                  </span>
                );
              }

              const isActive = p === currentPage;

              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`text-xs font-bold transition-all px-2.5 py-1 rounded-lg cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= safeTotalPages}
            onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:text-muted-foreground/30 disabled:cursor-not-allowed transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-muted"
            title="Next Page"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className="size-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
