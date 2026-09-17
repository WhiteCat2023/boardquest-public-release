import { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Clock,
  LayoutList,
  Columns2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePendingReviewAuthors,
  useQuestionBank,
  FastReviewWorkspace,
  ReviewQuestionsTable,
} from "@/features/question-bank";
import { type Question } from "@/types/question";
import ApproveAuthorQuestionsDialog from "../components/review/ApproveAuthorQuestionsDialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useRoleFlags from "@/hooks/useRoleFlags";

export default function ReviewQuestions() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { isStaff } = useRoleFlags();

  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "workspace">("table");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const handleSelectQuestion = (question: Question, _index: number) => {
    setSelectedQuestionId(question.id);
    setViewMode("workspace");
  };

  const handleBackToTable = () => {
    setViewMode("table");
  };

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

  // Selected Author Object
  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  // Approve all questions for selected author
  const approveAuthorMutation = useMutation({
    mutationFn: async (authorId: string) => {
      const res = await axiosPrivate.get("/questions/get", {
        params: {
          status: "PENDING_REVIEW,PENDING_REVISION",
          authorId,
          limit: 100,
        },
      });
      const qList = res.data?.data?.questions || res.data?.data || [];
      const pendingReviewOnly = qList.filter(
        (q: any) => q.status === "PENDING_REVIEW",
      );
      const pendingRevisionCount = qList.length - pendingReviewOnly.length;

      if (pendingRevisionCount > 0) {
        toast.warning(
          `Warning: ${pendingRevisionCount} question(s) for this author are in Pending Revision status and cannot be approved until resubmitted.`,
        );
      }

      const ids = pendingReviewOnly.map((q: any) => q.id);
      if (ids.length === 0) {
        toast.error(
          "No questions in Pending Review status available to approve for this author.",
        );
        return;
      }
      await axiosPrivate.post("/questions/bulk/approve", { ids });
    },
    onSuccess: () => {
      toast.success("Approved all pending questions for selected author.");
      setIsApproveModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || "Failed to approve author questions.",
      );
    },
  });

  const handleApproveAllForAuthor = () => {
    if (!selectedAuthorId || !selectedAuthor) return;
    setIsApproveModalOpen(true);
  };

  const handleConfirmApproveAll = () => {
    if (!selectedAuthorId) return;
    approveAuthorMutation.mutate(selectedAuthorId);
  };

  // Authors List (filtered on backend)
  const filteredAuthors = authors;

  const totalPendingAcrossAuthors = authors.reduce(
    (sum, a) => sum + a.pendingCount,
    0,
  );

  // Filters for Question fetching
  const filters: any = {
    status:
      selectedStatus === "ALL"
        ? "PENDING_REVIEW,PENDING_REVISION"
        : selectedStatus,
    search: searchTerm,
    difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
    type: selectedType === "ALL" ? undefined : selectedType,
    authorId: selectedAuthorId || undefined,
    limit: 50,
  };

  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    refetch: refetchQuestions,
  } = useQuestionBank(filters);

  const questions = questionsData?.questions || [];

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
      {/* ── Left Sidebar: Submitting Authors List ── */}
      <aside className="w-full lg:w-64 xl:w-72 2xl:w-76 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card/60 backdrop-blur-md flex flex-col max-h-[30vh] lg:max-h-none h-auto lg:h-full">
        {/* Sidebar Header */}
        <div className="p-3.5 px-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Users size={15} />
              </div>
              <span className="text-xs font-bold text-foreground tracking-tight">
                Submitting Users
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border-border px-1.5 py-0"
            >
              {authors.length}
            </Badge>
          </div>

          {/* Search Authors Input */}
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3" />
            <Input
              type="text"
              placeholder="Filter by name, dept..."
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              className="pl-8 pr-2.5 h-7 text-[11px] bg-muted/40 border border-border rounded-lg focus:ring-1 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Authors List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {isAuthorsLoading ? (
            <div className="space-y-2 p-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14 w-full rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-2">
                <UserCheck size={20} />
              </div>
              <p className="text-xs font-bold text-foreground">
                All Submissions Cleared
              </p>
              <p className="text-[10.5px] text-muted-foreground mt-0.5 max-w-[180px]">
                No faculty members have questions awaiting review.
              </p>
            </div>
          ) : (
            filteredAuthors.map((author) => {
              const isSelected = author.id === selectedAuthorId;
              const initials = author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <button
                  key={author.id}
                  onClick={() => {
                    setSelectedAuthorId(author.id);
                    setViewMode("table");
                    setSelectedQuestionId(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group border ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 shadow-2xs"
                      : "bg-card/70 hover:bg-accent/60 border-border/70 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 border border-border shrink-0">
                      <AvatarFallback
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary transition-colors"
                        }`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-tight">
                      <span
                        className={`text-xs font-bold block truncate ${isSelected ? "text-primary font-extrabold" : "text-foreground"}`}
                      >
                        {author.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                        {author.email}
                      </span>
                      {author.latestSubmissionAt && (
                        <span className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock size={9} />
                          {new Date(
                            author.latestSubmissionAt,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          ,{" "}
                          {new Date(
                            author.latestSubmissionAt,
                          ).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 shadow-2xs ${
                      isSelected
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {author.pendingCount}
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Panel: Review Desk Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        {/* Compact Selected Author Header Banner */}
        {selectedAuthor ? (
          <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {selectedAuthor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-foreground truncate">
                    {selectedAuthor.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-[9.5px] font-semibold bg-muted text-muted-foreground border-border px-1.5 py-0"
                  >
                    {selectedAuthor.role}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {selectedAuthor.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
              <Badge
                variant="outline"
                className="text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-2.5 py-0.5 rounded-lg"
              >
                {selectedAuthor.pendingCount} Pending Question
                {selectedAuthor.pendingCount !== 1 ? "s" : ""}
              </Badge>

              {isStaff && (
                <Button
                  size="sm"
                  onClick={handleApproveAllForAuthor}
                  disabled={approveAuthorMutation.isPending}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg gap-1.5 cursor-pointer shadow-2xs border border-emerald-600/20"
                >
                  <CheckCircle2 size={13} />
                  Approve All for Author
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">
                Review Queue
              </span>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 rounded-lg"
            >
              {totalPendingAcrossAuthors} Total Awaiting Review
            </Badge>
          </div>
        )}

        {/* ── Compact Search & Filter Controls ── */}
        <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs">
          {/* Search bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
            <Input
              type="text"
              placeholder="Search pending questions wording..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 h-8 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground w-full"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 w-full sm:w-[140px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="PENDING_REVISION">
                  Pending Revision
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty */}
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="h-8 w-full sm:w-[120px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">All Difficulty</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Question Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-8 w-full sm:w-[130px] flex-1 sm:flex-initial bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                <SelectItem value="SHORT_ANSWER">Identification</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset */}
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

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
                title="Show Questions Table"
              >
                <LayoutList size={13} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("workspace")}
                disabled={questions.length === 0}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer disabled:opacity-40 ${
                  viewMode === "workspace"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
                title="Show Review Workspace"
              >
                <Columns2 size={13} />
                <span>Review Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content: Table or Fast Review Workspace ── */}
        <div className="space-y-3 min-w-0">
          {viewMode === "table" ? (
            <ReviewQuestionsTable
              questions={questions}
              isLoading={isQuestionsLoading}
              onSelectQuestion={handleSelectQuestion}
              selectedAuthor={selectedAuthor}
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

      {/* ── Approve All Author Questions Modal ── */}
      <ApproveAuthorQuestionsDialog
        isOpen={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        author={selectedAuthor || null}
        isLoading={approveAuthorMutation.isPending}
        onConfirm={handleConfirmApproveAll}
      />
    </div>
  );
}
