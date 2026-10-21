import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import useAuth from "@/hooks/useAuth";
import { useConfirm, showFeedback } from "@/components/modal";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import {
  useCategoryDetail,
  useUpdateCategory,
  useLearningModules,
  useTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  type Topic,
} from "@/features/question-bank";

import SubjectHeader from "../components/subject-details/SubjectHeader";
import EditSubjectModal from "../components/subject-details/EditSubjectModal";
import { TopicCMSModal } from "../components/dialog/TopicCMSModal";

type TopicSortKey =
  | "name-asc"
  | "name-desc"
  | "questions-high"
  | "questions-low"
  | "newest";

// Create Topic Dialog matching CreateCategoryDialog but without icon picker
interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName?: string;
  isPending?: boolean;
  onCreateTopic: (name: string) => Promise<void>;
}

function CreateTopicDialog({
  open,
  onOpenChange,
  categoryName = "Subject",
  isPending = false,
  onCreateTopic,
}: CreateTopicDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    await onCreateTopic(clean);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Plus size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Create Curriculum Topic
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Add a new evaluation topic to the curriculum library for{" "}
              {categoryName}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Topic Name *
              </label>
              <Input
                type="text"
                required
                autoFocus
                placeholder="e.g. Clinical Enzymology, Blood Gases"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <AlertDialogCancel
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 h-9 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Create Topic
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function SubjectTopicsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { confirm } = useConfirm();

  const currentUserRole =
    (auth as any)?.data?.user?.role ||
    (auth as any)?.user?.role ||
    (auth as any)?.role;
  const canManageSubject =
    !currentUserRole ||
    currentUserRole === "SUPERADMIN" ||
    currentUserRole === "DEAN" ||
    currentUserRole === "TEAMLEAD";
  const canManageTopics = canManageSubject || currentUserRole === "TEACHER";

  // Category and Modules data
  const { data: category, isLoading: isCategoryLoading } =
    useCategoryDetail(categoryId);
  const { data: modules = [] } = useLearningModules(categoryId || null);
  const updateCategoryMutation = useUpdateCategory();

  // Topics queries and mutations
  const { data: topics = [], isLoading: isTopicsLoading } =
    useTopics(categoryId);
  const createTopicMutation = useCreateTopic(categoryId);
  const updateTopicMutation = useUpdateTopic(categoryId);
  const deleteTopicMutation = useDeleteTopic(categoryId);

  // Store for Question Bank redirection
  const { setSelectedCategory, setSelectedTopic, setSearch } = useQuestionBankFilterStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<TopicSortKey>("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isCMSModalOpen, setIsCMSModalOpen] = useState(false);

  // Inline edit state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");

  // Edit Subject modal state
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectIcon, setEditSubjectIcon] = useState("BookOpen");

  // Summary Metrics calculations
  const totalTopicsCount = topics.length;
  const totalQuestionsMapped = useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.questionCount || 0), 0);
  }, [topics]);

  const topicsWithQuestionsCount = useMemo(() => {
    return topics.filter((t) => (t.questionCount || 0) > 0).length;
  }, [topics]);

  const coveragePercent =
    totalTopicsCount > 0
      ? Math.round((topicsWithQuestionsCount / totalTopicsCount) * 100)
      : 0;

  // Filtered & Sorted Topics
  const processedTopics = useMemo(() => {
    let list = [...topics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        case "name-desc":
          return b.name.localeCompare(a.name, undefined, {
            sensitivity: "base",
          });
        case "questions-high":
          return (b.questionCount || 0) - (a.questionCount || 0);
        case "questions-low":
          return (a.questionCount || 0) - (b.questionCount || 0);
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return list;
  }, [topics, searchQuery, sortOption]);

  // Pagination calculation
  const total = processedTopics.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTopics = processedTopics.slice(
    startIndex,
    startIndex + pageSize,
  );

  // Guard against currentPage out of bounds after deletion/filtering/pageSize change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleNextPage = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (val: TopicSortKey) => {
    setSortOption(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handlers
  const handleOpenEditSubject = () => {
    if (!category) return;
    setEditSubjectName(category.name);
    setEditSubjectIcon(category.icon || "BookOpen");
    setIsEditSubjectOpen(true);
  };

  const handleUpdateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !editSubjectName.trim()) return;

    updateCategoryMutation.mutate(
      {
        categoryId,
        name: editSubjectName.trim(),
        icon: editSubjectIcon,
      },
      {
        onSuccess: () => setIsEditSubjectOpen(false),
      },
    );
  };

  const handleCreateTopicModal = async (cleanName: string) => {
    if (topics.some((t) => t.name.toLowerCase() === cleanName.toLowerCase())) {
      showFeedback.error(
        `Topic "${cleanName}" already exists for this subject.`,
      );
      return;
    }

    try {
      await createTopicMutation.mutateAsync({ name: cleanName });
      setIsAddTopicModalOpen(false);
      setCurrentPage(1);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleStartEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleSaveEdit = async (topicId: string, currentName: string) => {
    const clean = editingTopicName.trim();
    if (!clean) {
      showFeedback.error("Topic name cannot be empty.");
      return;
    }
    if (clean.toLowerCase() === currentName.toLowerCase()) {
      setEditingTopicId(null);
      return;
    }

    try {
      await updateTopicMutation.mutateAsync({ id: topicId, name: clean });
      setEditingTopicId(null);
    } catch {
      // Handled in hook
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    const questionsCount = topic.questionCount || 0;
    const confirmed = await confirm({
      title: "Delete Topic",
      description: (
        <div className="space-y-2 text-xs">
          <p>
            Are you sure you want to delete topic{" "}
            <strong className="text-foreground">"{topic.name}"</strong>?
          </p>
          {questionsCount > 0 && (
            <p className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-md">
              Warning: <strong>{questionsCount} questions</strong> are currently
              mapped to this topic. Questions will remain but will need to be
              re-tagged.
            </p>
          )}
        </div>
      ),
      variant: "destructive",
      confirmText: "Delete Topic",
    });

    if (!confirmed) return;

    try {
      await deleteTopicMutation.mutateAsync(topic.id);
    } catch {
      // Handled in hook
    }
  };

  const handleViewQuestionsForTopic = (topicName: string) => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    setSelectedTopic(topicName);
    setSearch("");
    navigate("/question-bank");
  };

  const handleTabChange = (tab: "overview" | "modules" | "topics") => {
    if (tab === "overview") {
      navigate(`/subject-management/${categoryId}`);
    } else if (tab === "modules") {
      navigate(`/subject-management/${categoryId}?tab=modules`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-5xl mx-auto min-h-full font-sans bg-background text-foreground animate-in fade-in duration-200">
      {/* Top Header & Standard Navigation Bar */}
      <SubjectHeader
        category={category}
        categoryId={categoryId}
        isCategoryLoading={isCategoryLoading}
        canManage={canManageSubject}
        activeTab="topics"
        modulesCount={modules.length}
        topicsCount={topics.length}
        onTabChange={handleTabChange}
        onOpenEditSubject={handleOpenEditSubject}
        onBackNav={() =>
          window.history.length > 1
            ? navigate(-1)
            : navigate(`/subject-management/${categoryId}`)
        }
      />

      {/* Main Content Area */}
      {isCategoryLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Topics KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-emerald-500/40 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Total Topics
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {totalTopicsCount}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block pt-0.5">
                  Curriculum catalog
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
                <Bookmark size={20} />
              </div>
            </div>

            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-primary/40 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Questions Mapped
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {totalQuestionsMapped}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/question-bank")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer pt-0.5"
                >
                  Question Bank <ExternalLink size={10} />
                </button>
              </div>
              <div className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl shrink-0">
                <HelpCircle size={20} />
              </div>
            </div>

            <div className="p-4 bg-card border border-border/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-blue-500/40 transition-all text-left">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground block truncate">
                  Catalog Coverage
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {coveragePercent}%
                </p>
                <span className="text-[11px] text-muted-foreground block pt-0.5">
                  {topicsWithQuestionsCount} of {totalTopicsCount} topics tagged
                </span>
              </div>
              <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Search, Filter, Sort & Add Topic Toolbar (matching CategoriesHeader) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card border border-border/80 p-3 rounded-xl shadow-2xs font-sans">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search topics by name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8 h-8.5 text-xs bg-muted/30 border-border rounded-lg text-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Action Controls & Add Button */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* View Mode Toggle (List vs Grid) */}
              <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table List View"
                  aria-label="Table List View"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-card text-primary shadow-2xs font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Cards Grid View"
                  aria-label="Cards Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>

              <Select
                value={sortOption}
                onValueChange={(val) => handleSortChange(val as TopicSortKey)}
              >
                <SelectTrigger className="h-8.5 w-[160px] text-xs font-semibold bg-muted/30 border-border rounded-lg">
                  <SelectValue placeholder="Sort topics..." />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="name-asc">Alphabetical (A - Z)</SelectItem>
                  <SelectItem value="name-desc">
                    Alphabetical (Z - A)
                  </SelectItem>
                  <SelectItem value="questions-high">Most Questions</SelectItem>
                  <SelectItem value="questions-low">
                    Fewest Questions
                  </SelectItem>
                  <SelectItem value="newest">Recently Added</SelectItem>
                </SelectContent>
              </Select>

              {canManageTopics && (
                <Button
                  onClick={() => setIsAddTopicModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 h-8.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Topic
                </Button>
              )}
            </div>
          </div>

          {/* Topics List / Grid */}
          {isTopicsLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs divide-y divide-border/40 font-sans">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 px-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-7 rounded-lg bg-muted" />
                      <Skeleton className="h-4 w-44 bg-muted" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20 bg-muted rounded-full" />
                      <Skeleton className="size-7 bg-muted rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : processedTopics.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-border/80 rounded-xl bg-card flex flex-col items-center justify-center gap-2">
              <div className="size-12 rounded-full bg-muted/40 border border-border flex items-center justify-center text-muted-foreground/60">
                <Bookmark size={22} className="stroke-[1.6]" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {searchQuery
                  ? "No matching topics found"
                  : "No curriculum topics yet"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {searchQuery
                  ? `No topics match "${searchQuery}". Try a different search keyword.`
                  : `Start categorizing ${category?.name || "this subject"}'s question bank by adding topics.`}
              </p>
              {searchQuery ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSearchChange("")}
                  className="mt-1 h-7.5 text-xs font-semibold gap-1"
                >
                  <RotateCcw size={12} /> Clear Filter
                </Button>
              ) : canManageTopics ? (
                <Button
                  size="sm"
                  onClick={() => setIsAddTopicModalOpen(true)}
                  className="mt-1 h-8 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus size={14} /> Add First Topic
                </Button>
              ) : null}
            </div>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedTopics.map((topic) => {
                  const isEditing = editingTopicId === topic.id;
                  const questionsCount = topic.questionCount || 0;

                  return (
                    <Card
                      key={topic.id}
                      className="p-3.5 bg-card border border-border/80 hover:border-emerald-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group text-left"
                    >
                      {/* Header: Icon, Name (or Edit input), and Question Badge */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <Bookmark size={14} className="stroke-[2.2]" />
                            </div>

                            {isEditing ? (
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <Input
                                  type="text"
                                  value={editingTopicName}
                                  onChange={(e) =>
                                    setEditingTopicName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveEdit(topic.id, topic.name);
                                    } else if (e.key === "Escape") {
                                      setEditingTopicId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="h-7 text-xs py-0.5 bg-background"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    handleSaveEdit(topic.id, topic.name)
                                  }
                                  disabled={updateTopicMutation.isPending}
                                  className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                                  title="Save topic name"
                                >
                                  <Check size={13} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingTopicId(null)}
                                  className="size-7 text-muted-foreground hover:bg-muted shrink-0"
                                  title="Cancel"
                                >
                                  <X size={13} />
                                </Button>
                              </div>
                            ) : (
                              <h3
                                className="text-xs font-bold text-foreground truncate tracking-tight"
                                title={topic.name}
                              >
                                {topic.name}
                              </h3>
                            )}
                          </div>

                          {!isEditing && (
                            <Badge
                              variant={
                                questionsCount > 0 ? "secondary" : "outline"
                              }
                              className="text-[10px] font-semibold px-2 py-0 shrink-0"
                            >
                              {questionsCount}{" "}
                              {questionsCount === 1 ? "Question" : "Questions"}
                            </Badge>
                          )}
                        </div>

                        {/* Topic metadata */}
                        <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                          <span className="truncate max-w-[150px]">
                            {category?.name || "Curriculum Unit"}
                          </span>
                          {topic.createdAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />{" "}
                                {formatDate(topic.createdAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleViewQuestionsForTopic(topic.name)
                          }
                          className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                          title="View questions in Question Bank"
                        >
                          <HelpCircle size={12} />
                          <span>View Questions</span>
                        </Button>

                        {canManageTopics && !isEditing && (
                          <div className="flex items-center gap-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleStartEdit(topic)}
                              className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                              title="Rename topic"
                            >
                              <Pencil size={12} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteTopic(topic)}
                              disabled={deleteTopicMutation.isPending}
                              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                              title="Delete topic"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Standardized Card Pagination */}
              {!isTopicsLoading && processedTopics.length > 0 && (
                <DataTablePagination
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={currentPage > 1}
                  onNext={handleNextPage}
                  onPrevious={handlePreviousPage}
                  onPageSelect={handlePageSelect}
                  totalPages={totalPages}
                  totalItems={processedTopics.length}
                  pageSize={pageSize}
                  pageSizeOptions={[6, 12, 24, 48]}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="topics"
                  variant="card"
                />
              )}
            </>
          ) : (
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-2xs font-sans">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border/80 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-muted-foreground py-3 pl-4">
                      Topic Name
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-3">
                      Subject
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-3 text-center">
                      Questions
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-3">
                      Created
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground py-3 pr-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {paginatedTopics.map((topic) => {
                    const isEditing = editingTopicId === topic.id;
                    const questionsCount = topic.questionCount || 0;

                    return (
                      <TableRow
                        key={topic.id}
                        className="hover:bg-muted/30 transition-colors font-sans group"
                      >
                        {/* Topic Name */}
                        <TableCell className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <Bookmark size={14} className="stroke-[2.2]" />
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-1 min-w-[200px]">
                                <Input
                                  type="text"
                                  value={editingTopicName}
                                  onChange={(e) =>
                                    setEditingTopicName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSaveEdit(topic.id, topic.name);
                                    } else if (e.key === "Escape") {
                                      setEditingTopicId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="h-7 text-xs py-0.5 bg-background"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    handleSaveEdit(topic.id, topic.name)
                                  }
                                  disabled={updateTopicMutation.isPending}
                                  className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                                  title="Save topic name"
                                >
                                  <Check size={13} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingTopicId(null)}
                                  className="size-7 text-muted-foreground hover:bg-muted shrink-0"
                                  title="Cancel"
                                >
                                  <X size={13} />
                                </Button>
                              </div>
                            ) : (
                              <span
                                className="text-xs font-bold text-foreground truncate max-w-[260px] block"
                                title={topic.name}
                              >
                                {topic.name}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Subject */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {category?.name || "Curriculum Unit"}
                        </TableCell>

                        {/* Question Count */}
                        <TableCell className="py-3 text-center">
                          <Badge
                            variant={
                              questionsCount > 0 ? "secondary" : "outline"
                            }
                            className="text-[10px] font-semibold px-2 py-0"
                          >
                            {questionsCount}{" "}
                            {questionsCount === 1 ? "Question" : "Questions"}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formatDate(topic.createdAt)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleViewQuestionsForTopic(topic.name)
                              }
                              className="h-7 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                              title="View in Question Bank"
                            >
                              <HelpCircle size={12} />
                              <span className="hidden sm:inline">
                                View Questions
                              </span>
                            </Button>

                            {canManageTopics && !isEditing && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(topic)}
                                  className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer"
                                  title="Rename topic"
                                >
                                  <Pencil size={12} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteTopic(topic)}
                                  disabled={deleteTopicMutation.isPending}
                                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                  title="Delete topic"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Table Footer Pagination */}
              {!isTopicsLoading && processedTopics.length > 0 && (
                <DataTablePagination
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={currentPage > 1}
                  onNext={handleNextPage}
                  onPrevious={handlePreviousPage}
                  onPageSelect={handlePageSelect}
                  totalPages={totalPages}
                  totalItems={processedTopics.length}
                  pageSize={pageSize}
                  pageSizeOptions={[6, 12, 24, 48]}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="topics"
                  variant="table-footer"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Topic Dialog (matching CreateCategoryDialog without icons) */}
      {canManageTopics && (
        <CreateTopicDialog
          open={isAddTopicModalOpen}
          onOpenChange={setIsAddTopicModalOpen}
          categoryName={category?.name}
          isPending={createTopicMutation.isPending}
          onCreateTopic={handleCreateTopicModal}
        />
      )}

      {/* Edit Subject Modal */}
      {canManageSubject && (
        <EditSubjectModal
          isOpen={isEditSubjectOpen}
          onOpenChange={setIsEditSubjectOpen}
          subjectName={editSubjectName}
          onSubjectNameChange={setEditSubjectName}
          subjectIcon={editSubjectIcon}
          onSubjectIconChange={setEditSubjectIcon}
          isSubmitting={updateCategoryMutation.isPending}
          onSubmit={handleUpdateSubjectSubmit}
        />
      )}
    </div>
  );
}
