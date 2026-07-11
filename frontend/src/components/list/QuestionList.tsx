import { useState, useEffect } from "react";
import { AlertCircle, FileQuestion, SlidersHorizontal } from "lucide-react";
import { useQuestionBank, type QuestionFilters } from "@/hooks/useQuestionBank";
import SkeletonCard from "@/components/SkeletonCard";
import AdminQuestionCard from "../AdminQuestionCardView";
import QuestionListPagination from "@/components/QuestionListPagination";
import { QuestionFilter } from "@/components/list/QuestionFilter";
import CustomDrawer from "../Drawer";

interface QuestionListProps {
    filters?: QuestionFilters;
}

function QuestionList({ filters }: QuestionListProps) {
    const [cursorsStack, setCursorsStack] = useState<(string | undefined)[]>([undefined]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // Reset pagination when search filters change
    useEffect(() => {
        setCursorsStack([undefined]);
        setCurrentPageIndex(0);
    }, [filters?.search, filters?.category, filters?.difficulty, filters?.type, filters?.status]);

    const currentCursor = cursorsStack[currentPageIndex];

    const { data, isLoading: loading, error, refetch: fetchQuestions } = useQuestionBank({
        ...filters,
        cursor: currentCursor,
        limit: 9, // Fit grid columns perfectly (3 cols)
    });

    const { questions = [], hasNextPage, nextCursor } = data ?? {};

    const handleNext = () => {
        if (hasNextPage && nextCursor) {
            setCursorsStack((prev) => {
                const nextStack = [...prev];
                nextStack[currentPageIndex + 1] = nextCursor;
                return nextStack;
            });
            setCurrentPageIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex((prev) => prev - 1);
        }
    };

    return (
        <>
            {/* ── Loading skeleton ── */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* ── Error state ── */}
            {error && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 py-16 text-center">
                    <AlertCircle size={36} className="text-[#A70202]" />
                    <div>
                        <p className="font-semibold text-gray-800">Something went wrong</p>
                        <p className="text-sm text-gray-500 mt-1">{error instanceof Error ? error.message : "Failed to fetch questions."}</p>
                    </div>
                    <button
                        onClick={() => fetchQuestions()}
                        className="mt-2 rounded-xl bg-[#A70202] px-5 py-2 text-sm font-medium text-white hover:bg-[#8f0101] transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ── Data layout ── */}
            
                <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
                    {/* Summary bar */}
                    <div className="flex items-center justify-between w-full">
                        {questions.length > 0 && !loading && !error && (
                        <span className="rounded-full px-3 py-0.5 text-sm font-medium text-gray-500">
                            Showing {questions.length} question{questions.length !== 1 ? "s" : ""}
                        </span>
                        )}

                        {/* Mobile Filters Trigger */}
                        <div className="lg:hidden">
                            <CustomDrawer
                                drawerTriggerIcon={<SlidersHorizontal size={14} />}
                                drawerTitleIcon={<SlidersHorizontal size={14} />}
                                drawerTriggerName="Filters"
                                drawerDescription="Refine the list of exam questions."
                                buttonClassName="bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] "
                            >
                                <QuestionFilter />
                            </CustomDrawer>
                        </div>
                    </div>

                    {/* ── Empty state (no data at all) ── */}
                    {questions.length === 0 && !loading && !error && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                            <FileQuestion size={36} className="text-gray-300" />
                            <p className="font-semibold text-gray-600">No questions yet</p>
                            <p className="text-sm text-gray-400">Add your first question to get started.</p>
                        </div>
                    )}

                    {/* List grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {questions.map((question) => (
                            <AdminQuestionCard 
                                key={question.id} 
                                item={question} 
                                onView={(id) => console.log('View', id)} 
                                onDelete={(id) => console.log('Delete', id)} 
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <QuestionListPagination
                        currentPage={currentPageIndex + 1}
                        hasNextPage={hasNextPage}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                </div>
            
        </>
    );
}

export default QuestionList;