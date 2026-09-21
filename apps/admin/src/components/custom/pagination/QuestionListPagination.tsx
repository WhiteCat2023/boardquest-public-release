import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionListPaginationProps {
    currentPage: number;
    hasNextPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onPageSelect?: (page: number) => void;
    maxPageReached?: number;
    totalPages?: number;
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

export default function QuestionListPagination({
    currentPage,
    hasNextPage,
    onNext,
    onPrevious,
    onPageSelect,
    maxPageReached = 1,
    totalPages,
}: QuestionListPaginationProps) {
    // Generate visible page numbers dynamically around currentPage
    const pages: (number | string)[] =
        totalPages !== undefined
            ? getPageNumbers(currentPage, Math.max(1, totalPages))
            : (() => {
                  const p: (number | string)[] = [];
                  const maxKnown = Math.max(
                      currentPage,
                      maxPageReached,
                      hasNextPage ? currentPage + 1 : currentPage
                  );

                  for (let i = 1; i <= Math.min(3, maxKnown); i++) {
                      p.push(i);
                  }

                  if (maxKnown > 3) {
                      if (!p.includes(currentPage) && currentPage > 3) {
                          if (currentPage > 4) {
                              p.push("...");
                          }
                          p.push(currentPage);
                      }
                      if (hasNextPage) {
                          if (!p.includes(currentPage + 1)) {
                              p.push(currentPage + 1);
                          }
                          p.push("...");
                      }
                  } else if (hasNextPage) {
                      p.push("...");
                  }
                  return p;
              })();

    return (
        <div className="mt-8 flex justify-center w-full font-sans" data-shimmer-ignore>
            <div className="inline-flex items-center gap-1.5 sm:gap-3 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm select-none">
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={onPrevious}
                    className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-accent"
                >
                    <ChevronLeft size={16} className="stroke-[2.2]" />
                    <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) => {
                        if (typeof p === "string") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="px-2 py-1 text-muted-foreground text-sm font-semibold"
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
                                onClick={() => onPageSelect && onPageSelect(p)}
                                disabled={!onPageSelect}
                                className={`text-sm font-bold transition-all px-3 py-1 rounded-xl cursor-pointer ${
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={onNext}
                    className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-accent"
                >
                    <span>Next</span>
                    <ChevronRight size={16} className="stroke-[2.2]" />
                </button>
            </div>
        </div>
    );
}