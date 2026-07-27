import { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Check,
  Clock,
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
import { usePendingReviewAuthors } from "@/hooks/useQuestionBank";
import QuestionList from "./components/list/QuestionList";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

export default function ReviewQuestions() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role || (auth as any)?.user?.role;

  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const { data: authors = [], isLoading: isAuthorsLoading } = usePendingReviewAuthors();

  // Auto-select first author when data is loaded
  useEffect(() => {
    if (authors.length > 0) {
      if (!selectedAuthorId || !authors.some((a) => a.id === selectedAuthorId)) {
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
        params: { status: "PENDING_REVIEW", authorId, limit: 100 },
      });
      const qList = res.data?.data?.questions || res.data?.data || [];
      const ids = qList.map((q: any) => q.id);
      if (ids.length === 0) return;
      await axiosPrivate.post("/questions/bulk/approve", { ids });
    },
    onSuccess: () => {
      toast.success("Approved all pending questions for selected author.");
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve author questions.");
    },
  });

  const handleApproveAllForAuthor = () => {
    if (!selectedAuthorId || !selectedAuthor) return;
    if (
      window.confirm(
        `Approve all ${selectedAuthor.pendingCount} pending question(s) by ${selectedAuthor.name}?`
      )
    ) {
      approveAuthorMutation.mutate(selectedAuthorId);
    }
  };

  // Filter Authors List
  const filteredAuthors = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(authorSearch.toLowerCase()) ||
      (a.department || "").toLowerCase().includes(authorSearch.toLowerCase())
  );

  const totalPendingAcrossAuthors = authors.reduce((sum, a) => sum + a.pendingCount, 0);

  // Filters for QuestionList component
  const filters: any = {
    status: "PENDING_REVIEW",
    search: searchTerm,
    difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
    type: selectedType === "ALL" ? undefined : selectedType,
    authorId: selectedAuthorId || undefined,
  };

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
      {/* ── Left Sidebar: Submitting Authors List ── */}
      <aside className="w-full lg:w-76 shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-auto lg:h-full">
        {/* Sidebar Header */}
        <div className="p-3.5 px-4 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Users size={15} />
              </div>
              <span className="text-xs font-bold text-foreground tracking-tight">Submitting Faculty</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border-border px-1.5 py-0">
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
                <Skeleton key={i} className="h-14 w-full rounded-2xl bg-muted" />
              ))}
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground italic">
              No faculty submissions pending.
            </div>
          ) : (
            filteredAuthors.map((author) => {
              const isSelected = selectedAuthorId === author.id;
              const initials = author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <button
                  key={author.id}
                  onClick={() => setSelectedAuthorId(author.id)}
                  className={`w-full flex items-start justify-between p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 dark:bg-primary/10 border-primary/30 text-foreground shadow-2xs ring-1 ring-primary/20"
                      : "bg-card/70 border-border/60 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 rounded-xl border border-primary/20 shrink-0 shadow-2xs">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-extrabold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-snug">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {author.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground block truncate mt-0.5">
                        {author.department || author.role}
                      </span>
                      {author.latestSubmissionAt && (
                        <span className="text-[9.5px] font-medium text-muted-foreground/80 flex items-center gap-1 mt-1">
                          <Clock size={10} className="text-muted-foreground/60 shrink-0" />
                          {new Date(author.latestSubmissionAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
                          {new Date(author.latestSubmissionAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
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
      <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-5 space-y-4">
        {/* Compact Selected Author Header Banner */}
        {selectedAuthor ? (
          <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
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
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">{selectedAuthor.name}</h2>
                  <Badge variant="outline" className="text-[9.5px] font-semibold bg-muted text-muted-foreground border-border px-1.5 py-0">
                    {selectedAuthor.role}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selectedAuthor.email} • {selectedAuthor.department || "Faculty"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Badge variant="outline" className="text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                {selectedAuthor.pendingCount} Pending Question{selectedAuthor.pendingCount !== 1 ? "s" : ""}
              </Badge>

              {(currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN" || currentUserRole === "TEAMLEAD") && (
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
          <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Review Questions Queue</span>
            </div>
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 rounded-lg">
              {totalPendingAcrossAuthors} Total Awaiting Review
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
              placeholder="Search pending questions wording..."
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
          <QuestionList filters={filters} />
        </div>
      </main>
    </div>
  );
}
