import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface LeaderboardPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function LeaderboardPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: LeaderboardPaginationProps) {
  // Generate visible page numbers for pagination buttons
  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20 text-xs font-sans">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>
          Page <strong className="text-foreground">{currentPage}</strong> of{" "}
          <strong className="text-foreground">{totalPages}</strong>
        </span>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
          <span className="text-[11px] text-muted-foreground">Per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange(Number(val));
            }}
          >
            <SelectTrigger className="h-7 w-[68px] text-xs bg-background rounded-lg border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="First Page"
        >
          <ChevronsLeft size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Dynamic Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {visiblePages.map((page, idx) =>
            page === "..." ? (
              <span key={`dots-${idx}`} className="px-1 text-muted-foreground text-xs">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(Number(page))}
                className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-7 px-2 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Last Page"
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  );
}
