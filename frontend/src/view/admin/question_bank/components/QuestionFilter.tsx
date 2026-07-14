import { Search, X } from "lucide-react";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { QUESTION_DIFFICULTY, QUESTION_STATUS, QUESTION_TYPE } from "@/enums/QuestionBank";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function QuestionFilter({ showSearch = true }: { showSearch?: boolean } = {}) {
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

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSelectedDifficulty("");
        setSelectedType("");
        setSelectedStatus("");
    };

    return (
        <FieldGroup>
            {!showSearch && (
                <div className="flex items-center justify-between w-full pb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</span>
                    {(search || selectedCategory || selectedDifficulty || selectedType || selectedStatus) && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={clearFilters}
                            className="text-[10px] font-bold text-[#A70202] hover:text-[#c40303] uppercase tracking-wider transition-all duration-150 cursor-pointer p-0 h-auto"
                        >
                            Reset Filters
                        </Button>
                    )}
                </div>
            )}

            {/* Search Input */}
            {showSearch && (
                <Field>
                    <div className="flex items-center justify-between w-full">
                        <FieldLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Search
                        </FieldLabel>
                        {(search || selectedCategory || selectedDifficulty || selectedType || selectedStatus) && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={clearFilters}
                                className="text-[10px] font-bold text-[#A70202] hover:text-[#c40303] uppercase tracking-wider transition-all duration-150 cursor-pointer"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search text, topic, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 h-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={14} />
                            </Button>
                        )}
                    </div>
                </Field>
            )}

            {/* Category Select */}
            <Field>
                <FieldLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                </FieldLabel>
                <Select
                    value={selectedCategory || "all"}
                    onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
                >
                    <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150 text-slate-600">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} position="popper" align="start">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            {/* Difficulty Buttons */}
            <Field>
                <FieldLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Difficulty
                </FieldLabel>
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
                                {diff as string}
                            </button>
                        );
                    })}
                </div>
            </Field>

            {/* Question Type Select */}
            <Field>
                <FieldLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question Type
                </FieldLabel>
                <Select
                    value={selectedType || "all"}
                    onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}
                >
                    <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150 text-slate-600">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} position="popper" align="start">
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.values(QUESTION_TYPE).map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            {/* Status Select */}
            <Field>
                <FieldLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                </FieldLabel>
                <Select
                    value={selectedStatus || "all"}
                    onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}
                >
                    <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150 text-slate-600">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} position="popper" align="start">
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(QUESTION_STATUS).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        </FieldGroup>
    );
}
