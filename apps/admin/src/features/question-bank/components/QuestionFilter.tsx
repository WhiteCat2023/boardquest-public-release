import { Search, X, RotateCcw, RotateCw } from "lucide-react";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { toast } from "sonner";

export function QuestionFilter({
  showSearch = true,
  view: propView,
}: {
  showSearch?: boolean;
  view?: string;
} = {}) {
  const [searchParams] = useSearchParams();
  const view = propView || searchParams.get("view") || "bank";

  const queryClient = useQueryClient();
  const isFetchingQuestions = useIsFetching({ queryKey: ["questions"] }) > 0;

  const {
    search,
    setSearch,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
  } = useQuestionBankFilterStore();

  const resetFilters = () => {
    setSearch("");
    setSelectedDifficulty("");
    setSelectedType("");
    setSelectedStatus("ALL");
  };

  const handleReload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["questions"] });
    toast.success("Question bank data reloaded!");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedDifficulty !== "" ||
    selectedType !== "" ||
    (selectedStatus !== "" && selectedStatus !== "ALL");

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3.5 rounded-xl shadow-2xs w-full font-sans">
      {/* Search Input */}
      {showSearch && (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search questions by wording, topic, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-8 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Difficulty Filter */}
        <Select
          value={selectedDifficulty || "ALL"}
          onValueChange={(val) =>
            setSelectedDifficulty(val === "ALL" ? "" : val)
          }
        >
          <SelectTrigger className="h-8 w-[125px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Difficulties</SelectItem>
            <SelectItem value="EASY">Easy Level</SelectItem>
            <SelectItem value="MEDIUM">Medium Level</SelectItem>
            <SelectItem value="HARD">Hard Level</SelectItem>
          </SelectContent>
        </Select>

        {/* Question Type Filter */}
        <Select
          value={selectedType || "ALL"}
          onValueChange={(val) => setSelectedType(val === "ALL" ? "" : val)}
        >
          <SelectTrigger className="h-8 w-[135px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="MCQ">Multiple Choice</SelectItem>
            <SelectItem value="TRUE_FALSE">True / False</SelectItem>
            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        {view === "my-questions" && (
          <Select
            value={selectedStatus || "ALL"}
            onValueChange={(val) => setSelectedStatus(val)}
          >
            <SelectTrigger className="h-8 w-[145px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
              <SelectItem value="PENDING_REVISION">Pending Revision</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
          >
            <RotateCcw size={12} />
            Reset
          </Button>
        )}

        {/* Reload / Refresh Data Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReload}
          disabled={isFetchingQuestions}
          className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent border-border rounded-lg gap-1 cursor-pointer px-2.5 transition-all"
          title="Reload questions data"
        >
          <RotateCw
            size={12}
            className={isFetchingQuestions ? "animate-spin text-primary" : ""}
          />
          <span>{isFetchingQuestions ? "Reloading..." : "Reload"}</span>
        </Button>
      </div>
    </div>
  );
}
