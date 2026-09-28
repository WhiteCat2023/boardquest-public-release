import { useState, useEffect } from "react";
import { useSubjects } from "@/features/users";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";

interface UseSubjectNavCategoriesOptions {
  authorId?: string;
  status?: string;
}

export function useSubjectNavCategories(
  options?: UseSubjectNavCategoriesOptions,
) {
  const [categorySearch, setCategorySearch] = useState("");
  const { selectedCategory, setSelectedCategory } =
    useQuestionBankFilterStore();

  const { data: categories = [], isLoading } = useSubjects({
    authorId: options?.authorId,
    status: options?.status,
    search: categorySearch,
    all: !options?.authorId,
  });

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategory("ALL");
    }
  }, [selectedCategory, setSelectedCategory]);

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

  const activeCategoryObj = categories.find(
    (cat: any) => cat.id === selectedCategory,
  );

  const badgeLabel =
    selectedCategory === "ALL" || !selectedCategory
      ? "All Subjects"
      : activeCategoryObj?.name || "Subject Filter";

  return {
    categories,
    isLoading,
    categorySearch,
    setCategorySearch,
    selectedCategory,
    setSelectedCategory,
    getCategoryQuestionCount,
    totalAllQuestionsCount,
    activeCategoryObj,
    badgeLabel,
  };
}

export default useSubjectNavCategories;
