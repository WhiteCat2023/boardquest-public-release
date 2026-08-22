import { useState, useEffect } from "react";
import QuestionList from "../components/list/QuestionList";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import {
  Search,
  X,
  BookOpen,
  Grid,
  ChevronRight,
} from "lucide-react";
import AddQuestionButton from "@/components/custom/button/AddQuestionButton";
import { Input } from "@/components/ui/input";
import { QuestionFilter } from "../components/QuestionFilter";
import useAuth from "@/hooks/useAuth";
import { useCategories } from "@/features/faculty";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyQuestions() {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId =
    currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;
  const [categorySearch, setCategorySearch] = useState("");

  const {
    search,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    selectedType,
    selectedStatus,
  } = useQuestionBankFilterStore();

  const filters: any = {
    search,
    category:
      selectedCategory === "ALL" || !selectedCategory
        ? undefined
        : selectedCategory,
    difficulty: selectedDifficulty,
    type: selectedType,
    authorId: currentUserId,
  };

  if (selectedStatus && selectedStatus !== "ALL") {
    filters.status = selectedStatus;
  }

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories({
      status: filters.status,
      authorId: filters.authorId,
      search: categorySearch,
    });

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategory("ALL");
    }
  }, [selectedCategory, setSelectedCategory]);

  const activeCategoryObj = categories.find(
    (cat: any) => cat.id === selectedCategory,
  );

  const filteredCategories = categories;

  const getCategoryQuestionCount = (cat: any) => {
    if (typeof cat.questionCount === "number") {
      return cat.questionCount;
    }
    if (!cat.questions || !Array.isArray(cat.questions)) return 0;
    return cat.questions.length;
  };

  const totalAllQuestionsCount = categories.reduce(
    (sum: number, cat: any) => sum + getCategoryQuestionCount(cat),
    0,
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Compact Subject Navigation Menu (Desktop Only) */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-3.5 px-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <BookOpen size={16} />
              </div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Subjects ({categories.length})
              </h2>
            </div>
            {selectedCategory && selectedCategory !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Compact Subject Search */}
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
            <Input
              type="text"
              placeholder="Filter subjects..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-8 pr-7 h-7.5 text-xs bg-muted/40 border border-border rounded-lg focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            {categorySearch && (
              <button
                type="button"
                onClick={() => setCategorySearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Compact List Menu */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* All Subjects Item */}
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
              selectedCategory === "ALL" || !selectedCategory
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Grid size={14} className="shrink-0" />
              <span className="truncate">All Subjects</span>
            </div>
            <Badge
              variant="outline"
              className={`text-[9.5px] font-mono font-bold px-1.5 py-0 rounded-md shrink-0 ${
                selectedCategory === "ALL" || !selectedCategory
                  ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {totalAllQuestionsCount}
            </Badge>
          </button>

          {/* Loading Skeletons */}
          {isCategoriesLoading ? (
            <div className="space-y-1 pt-1">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8.5 w-full rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground italic">
              No matching subjects found.
            </div>
          ) : (
            filteredCategories.map((cat: any) => {
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryQuestionCount(cat);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 pr-1">
                    <BookOpen
                      size={13}
                      className={`shrink-0 ${isSelected ? "text-primary-foreground" : "text-primary/70"}`}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0 rounded-md ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {count}
                    </Badge>
                    {isSelected && (
                      <ChevronRight
                        size={12}
                        className="text-primary-foreground shrink-0"
                      />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Panel: My Questions Content */}
      <main className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Mobile & Tablet Subject Selector Dropdown */}
        <div className="lg:hidden flex flex-col gap-1.5 p-3 rounded-2xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={13} className="text-primary" /> Subject Filter ({categories.length})
            </span>
            {selectedCategory && selectedCategory !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className="text-[10.5px] font-bold text-primary hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <Select
            value={selectedCategory || "ALL"}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-full h-9 text-xs font-semibold bg-background border-border rounded-xl">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="ALL">
                <span className="font-bold flex items-center gap-2">
                  <span>All Subjects</span>
                  <span className="text-[10px] font-mono font-normal text-muted-foreground">({totalAllQuestionsCount})</span>
                </span>
              </SelectItem>
              {categories.map((cat: any) => {
                const count = getCategoryQuestionCount(cat);
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">({count})</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              My Questions
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border-primary/20 shadow-2xs"
              >
                <BookOpen size={13} />
                {selectedCategory === "ALL" || !selectedCategory
                  ? "All Subjects"
                  : activeCategoryObj?.name || "Subject Filter"}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Browse and manage draft questions authored by you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AddQuestionButton />
          </div>
        </div>

        {/* Question Filter & Question List */}
        <div className="space-y-4 animate-in fade-in duration-150">
          <QuestionFilter view="my-questions" />
          <QuestionList
            filters={filters}
            isLiveView={false}
            isBankView={false}
          />
        </div>
      </main>
    </div>
  );
}
