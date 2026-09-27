import React from "react";
import { Search, X, BookOpen, PanelLeftClose } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SubjectNavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  totalQuestionsCount: number;
  getQuestionCount: (cat: any) => number;
}

export function SubjectNavSidebar({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  totalQuestionsCount,
  getQuestionCount,
}: SubjectNavSidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex-col h-full animate-in slide-in-from-left-2 duration-200 font-sans">
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
                onClick={() => onSelectCategory("ALL")}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
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
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-7 h-7.5 text-xs bg-muted/40 border border-border rounded-lg focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
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
          onClick={() => onSelectCategory("ALL")}
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
            {totalQuestionsCount}
          </span>
        </button>

        {/* Filtered Subject Items */}
        {categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No subjects found
          </div>
        ) : (
          categories.map((cat: any) => {
            const count = getQuestionCount(cat);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
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
  );
}

export default SubjectNavSidebar;
