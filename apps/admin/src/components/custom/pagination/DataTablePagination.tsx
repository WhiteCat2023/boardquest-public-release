import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
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
  pageSizeOptions,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrevious,
  itemLabel = "entries",
  isLoading = false,
  className = "",
  variant = "table-footer",
}) => {
  const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
  const [internalPageSize, setInternalPageSize] = React.useState(pageSize);

  React.useEffect(() => {
    setInternalPageSize(pageSize);
  }, [pageSize]);

  const effectivePageSize = onPageSizeChange ? pageSize : internalPageSize;

  const baseOptions =
    pageSizeOptions && pageSizeOptions.length > 0
      ? pageSizeOptions
      : DEFAULT_PAGE_SIZE_OPTIONS;

  const resolvedPageSizeOptions = React.useMemo(() => {
    if (effectivePageSize && !baseOptions.includes(effectivePageSize)) {
      return [...baseOptions, effectivePageSize].sort((a, b) => a - b);
    }
    return baseOptions;
  }, [baseOptions, effectivePageSize]);

  const handlePageSizeChange = (val: string) => {
    const newSize = Number(val);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
    }
  };

  const computedTotalPages =
    totalPages !== undefined
      ? Math.max(1, totalPages)
      : totalItems !== undefined
        ? Math.max(1, Math.ceil(totalItems / effectivePageSize))
        : Math.max(1, hasNextPage ? currentPage + 1 : currentPage);

  const canPrevious =
    hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1;
  const canNext = hasNextPage && (totalPages ? currentPage < totalPages : true);

  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endIdx =
    totalItems !== undefined
      ? Math.min(currentPage * effectivePageSize, totalItems)
      : currentPage * effectivePageSize;

  const containerStyles =
    variant === "table-footer"
      ? "p-3.5 px-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shrink-0"
      : variant === "standalone"
        ? "flex flex-col sm:flex-row items-center justify-between gap-3 font-sans w-full py-2"
        : "p-3.5 px-5 border border-border rounded-2xl bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-sans w-full";

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* Left: Range Summary & Always Present Page Size Dropdown */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
        <span>
          {totalItems !== undefined ? (
            <>
              Showing{" "}
              <strong className="text-foreground font-bold">{startIdx}</strong>{" "}
              to <strong className="text-foreground font-bold">{endIdx}</strong>{" "}
              of{" "}
              <strong className="text-foreground font-bold">
                {totalItems}
              </strong>{" "}
              {itemLabel}
            </>
          ) : (
            <>
              Showing page{" "}
              <strong className="text-foreground font-bold">
                {currentPage}
              </strong>
              {totalPages !== undefined && (
                <>
                  {" "}
                  of{" "}
                  <strong className="text-foreground font-bold">
                    {computedTotalPages}
                  </strong>
                </>
              )}{" "}
              {itemLabel}
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-border hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Items per page:
            </span>
            <Select
              value={String(effectivePageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-7.5 w-[74px] text-xs font-semibold bg-muted/40 border-border rounded-lg shadow-2xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="rounded-xl border-border bg-card"
              >
                {resolvedPageSizeOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={String(opt)}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
