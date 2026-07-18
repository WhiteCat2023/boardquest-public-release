import { useState, useEffect, useRef } from "react";
import { AlertCircle, FileQuestion, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { useQuestionBank, type QuestionFilters } from "@/hooks/useQuestionBank";
import AdminQuestionCard from "@/components/custom/card/AdminQuestionCardView";
import QuestionTable from "./QuestionTable";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";

import QuestionListPagination from "@/components/custom/pagination/QuestionListPagination";
import { QuestionFilter } from "@/view/admin/question_bank/components/QuestionFilter";
import CustomDrawer from "@/components/custom/drawer/Drawer";

interface QuestionListProps {
    filters?: QuestionFilters;
}

function QuestionList({ filters }: QuestionListProps) {
    const [cursorsStack, setCursorsStack] = useState<(string | undefined)[]>([undefined]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    const pendingDeletes = useRef<{ [id: string]: NodeJS.Timeout }>({});

    // Clean up timeouts on unmount and execute any pending deletes
    useEffect(() => {
        return () => {
            Object.keys(pendingDeletes.current).forEach((id) => {
                const tId = pendingDeletes.current[id];
                clearTimeout(tId);
                axiosPrivate.delete(`/questions/${id}`).catch((err) => {
                    console.error("Failed to execute pending delete on unmount:", err);
                });
            });
        };
    }, [axiosPrivate]);

    const handleDelete = (id: string) => {
        const queryKey = ["questions", { ...filters, cursor: currentCursor, limit: 9 }];
        
        // Save the previous state for potential rollback
        const previousData = queryClient.getQueryData<any>(queryKey);
        if (!previousData) return;

        const questionObj = previousData.questions.find((q: any) => q.id === id);
        const questionText = questionObj?.question || "Selected question";

        // Optimistically update local cache
        const updatedQuestions = previousData.questions.filter((q: any) => q.id !== id);
        queryClient.setQueryData(queryKey, {
            ...previousData,
            questions: updatedQuestions,
        });

        // Set a timeout of 4 seconds to execute the delete API request
        const timeoutId = setTimeout(async () => {
            delete pendingDeletes.current[id];
            try {
                await axiosPrivate.delete(`/questions/${id}`);
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to delete question permanently.");
                // Rollback on error
                queryClient.setQueryData(queryKey, previousData);
            }
        }, 4000);

        pendingDeletes.current[id] = timeoutId;

        // Trigger Sonner toast with the reusable showUndoToast helper
        showUndoToast({
            title: "Question Deleted",
            message: questionText,
            onUndo: () => {
                const tId = pendingDeletes.current[id];
                if (tId) {
                    clearTimeout(tId);
                    delete pendingDeletes.current[id];
                }
                // Restore previous cache data
                queryClient.setQueryData(queryKey, previousData);
                toast.success("Delete action undone.");
            },
            duration: 4000,
        });
    };

    const handleView = (id: string) => {
        navigate(`/question-bank/view/${id}`);
    };

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
        {/* ── Error state ── */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 py-16 text-center">
            <AlertCircle size={36} className="text-[#A70202]" />
            <div>
              <p className="font-semibold text-gray-800">
                Something went wrong
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch questions."}
              </p>
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
        <phantom-ui loading={loading}>
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            {/* Summary bar */}
            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-4">
              {questions.length > 0 && !loading && !error ? (
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/50">
                  Showing {questions.length} question
                  {questions.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3" data-shimmer-ignore>
                {/* View Switcher Toggle */}
                {questions.length > 0 && !loading && !error && (
                  <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === "table"
                          ? "bg-white text-[#A70202] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Table View"
                    >
                      <List size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white text-[#A70202] shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid size={14} />
                    </button>
                  </div>
                )}

                {/* Mobile Filters Trigger */}
                <div className="lg:hidden" data-shimmer-ignore>
                  <CustomDrawer
                    drawerTriggerIcon={<SlidersHorizontal size={14} />}
                    drawerTitleIcon={<SlidersHorizontal size={14} />}
                    drawerTriggerName="Filters"
                    drawerDescription="Refine the list of exam questions."
                    buttonClassName="bg-[#A70202] text-white hover:bg-white hover:text-[#A70202] hover:border-[#A70202] h-9 px-3 rounded-xl text-xs font-semibold"
                  >
                    <QuestionFilter />
                  </CustomDrawer>
                </div>
              </div>
            </div>

            {/* ── Empty state (no data at all) ── */}
            {questions.length === 0 && !loading && !error && (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                <FileQuestion size={36} className="text-gray-300" />
                <p className="font-semibold text-gray-600">No questions yet</p>
                <p className="text-sm text-gray-400">
                  Add your first question to get started.
                </p>
              </div>
            )}

            {/* Data display grid / table */}
            {questions.length > 0 &&
              !loading &&
              !error &&
              (viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {questions.map((question) => (
                    <AdminQuestionCard
                      key={question.id}
                      item={question}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <QuestionTable
                  questions={questions}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}

            {/* Pagination */}
            <QuestionListPagination
              currentPage={currentPageIndex + 1}
              hasNextPage={!!hasNextPage}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        </phantom-ui>
      </>
    );
}

export default QuestionList;