import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPageSelect?: (page: number) => void;
  itemLabel?: string;
  isLoading?: boolean;
  className?: string;
  variant?: "table-footer" | "card" | "standalone";
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrevious,
  itemLabel = "entries",
  isLoading = false,
  className = "",
  variant = "table-footer",
}) => {
  const computedTotalPages =
    totalPages !== undefined
      ? Math.max(1, totalPages)
      : totalItems !== undefined
      ? Math.max(1, Math.ceil(totalItems / pageSize))
      : Math.max(1, hasNextPage ? currentPage + 1 : currentPage);

  const canPrevious =
    hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1;
  const canNext = hasNextPage && (totalPages ? currentPage < totalPages : true);

  const startIdx =
    totalItems === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;
  const endIdx =
    totalItems !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : currentPage * pageSize;

  const containerStyles =
    variant === "table-footer"
      ? "p-3.5 px-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shrink-0"
      : variant === "standalone"
      ? "flex flex-col sm:flex-row items-center justify-between gap-3 font-sans w-full py-2"
      : "p-3.5 px-5 border border-border rounded-2xl bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-sans w-full";

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* Left Range Summary */}
      <span className="text-xs text-muted-foreground font-medium">
        {totalItems !== undefined ? (
          <>
            Showing <strong className="text-foreground font-bold">{startIdx}</strong> to{" "}
            <strong className="text-foreground font-bold">{endIdx}</strong> of{" "}
            <strong className="text-foreground font-bold">{totalItems}</strong> {itemLabel}
          </>
        ) : (
          <>
            Showing page <strong className="text-foreground font-bold">{currentPage}</strong>
            {totalPages !== undefined && (
              <>
                {" "}of <strong className="text-foreground font-bold">{computedTotalPages}</strong>
              </>
            )}{" "}
            {itemLabel}
          </>
        )}
      </span>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrevious || isLoading}
          onClick={onPrevious}
          className="h-8 text-xs gap-1 rounded-full px-3.5 cursor-pointer font-medium border-border/80 hover:bg-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
          Previous
        </Button>

        <div className="flex items-center gap-1 text-xs font-bold px-2 select-none">
          <span className="text-foreground">{currentPage}</span>
          <span className="text-muted-foreground font-normal">/</span>
          <span className="text-muted-foreground">{computedTotalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!canNext || isLoading}
          onClick={onNext}
          className="h-8 text-xs gap-1 rounded-full px-3.5 cursor-pointer font-medium border-border/80 hover:bg-accent text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default DataTablePagination;
