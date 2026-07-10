import { Search, X } from "lucide-react";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { QUESTION_DIFFICULTY, QUESTION_STATUS, QUESTION_TYPE } from "@/enums/QuestionBank";


export function QuestionFilter() {
    const axiosPrivate = useAxiosPrivate();
    const { 
        search, 
        setSearch, 
        selectedCategory, 
        setSelectedCategory, 
        selectedDifficulty, 
        setSelectedDifficulty, 
        selectedType, 
        setSelectedType, 
        selectedStatus, 
        setSelectedStatus } = useQuestionBankFilterStore();


    const {data: categories = []} = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosPrivate.get("/questions/category/get");
            return response.data?.data?.categories ?? [];
        },
    });

    return (
        <>  
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Search
                </label>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search text, topic, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                </label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Difficulty Buttons */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(QUESTION_DIFFICULTY).map((diff, index) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDifficulty(isSelected ? "" : diff)}
                                className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                                    isSelected
                                        ? "bg-[#E9B0B0] border-[#A70202] text-[#A70202] shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                            >
                                {diff}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Question Type Select */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question Type
                </label>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                >
                    <option value="">All Types</option>
                    {Object.values(QUESTION_TYPE).map((type, index) => {
                        const isSelected = selectedType === type;
                        return (
                            <option
                                key={index}
                                value={type}
                                onClick={() => setSelectedType(isSelected ? "" : type)}
                                className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                                    isSelected
                                        ? "bg-[#E9B0B0] border-[#A70202] text-[#A70202] shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                            >
                                {type}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                </label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                >
                    <option value="">All Statuses</option>
                    {Object.values(QUESTION_STATUS).map((status, index) => {
                        const isSelected = selectedStatus === status;
                        return (
                            <option
                                key={index}
                                value={status}
                                onClick={() => setSelectedStatus(isSelected ? "" : status)}
                                className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                                    isSelected
                                        ? "bg-[#E9B0B0] border-[#A70202] text-[#A70202] shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                            >
                                {status}
                            </option>
                        );
                    })}
                </select>
            </div>
        </>
    );
}
