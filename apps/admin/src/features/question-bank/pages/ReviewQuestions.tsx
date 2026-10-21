import { useState, useEffect, useMemo } from "react";
import {
  usePendingReviewAuthors,
  useQuestionBank,
  FastReviewWorkspace,
  ReviewQuestionsTable,
  AuthorsSidebar,
  ReviewAuthorHeader,
  ReviewFiltersToolbar,
  ApproveAuthorQuestionsDialog,
} from "@/features/question-bank";
import { type Question } from "@/types/question";

export default function ReviewQuestions() {
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "workspace">("table");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  const { data: authors = [], isLoading: isAuthorsLoading } =
    usePendingReviewAuthors({
      search: authorSearch,
    });

  // Auto-select first author when data is loaded
  useEffect(() => {
    if (authors.length > 0) {
      if (
        !selectedAuthorId ||
        !authors.some((a) => a.id === selectedAuthorId)
      ) {
        setSelectedAuthorId(authors[0].id);
      }
    } else {
      setSelectedAuthorId("");
    }
  }, [authors, selectedAuthorId]);

  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  const totalPendingAcrossAuthors = useMemo(
    () => authors.reduce((sum, a) => sum + a.pendingCount, 0),
    [authors],
  );

  // Filters for Question fetching
  const filters = useMemo(
    () => ({
      status:
        selectedStatus === "ALL"
          ? "PENDING_REVIEW,PENDING_REVISION"
          : selectedStatus,
      search: searchTerm,
      difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
      type: selectedType === "ALL" ? undefined : selectedType,
      authorId: selectedAuthorId || undefined,
      limit: 50,
    }),
    [
      selectedStatus,
      searchTerm,
      selectedDifficulty,
      selectedType,
      selectedAuthorId,
    ],
  );

  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    refetch: refetchQuestions,
  } = useQuestionBank(filters);

  const questions = questionsData?.questions || [];

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setViewMode("table");
    setSelectedQuestionId(null);
  };

  const handleSelectQuestion = (question: Question, _index: number) => {
    setSelectedQuestionId(question.id);
    setViewMode("workspace");
  };

  const handleBackToTable = () => {
    setViewMode("table");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty("ALL");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedDifficulty !== "ALL" ||
    selectedType !== "ALL" ||
    selectedStatus !== "ALL";

  return (
    <div className="flex flex-col lg:flex-row h-full flex-1 overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Submitting Authors List */}
      <AuthorsSidebar
        authors={authors}
        isLoading={isAuthorsLoading}
        selectedAuthorId={selectedAuthorId}
        onSelectAuthor={handleSelectAuthor}
        search={authorSearch}
        onSearchChange={setAuthorSearch}
      />

      {/* Main Panel: Review Desk Content */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        {/* Selected Author Header Banner */}
        <ReviewAuthorHeader
          selectedAuthor={selectedAuthor}
          totalPendingAcrossAuthors={totalPendingAcrossAuthors}
          onApproveAllForAuthor={() => setIsApproveModalOpen(true)}
        />

        {/* Search & Filter Controls */}
        <ReviewFiltersToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasQuestions={questions.length > 0}
        />

        {/* Content: Table or Fast Review Workspace */}
        <div className="space-y-3 min-w-0">
          {viewMode === "table" ? (
            <ReviewQuestionsTable
              questions={questions}
              isLoading={isQuestionsLoading}
              onSelectQuestion={handleSelectQuestion}
              selectedAuthor={selectedAuthor}
              onRefresh={refetchQuestions}
            />
          ) : (
            <FastReviewWorkspace
              questions={questions}
              isLoading={isQuestionsLoading}
              onRefresh={refetchQuestions}
              selectedAuthor={selectedAuthor}
              initialQuestionId={selectedQuestionId}
              onBackToTable={handleBackToTable}
            />
          )}
        </div>
      </main>

      {/* Approve All Author Questions Modal */}
      <ApproveAuthorQuestionsDialog
        isOpen={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        author={selectedAuthor || null}
      />
    </div>
  );
}
