import QuestionList from "./components/list/QuestionList";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { Search, X } from "lucide-react";
import AddQuestionButton from "../../../components/custom/button/AddQuestionButton";
import { Input } from "../../../components/ui/input";
import FilterDropdown from "./components/dropdown/Filter";
import { Separator } from "../../../components/ui/separator";

function QuestionBank() {
    const {
        search,
        setSearch,
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

    const activeFilterCount = [
        selectedCategory,
        selectedDifficulty,
        selectedType,
        selectedStatus,
    ].filter(Boolean).length;

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

            <div>
                <div className="flex gap-2 items-center w-full max-w-2xl mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <Input
                            type="text"
                            placeholder="Search questions by wording, topic, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 h-10 w-full bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                    <FilterDropdown />
                </div>
                <Separator />
                <QuestionList filters={filters} />
            </div>

            {/* <div className="flex flex-col lg:flex-row gap-6 items-start w-full"> */}
                {/* Desktop Sidebar filter column */}
                {/* <div className="hidden lg:flex flex-col gap-3 w-64 shrink-0 sticky top-28 max-h-[calc(100vh-9rem)]">
                    <div className="flex gap-2 items-center font-semibold text-slate-800 px-1">
                        <FilterIcon size={14} className="text-[#A70202] transition-colors duration-200" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters</span>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 overflow-y-auto">
                        <QuestionFilter />
                    </div>
                </div> */}
                

                {/* List column */}
                {/* <div className="flex-1 w-full">
                    <QuestionList filters={filters} />
                </div> */}
            {/* </div> */}
        </div>
    );
}

export default QuestionBank;