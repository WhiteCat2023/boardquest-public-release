import { useState, useEffect } from "react";
import QuestionList from "../components/list/QuestionList";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { Search, X, BookOpen, Grid, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AddQuestionButton from "@/components/custom/button/AddQuestionButton";
import { Input } from "@/components/ui/input";
import { QuestionFilter } from "../components/QuestionFilter";
import useAuth from "@/hooks/useAuth";
import { useSubjects } from "@/features/users";
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
    status:
      selectedStatus === "ALL" || !selectedStatus ? undefined : selectedStatus,
    authorId: currentUserId,
  };

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useSubjects({
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

  const [isSubjectSidebarOpen, setIsSubjectSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col lg:flex-row h-full flex-1 overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Compact Subject Navigation Menu (Desktop Only) */}
      {isSubjectSidebarOpen && (
        <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex-col h-full animate-in slide-in-from-left-2 duration-200">
          {/* Sidebar Header */}
          <div className="p-3 px-3.5 border-b border-border bg-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <BookOpen size={14} />
                </div>
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                  Subjects ({categories.length})
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedCategory && selectedCategory !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSubjectSidebarOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                  title="Hide subjects panel"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>
            </div>

            {/* Compact Subject Search */}
            <div className="relative mt-2">
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
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {/* All Subjects Item */}
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                selectedCategory === "ALL" || !selectedCategory
                  ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <BookOpen size={14} className="shrink-0" />
                <span className="truncate">All Subjects</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  selectedCategory === "ALL" || !selectedCategory
                    ? "bg-primary/20 text-primary font-bold"
                    : "bg-muted text-muted-foreground font-medium"
                }`}
              >
                {totalAllQuestionsCount}
              </span>
            </button>

            {/* Filtered Subject Items */}
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No subjects found
              </div>
            ) : (
              filteredCategories.map((cat: any) => {
                const count = getCategoryQuestionCount(cat);
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-primary/10 text-primary border-primary/25 font-semibold shadow-2xs"
                        : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen size={14} className="shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono shrink-0 ml-1.5 ${
                        isSelected
                          ? "bg-primary/20 text-primary font-bold"
                          : "bg-muted text-muted-foreground font-medium"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* Main Panel: My Questions Content */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
        {/* Mobile & Tablet Subject Selector Dropdown */}
        <div className="lg:hidden flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={13} className="text-primary" /> Subject Filter (
              {categories.length})
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
            <SelectTrigger className="w-full h-8.5 text-xs font-semibold bg-background border-border rounded-lg">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="ALL">
                <span className="font-bold flex items-center gap-2">
                  <span>All Subjects</span>
                  <span className="text-[10px] font-mono font-normal text-muted-foreground">
                    ({totalAllQuestionsCount})
                  </span>
                </span>
              </SelectItem>
              {categories.map((cat: any) => {
                const count = getCategoryQuestionCount(cat);
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ({count})
                      </span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            {!isSubjectSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSubjectSidebarOpen(true)}
                className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
                title="Show subjects panel"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                My Questions
                <Badge
                  variant="outline"
                  className="gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full border-primary/20 shadow-2xs"
                >
                  <BookOpen size={12} />
                  {selectedCategory === "ALL" || !selectedCategory
                    ? "All Subjects"
                    : activeCategoryObj?.name || "Subject Filter"}
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse and manage draft questions authored by you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <AddQuestionButton />
          </div>
        </div>

        {/* Question Filter & Question List */}
        <div className="space-y-4 animate-in fade-in duration-150">
          <QuestionFilter view="my-questions" />
          <QuestionList filters={filters} />
        </div>
      </main>
    </div>
  );
}
