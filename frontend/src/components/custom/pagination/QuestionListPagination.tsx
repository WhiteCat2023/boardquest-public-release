import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionListPaginationProps {
    currentPage: number;
    hasNextPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

export default function QuestionListPagination({
    currentPage,
    hasNextPage,
    onNext,
    onPrevious,
}: QuestionListPaginationProps) {
    return (
      <Pagination
        className="mt-8 flex justify-center w-full"
        data-shimmer-ignore
      >
        <PaginationContent className="flex items-center gap-2">
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={onPrevious}
              className="cursor-pointer flex items-center gap-1 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-xs">
              {currentPage}
            </span>
          </PaginationItem>

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={onNext}
              className="cursor-pointer flex items-center gap-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
}