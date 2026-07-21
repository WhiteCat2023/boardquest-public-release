import QuestionList from "./components/list/QuestionList";
import CategoriesView from "./components/CategoriesView";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { Search, X } from "lucide-react";
import AddQuestionButton from "../../../components/custom/button/AddQuestionButton";
import { Input } from "../../../components/ui/input";
import FilterDropdown from "./components/dropdown/Filter";
import { Separator } from "../../../components/ui/separator";
import { useSearchParams } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

function QuestionBank() {
    const [searchParams] = useSearchParams();
    const view = searchParams.get("view") || "bank";
    const { auth } = useAuth();
    const currentUserId = (auth as any)?.data?.user?.id;

    const {
        search,
        setSearch,
        selectedCategory,
        selectedDifficulty,
        selectedType,
    } = useQuestionBankFilterStore();

    // Compile dynamic filters based on active sidebar view
    const filters: any = {
        search,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        type: selectedType,
    };

    if (view === "my-questions") {
        filters.authorId = currentUserId;
    } else if (view === "published") {
        filters.isPublished = true;
    } else if (view === "revisions") {
        filters.status = "NEEDS_REVISION";
        // Teachers are restricted to their own revisions
        if ((auth as any)?.data?.user?.role === "TEACHER") {
            filters.authorId = currentUserId;
        }
    } else {
        // Default: display general APPROVED question bank pool
        filters.status = "APPROVED";
    }

    const getViewTitleAndDesc = () => {
        switch (view) {
            case "my-questions":
                return {
                    title: "My Questions",
                    desc: "Browse and manage draft questions authored by you."
                };
            case "published":
                return {
                    title: "Published Questions",
                    desc: "Questions currently active and visible to students."
                };
            case "revisions":
                return {
                    title: "Revision Desk",
                    desc: "Questions flagged by administrators requiring review edits."
                };
            case "categories":
                return {
                    title: "Subject Categories",
                    desc: "Browse and manage evaluation subject categories across the curriculum."
                };
            case "bank":
            default:
                return {
                    title: "Question Bank Pool",
                    desc: "Browse and manage all approved evaluation questions."
                };
        }
    };

    const header = getViewTitleAndDesc();

    return (
        <div className="flex flex-col gap-6 p-8 w-full min-h-full">
            {/* Page header */}
            <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 transition-colors duration-200 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {header.title}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {header.desc}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {view !== "categories" && <AddQuestionButton />}
                </div>
            </div>

            {view === "categories" ? (
                <CategoriesView />
            ) : (
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
            )}
        </div>
    );
}

export default QuestionBank;