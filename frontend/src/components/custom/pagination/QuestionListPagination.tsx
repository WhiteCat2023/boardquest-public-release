import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionListPaginationProps {
    currentPage: number;
    hasNextPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onPageSelect?: (page: number) => void;
    maxPageReached?: number;
}

export default function QuestionListPagination({
    currentPage,
    hasNextPage,
    onNext,
    onPrevious,
    onPageSelect,
    maxPageReached = 1,
}: QuestionListPaginationProps) {
    // Generate visible page numbers dynamically around currentPage
    const pages: (number | string)[] = [];

    const maxKnown = Math.max(currentPage, maxPageReached, hasNextPage ? currentPage + 1 : currentPage);

    // Build reasonable range around currentPage
    for (let i = 1; i <= Math.min(3, maxKnown); i++) {
        pages.push(i);
    }

    if (maxKnown > 3) {
        if (!pages.includes(currentPage) && currentPage > 3) {
            if (currentPage > 4) {
                pages.push("...");
            }
            pages.push(currentPage);
        }
        if (hasNextPage) {
            if (!pages.includes(currentPage + 1)) {
                pages.push(currentPage + 1);
            }
            pages.push("...");
        }
    } else if (hasNextPage) {
        pages.push("...");
    }

    return (
        <div className="mt-8 flex justify-center w-full" data-shimmer-ignore>
            <div className="inline-flex items-center gap-1.5 sm:gap-3 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-sm select-none">
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={onPrevious}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#A70202] disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-slate-50"
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
                                    className="px-2 py-1 text-slate-400 text-sm font-semibold"
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
                                        ? "bg-[#A70202] text-white shadow-xs"
                                        : "text-slate-600 hover:text-[#A70202] hover:bg-slate-100/80"
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
                    className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#A70202] disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-slate-50"
                >
                    <span>Next</span>
                    <ChevronRight size={16} className="stroke-[2.2]" />
                </button>
            </div>
        </div>
    );
}