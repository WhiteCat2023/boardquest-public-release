import { useState } from "react";
import QuestionList from "../components/list/QuestionList";
import { QuestionFilter } from "../components/QuestionFilter";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { useSubjectNavCategories } from "../api/useSubjectNavCategories";
import {
  SubjectNavSidebar,
  MobileSubjectSelector,
  QuestionLibraryHeader,
} from "../components/sidebar";

export default function SharedLibrary() {
  const [isSubjectSidebarOpen, setIsSubjectSidebarOpen] = useState(true);

  const {
    search,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    selectedType,
  } = useQuestionBankFilterStore();

  const {
    categories,
    categorySearch,
    setCategorySearch,
    getCategoryQuestionCount,
    totalAllQuestionsCount,
    badgeLabel,
  } = useSubjectNavCategories({ status: "APPROVED" });

  const filters: any = {
    search,
    category:
      selectedCategory === "ALL" || !selectedCategory
        ? undefined
        : selectedCategory,
    difficulty: selectedDifficulty,
    type: selectedType,
    status: "APPROVED",
  };

  return (
    <div className="flex flex-col lg:flex-row h-full flex-1 overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Compact Subject Navigation Menu (Desktop Only) */}
      <SubjectNavSidebar
        isOpen={isSubjectSidebarOpen}
        onClose={() => setIsSubjectSidebarOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        search={categorySearch}
        onSearchChange={setCategorySearch}
        totalQuestionsCount={totalAllQuestionsCount}
        getQuestionCount={getCategoryQuestionCount}
      />

      {/* Main Panel: Question Library Content */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col p-3.5 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
        {/* Mobile & Tablet Subject Selector Dropdown */}
        <MobileSubjectSelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalQuestionsCount={totalAllQuestionsCount}
          getQuestionCount={getCategoryQuestionCount}
        />

        {/* Page Header */}
        <QuestionLibraryHeader
          title="All Questions"
          description="Browse and manage approved evaluation questions across all subjects."
          badgeLabel={badgeLabel}
          isSidebarOpen={isSubjectSidebarOpen}
          onOpenSidebar={() => setIsSubjectSidebarOpen(true)}
        />

        {/* Question Filter & Question List */}
        <div className="space-y-4 animate-in fade-in duration-150">
          <QuestionFilter view="bank" />
          <QuestionList filters={filters} />
        </div>
      </main>
    </div>
  );
}
