import QuestionList from "./components/list/QuestionList";
import { QuestionFilter } from "./components/QuestionFilter";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { FilterIcon, PlusCircleIcon, RefreshCw, SlidersHorizontal } from "lucide-react";
import AddQuestionButton from "@/components/custom/button/AddQuestionButton";

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

    return (
        <div className="flex flex-col gap-6 p-8 w-full min-h-full">
            {/* Page header */}
            <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 transition-colors duration-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Question Bank
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Browse and manage all exam questions.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AddQuestionButton />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                {/* Desktop Sidebar filter column */}
                <div className="hidden lg:flex flex-col gap-3 w-64 shrink-0 sticky top-28 max-h-[calc(100vh-9rem)]">
                    <div className="flex gap-2 items-center font-semibold text-slate-800 px-1">
                        <FilterIcon size={14} className="text-[#A70202] transition-colors duration-200" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters</span>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 overflow-y-auto">
                        <QuestionFilter />
                    </div>
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