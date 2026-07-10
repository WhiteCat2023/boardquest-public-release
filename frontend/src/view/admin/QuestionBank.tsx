
import QuestionList from "@/components/list/QuestionList";
import { QuestionFilter } from "@/components/list/QuestionFilter";
import { useQuestionBank} from "@/hooks/useQuestionBank";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { RefreshCw } from "lucide-react";

function QuestionBank() {

    const {
        search,
        selectedCategory,
        selectedDifficulty,
        selectedType,
        selectedStatus,
    } = useQuestionBankFilterStore();

    const filters = {
        search,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        type: selectedType,
        status: selectedStatus,
    };

    const { isLoading: loading, refetch: fetchQuestions } = useQuestionBank(filters);

    return (
        <div className="flex flex-col gap-6 p-8 w-full">
        {/* Page header */}
        <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Question Bank
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Browse and manage all exam questions.
                    </p>
                </div>

                {!loading && (
                    <button
                        id="question-bank-refresh-btn"
                        onClick={() => fetchQuestions()}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#A70202] transition-all duration-150 shadow-sm"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                {/* Sidebar filter column */}
                <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <QuestionFilter/>
                </div>

                {/* List column */}
                <div className="flex-1 w-full">
                    <QuestionList filters={filters} />
                </div>
            </div>
        </div>
    );
}

export default QuestionBank;