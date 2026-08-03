import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import QuestionList from "@/features/question-bank/components/list/QuestionList";
import { toast } from "sonner";

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
    if (
      revisionBatches.length > 0 &&
      (!selectedBatchId || !revisionBatches.some((b: any) => b.id === selectedBatchId))
    ) {
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
      toast.success("Deleted revision request. Linked questions returned to Pending Review.");
      setSelectedBatchId("");
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
    if (
      window.confirm(
        "Are you sure you want to delete this revision request? Linked questions will be returned to Pending Review."
      )
    ) {
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
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedDifficulty !== "ALL" ||
    selectedType !== "ALL";

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* ── Left Sidebar: Revision Feedback Batches ── */}
      <aside className="w-full lg:w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-auto lg:h-full">
        {/* Sidebar Header */}
        <div className="p-3.5 px-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <MessageSquare size={15} />
              </div>
              <span className="text-xs font-bold text-foreground tracking-tight">Revision Requests</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border-border px-1.5 py-0">
              {revisionBatches.length}
            </Badge>
          </div>

          {/* Search Revision Input */}
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3" />
            <Input
              type="text"
              placeholder="Search revision notes..."
              value={revisionSearch}
              onChange={(e) => setRevisionSearch(e.target.value)}
              className="pl-8 pr-2.5 h-7 text-[11px] bg-muted/40 border border-border rounded-lg focus:ring-1 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Revision Requests List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
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
                  className={`w-full flex flex-col gap-1 p-2.5 px-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-950 dark:text-amber-200 border-amber-500/30 shadow-2xs ring-1 ring-amber-500/20"
                      : "bg-card/70 border-border/60 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={10} /> Batch #{batch.id.slice(-4).toUpperCase()}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground">{dateStr}</span>
                  </div>

                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                    {batch.feedback || "Revision requested by reviewer."}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-0.5">
                    <span className="text-[9.5px] text-muted-foreground">Target Items:</span>
                    <Badge
                      variant="outline"
                      className="text-[9.5px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-1.5 py-0 rounded-md"
                    >
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
      <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-5 space-y-3.5">
        {/* Compact Banner for Selected Revision Batch */}
        {activeBatch ? (
          <div className="p-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5 min-w-0">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Batch #{activeBatch.id.slice(-4).toUpperCase()}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[9.5px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 px-1.5 py-0"
                  >
                    {activeBatch.questionIds?.length || 0} Questions
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground mt-0.5 leading-normal truncate max-w-xl">
                  "{activeBatch.feedback}"
                </p>
              </div>
            </div>

            {(currentUserRole === "SUPERADMIN" ||
              currentUserRole === "ADMIN" ||
              !activeBatch.createdById ||
              activeBatch.createdById === currentUserId) && (
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditFeedback(activeBatch)}
                  className="h-7 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-950 dark:text-amber-100 rounded-lg gap-1 cursor-pointer px-2.5"
                >
                  <Edit3 size={12} /> Edit Note
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteFeedback(activeBatch)}
                  className="h-7 text-[11px] font-semibold bg-destructive/10 hover:bg-destructive/20 border-destructive/30 text-destructive rounded-lg gap-1 cursor-pointer px-2.5"
                >
                  <Trash2 size={12} /> Delete Request
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-foreground">Revision Desk Queue</span>
            </div>
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 rounded-lg">
              {revisionBatches.length} Revision Batches ({revisionQuestions.length} Items)
            </Badge>
          </div>
        )}

        {/* ── Compact Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card border border-border p-2.5 px-3 rounded-xl shadow-2xs">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
            <Input
              type="text"
              placeholder="Search revision questions wording..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 h-8 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="h-8 w-[120px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
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
              <SelectTrigger className="h-8 w-[135px] bg-muted/30 border-border rounded-lg text-[11px] font-semibold text-foreground">
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
                className="h-8 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer px-2.5"
              >
                <RotateCcw size={12} />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* ── Question List Component ── */}
        <div className="space-y-3">
          <QuestionList filters={filters} isRevisionsView={true} />
        </div>
      </main>
    </div>
  );
}
