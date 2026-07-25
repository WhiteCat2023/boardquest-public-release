import { Search, X } from "lucide-react";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
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

import { useSearchParams } from "react-router-dom";

export function QuestionFilter({ showSearch = true }: { showSearch?: boolean } = {}) {
    const [searchParams] = useSearchParams();
    const view = searchParams.get("view") || "bank";

    const { 
        search, 
        setSearch, 
        selectedDifficulty, 
        setSelectedDifficulty, 
        selectedType, 
        setSelectedType, 
        selectedStatus, 
        setSelectedStatus } = useQuestionBankFilterStore();

    const clearFilters = () => {
        setSearch("");
        setSelectedDifficulty("");
        setSelectedType("");
        setSelectedStatus("");
    };

    return (
        <FieldGroup className="font-sans">
            {!showSearch && (
                <div className="flex items-center justify-between w-full pb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filters</span>
                    {(search || selectedDifficulty || selectedType || selectedStatus) && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={clearFilters}
                            className="text-[10px] font-bold text-primary hover:text-primary/90 uppercase tracking-wider transition-all duration-150 cursor-pointer p-0 h-auto"
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
                        <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Search
                        </FieldLabel>
                        {(search || selectedDifficulty || selectedType || selectedStatus) && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={clearFilters}
                                className="text-[10px] font-bold text-primary hover:text-primary/90 uppercase tracking-wider transition-all duration-150 cursor-pointer"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search text, topic, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 h-10 bg-card border border-border rounded-xl text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground transition-all duration-150"
                        />
                        {search && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={14} />
                            </Button>
                        )}
                    </div>
                </Field>
            )}

            {/* Difficulty Buttons */}
            <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Difficulty
                </FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(QUESTION_DIFFICULTY).map((diff, index) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDifficulty(isSelected ? "" : diff)}
                                className={`px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer ${
                                    isSelected
                                        ? "bg-primary/10 border-primary text-primary shadow-sm font-bold"
                                        : "bg-muted border-border text-muted-foreground hover:bg-accent hover:text-foreground"
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
                <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Question Type
                </FieldLabel>
                <Select
                    value={selectedType || "all"}
                    onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}
                >
                    <SelectTrigger className="w-full h-10 bg-muted border-border rounded-xl focus:bg-card focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all duration-150 text-foreground">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
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
            {(view === "bank" || view === "my-questions") && (
                <Field>
                    <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Status
                    </FieldLabel>
                    <Select
                        value={selectedStatus || "all"}
                        onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}
                    >
                        <SelectTrigger className="w-full h-10 bg-muted border-border rounded-xl focus:bg-card focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all duration-150 text-foreground">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent position="popper" align="start">
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.values(QUESTION_STATUS).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            )}
        </FieldGroup>
    );
}
