import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Grid,
  ChevronRight,
  MessageSquare,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import QuestionList from "@/view/admin/question_bank/components/list/QuestionList";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function Revisions() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  const [revisionSearch, setRevisionSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const { data: categories = [] } = useCategories();

  // Fetch revision batches and questions from QuestionThatNeedsRevision collection
  const { data: revisionData, isLoading: isRevisionsLoading } = useQuery({
    queryKey: ["revisionCollection"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/questions/revisions/get");
      return res.data?.data?.revisions;
    },
  });

  const revisionBatches = revisionData?.revisionBatches || [];
  const revisionQuestions = revisionData?.questions || [];

  // Auto-select first revision batch when data loads
  useEffect(() => {
    if (revisionBatches.length > 0 && (!selectedBatchId || !revisionBatches.some((b: any) => b.id === selectedBatchId))) {
      setSelectedBatchId(revisionBatches[0].id);
    }
  }, [revisionBatches, selectedBatchId]);

  const activeBatch = revisionBatches.find((b: any) => b.id === selectedBatchId);

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: string }) => {
      await axiosPrivate.put(`/questions/revisions/${id}`, { feedback });
    },
    onSuccess: () => {
      toast.success("Updated revision feedback.");
      queryClient.invalidateQueries({ queryKey: ["revisionCollection"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update feedback.");
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosPrivate.delete(`/questions/revisions/${id}`);
    },
    onSuccess: () => {
      toast.success("Deleted revision request. Linked questions reset to Pending Review.");
      setSelectedBatchId("ALL");
      queryClient.invalidateQueries({ queryKey: ["revisionCollection"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete revision request.");
    },
  });

  const handleEditFeedback = (batch: any) => {
    const newFeedback = window.prompt("Edit revision feedback message:", batch.feedback);
    if (newFeedback !== null && newFeedback.trim() !== "") {
      updateFeedbackMutation.mutate({ id: batch.id, feedback: newFeedback.trim() });
    }
  };

  const handleDeleteFeedback = (batch: any) => {
    if (window.confirm("Are you sure you want to delete this revision request? Linked questions will be returned to Pending Review.")) {
      deleteFeedbackMutation.mutate(batch.id);
    }
  };

  // Filter revision batches by sidebar search
  const filteredBatches = revisionBatches.filter((b: any) =>
    (b.feedback || "").toLowerCase().includes(revisionSearch.toLowerCase())
  );

  // Construct filters for QuestionList
  const filters: any = {
    status: "NEEDS_REVISION",
    search: searchTerm,
    difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
    type: selectedType === "ALL" ? undefined : selectedType,
  };

  // Teachers see only their own questions needing revision
  if (currentUserRole === "TEACHER" && currentUserId) {
    filters.authorId = currentUserId;
  }

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty("ALL");
    setSelectedType("ALL");
    setSelectedBatchId("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedDifficulty !== "ALL" ||
    selectedType !== "ALL" ||
    selectedBatchId !== "ALL";

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* ── Left Sidebar: Revision Feedback Batches ── */}
      <aside className="w-full lg:w-80 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-auto lg:h-full">
        {/* Sidebar Header */}
        <div className="p-4 px-5 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Revision Requests</h2>
              <p className="text-[11px] text-muted-foreground">
                Flagged revision batches ({revisionBatches.length})
              </p>
            </div>
          </div>

          {/* Search Revision Input */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
            <Input
              type="text"
              placeholder="Search revision notes..."
              value={revisionSearch}
              onChange={(e) => setRevisionSearch(e.target.value)}
              className="pl-9 pr-3 h-8 text-xs bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Revision Requests List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isRevisionsLoading ? (
            <div className="space-y-2 p-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground italic">
              No revision batches found.
            </div>
          ) : (
            filteredBatches.map((batch: any) => {
              const isSelected = selectedBatchId === batch.id;
              const count = batch.questionIds?.length || 0;
              const dateStr = new Date(batch.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`w-full flex flex-col gap-1.5 p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40 shadow-xs ring-1 ring-amber-500/30"
                      : "bg-muted/30 border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> Batch #{batch.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{dateStr}</span>
                  </div>

                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                    {batch.feedback || "Revision requested by reviewer."}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">Target Items:</span>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-2 py-0">
                      {count} question{count === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Panel: Revision Desk Content ── */}
      <main className="flex-1 overflow-y-auto flex flex-col p-6 md:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                <MessageSquare size={22} className="stroke-[2.2]" />
              </div>
              Revision Desk
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Questions flagged by administrators with revision feedback requiring updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="w-fit text-xs font-semibold px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 rounded-full flex items-center gap-2 shadow-2xs"
            >
              <AlertTriangle size={14} className="text-amber-500" />
              {revisionBatches.length} Revision Batches ({revisionQuestions.length} Items)
            </Badge>
          </div>
        </div>
        {/* Revision Request Banner (if specific batch is selected) */}
        {activeBatch && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  Selected Revision Batch #{activeBatch.id.slice(-4).toUpperCase()}
                  <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40">
                    {activeBatch.questionIds?.length || 0} Questions
                  </Badge>
                </h3>
                <p className="text-sm mt-1 font-semibold leading-relaxed">
                  "{activeBatch.feedback}"
                </p>
              </div>
            </div>

            {(currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN" || !activeBatch.createdById || activeBatch.createdById === currentUserId) && (
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditFeedback(activeBatch)}
                  className="h-8 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-950 dark:text-amber-100 rounded-xl gap-1.5 cursor-pointer"
                >
                  <Edit3 size={13} /> Edit Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteFeedback(activeBatch)}
                  className="h-8 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive rounded-xl gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete Request
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              type="text"
              placeholder="Search revision questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-9 h-10 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="h-10 w-[130px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
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
              <SelectTrigger className="h-10 w-[150px] bg-muted/40 border-border rounded-xl text-xs font-semibold text-foreground">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                <SelectItem value="IDENTIFICATION">Identification</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl gap-1.5 cursor-pointer px-3"
              >
                <RotateCcw size={13} />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* ── Question List Component ── */}
        <div className="space-y-4">
          <QuestionList filters={filters} />
        </div>
      </main>
    </div>
  );
}
