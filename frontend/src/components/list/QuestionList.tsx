import { AlertCircle, FileQuestion } from "lucide-react";
import { useQuestionBank, type QuestionFilters } from "@/hooks/useQuestionBank";
import SkeletonCard from "@/components/SkeletonCard";
import AdminQuestionCard from "../AdminQuestionCardView";   

interface QuestionListProps {
    filters?: QuestionFilters;
}

function QuestionList({ filters }: QuestionListProps) {
    const {data: questions = [], isLoading: loading, error, refetch: fetchQuestions} = useQuestionBank(filters);

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

            {/* ── Empty state (no data at all) ── */}
            {questions.length === 0 && !loading && !error && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                    <FileQuestion size={36} className="text-gray-300" />
                    <p className="font-semibold text-gray-600">No questions yet</p>
                    <p className="text-sm text-gray-400">Add your first question to get started.</p>
                </div>
            )}

            {/* ── Data layout ── */}
            {questions.length > 0 && !loading && !error && (
                <div className="flex flex-col gap-6 w-full">
                    {/* Summary bar */}
                    <div className="flex items-center justify-between">
                        <span className="rounded-full bg-[#E9B0B0] px-3 py-0.5 text-xs font-semibold text-[#A70202]">
                            {questions.length} question{questions.length !== 1 ? "s" : ""}
                        </span>
                    </div>

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
                </div>
            )}
        </>
    );
}

export default QuestionList;