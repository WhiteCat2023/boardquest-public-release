import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  RotateCcw,
  RotateCw,
  ListFilter,
  Layers,
  HelpCircle,
  Tag,
  Check,
  ChevronDown,
} from "lucide-react";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { useTopics } from "../api/useTopics";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSearchParams } from "react-router-dom";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { showFeedback } from "@/components/modal";
import { cn } from "@/lib/utils";

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
    selectedCategory,
    selectedTopic,
    setSelectedTopic,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
  } = useQuestionBankFilterStore();

  const { data: rawTopics = [], isLoading: isTopicsLoading } =
    useTopics(selectedCategory);

  const topics = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    for (const t of rawTopics) {
      const name = (t.name || "").trim();
      if (!name) continue;
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push({ id: t.id || name, name });
      }
    }
    return list;
  }, [rawTopics]);

  // Local popover state for drafting filter selections
  const [isOpen, setIsOpen] = useState(false);
  const [tempTopic, setTempTopic] = useState(selectedTopic);
  const [tempDifficulty, setTempDifficulty] = useState(selectedDifficulty);
  const [tempType, setTempType] = useState(selectedType);

  // Search inside Topic dropdown
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");

  // Sync drafted filters with store values whenever popover opens or store changes
  useEffect(() => {
    if (isOpen) {
      setTempTopic(selectedTopic);
      setTempDifficulty(selectedDifficulty);
      setTempType(selectedType);
    }
  }, [isOpen, selectedTopic, selectedDifficulty, selectedType]);

  // Reset topic search query when topic dropdown closes
  useEffect(() => {
    if (!isTopicOpen) {
      setTopicSearch("");
    }
  }, [isTopicOpen]);

  // Filter topics by topicSearch query
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return topics;
    const q = topicSearch.toLowerCase().trim();
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [topics, topicSearch]);

  const hasCustomTopic =
    tempTopic &&
    !topics.some((t) => t.name.toLowerCase() === tempTopic.toLowerCase()) &&
    (!topicSearch.trim() ||
      tempTopic.toLowerCase().includes(topicSearch.toLowerCase().trim()));

  const activeFilterCount = [
    selectedTopic,
    selectedDifficulty,
    selectedType,
  ].filter(Boolean).length;

  const handleApply = () => {
    setSelectedTopic(tempTopic);
    setSelectedDifficulty(tempDifficulty);
    setSelectedType(tempType);
    setIsTopicOpen(false);
    setTopicSearch("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempTopic("");
    setTempDifficulty("");
    setTempType("");
    setSelectedTopic("");
    setSelectedDifficulty("");
    setSelectedType("");
    setIsTopicOpen(false);
    setTopicSearch("");
    setIsOpen(false);
  };

  const resetAllFilters = () => {
    setSearch("");
    setTempTopic("");
    setTempDifficulty("");
    setTempType("");
    setSelectedTopic("");
    setSelectedDifficulty("");
    setSelectedType("");
    setSelectedStatus("ALL");
    setIsTopicOpen(false);
    setTopicSearch("");
  };

  const handleReload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["questions"] });
    showFeedback.success("Question bank data reloaded!");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedTopic !== "" ||
    selectedDifficulty !== "" ||
    selectedType !== "" ||
    (selectedStatus !== "" && selectedStatus !== "ALL");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs w-full font-sans">
      {/* Search Input */}
      {showSearch && (
        <div className="relative flex-1 min-w-[220px] max-w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search questions by wording, topic, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-8.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
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

      {/* Filter Popover and Actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-8.5 px-3 rounded-lg text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-colors",
                isOpen || activeFilterCount > 0
                  ? "border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <ListFilter className="size-3.5" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="size-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-72 sm:w-80 p-0 rounded-2xl shadow-xl border border-border bg-card overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/80 bg-muted/20">
              <ListFilter className="size-4 text-foreground/80 shrink-0" />
              <h4 className="text-sm font-semibold text-foreground tracking-tight">
                Select filters
              </h4>
            </div>

            {/* Filter Fields */}
            <div className="p-4 space-y-4">
              {/* Topic with Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground block">
                  Topic
                </label>
                <Popover open={isTopicOpen} onOpenChange={setIsTopicOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full h-9.5 bg-muted/20 hover:bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground px-3 flex items-center justify-between transition-colors cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-ring/20 focus:border-primary"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                        <Tag className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {tempTopic || "All Topics"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                        {tempTopic && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempTopic("");
                            }}
                            className="p-0.5 hover:text-foreground rounded-sm cursor-pointer"
                            title="Clear topic"
                          >
                            <X size={12} />
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform duration-200",
                            isTopicOpen && "rotate-180"
                          )}
                        />
                      </div>
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={4}
                    className="w-[256px] sm:w-[288px] p-0 z-70 rounded-xl shadow-2xl border border-border bg-popover overflow-hidden text-popover-foreground font-sans"
                  >
                    {/* Search Input Bar */}
                    <div className="p-2 border-b border-border/80 bg-muted/20">
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Search topic..."
                          value={topicSearch}
                          onChange={(e) => setTopicSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (filteredTopics.length > 0) {
                                setTempTopic(filteredTopics[0].name);
                                setIsTopicOpen(false);
                                setTopicSearch("");
                              }
                            }
                          }}
                          autoFocus
                          className="h-7.5 pl-8 pr-7 text-xs bg-background border-border rounded-lg placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary w-full"
                        />
                        {topicSearch && (
                          <button
                            type="button"
                            onClick={() => setTopicSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Topic Options List */}
                    <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 text-xs">
                      {/* "All Topics" option */}
                      {(!topicSearch.trim() ||
                        "all topics".includes(
                          topicSearch.toLowerCase().trim()
                        )) && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempTopic("");
                            setIsTopicOpen(false);
                            setTopicSearch("");
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs",
                            !tempTopic
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span>All Topics</span>
                          {!tempTopic && (
                            <Check className="size-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      )}

                      {/* Custom topic if currently set and matching search */}
                      {hasCustomTopic && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsTopicOpen(false);
                            setTopicSearch("");
                          }}
                          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs bg-primary/10 text-primary font-semibold"
                        >
                          <span className="truncate">{tempTopic}</span>
                          <Check className="size-3.5 text-primary shrink-0" />
                        </button>
                      )}

                      {isTopicsLoading ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          Loading topics...
                        </div>
                      ) : filteredTopics.length === 0 &&
                        !hasCustomTopic &&
                        topicSearch.trim() ? (
                        <div className="py-6 px-3 text-center text-xs text-muted-foreground">
                          No topics found matching &quot;{topicSearch}&quot;
                        </div>
                      ) : (
                        filteredTopics.map((t) => {
                          const isSelected = tempTopic === t.name;
                          return (
                            <button
                              key={t.id || t.name}
                              type="button"
                              onClick={() => {
                                setTempTopic(t.name);
                                setIsTopicOpen(false);
                                setTopicSearch("");
                              }}
                              className={cn(
                                "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs",
                                isSelected
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-foreground hover:bg-muted/60"
                              )}
                            >
                              <span className="truncate">{t.name}</span>
                              {isSelected && (
                                <Check className="size-3.5 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground block">
                  Difficulty
                </label>
                <Select
                  value={tempDifficulty || "ALL"}
                  onValueChange={(val) =>
                    setTempDifficulty(val === "ALL" ? "" : val)
                  }
                >
                  <SelectTrigger className="w-full h-9.5 bg-muted/20 border-border rounded-xl text-xs font-medium text-foreground px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="size-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="All Difficulties" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-70 rounded-xl">
                    <SelectItem value="ALL">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy Level</SelectItem>
                    <SelectItem value="MEDIUM">Medium Level</SelectItem>
                    <SelectItem value="HARD">Hard Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground block">
                  Question type
                </label>
                <Select
                  value={tempType || "ALL"}
                  onValueChange={(val) =>
                    setTempType(val === "ALL" ? "" : val)
                  }
                >
                  <SelectTrigger className="w-full h-9.5 bg-muted/20 border-border rounded-xl text-xs font-medium text-foreground px-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <HelpCircle className="size-3.5 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="All Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-70 rounded-xl">
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 pt-1 flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex-1 h-9 rounded-xl border-border text-xs font-semibold text-foreground hover:bg-muted/50 cursor-pointer"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer"
              >
                Filter Results
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset Filters Shortcut */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="h-8.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
            title="Reset all search and filters"
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
          className="h-8.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent border-border rounded-lg gap-1 cursor-pointer px-2.5 transition-all"
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
