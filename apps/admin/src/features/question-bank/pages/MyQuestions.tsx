import { useState } from "react";
import QuestionList from "../components/list/QuestionList";
import { QuestionFilter } from "../components/QuestionFilter";
import useAuth from "@/hooks/useAuth";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import { useSubjectNavCategories } from "../api/useSubjectNavCategories";
import {
  SubjectNavSidebar,
  MobileSubjectSelector,
  QuestionLibraryHeader,
} from "../components/sidebar";

export default function MyQuestions() {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId =
    currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;

  const [isSubjectSidebarOpen, setIsSubjectSidebarOpen] = useState(true);

  const {
    search,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    selectedType,
    selectedStatus,
  } = useQuestionBankFilterStore();

  const {
    categories,
    categorySearch,
    setCategorySearch,
    getCategoryQuestionCount,
    totalAllQuestionsCount,
    badgeLabel,
  } = useSubjectNavCategories({ authorId: currentUserId });

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

      {/* Main Panel: My Questions Content */}
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
          title="My Questions"
          description="Browse and manage draft questions authored by you."
          badgeLabel={badgeLabel}
          isSidebarOpen={isSubjectSidebarOpen}
          onOpenSidebar={() => setIsSubjectSidebarOpen(true)}
        />

        {/* Question Filter & Question List */}
        <div className="space-y-4 animate-in fade-in duration-150">
          <QuestionFilter view="my-questions" />
          <QuestionList filters={filters} />
        </div>
      </main>
    </div>
  );
}
