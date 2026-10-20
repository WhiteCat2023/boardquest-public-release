import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer,
  Loader2,
  FileDown,
  CheckCircle2,
  HelpCircle,
  Filter,
  RotateCcw,
  ArrowLeft,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import type { Question } from "@/types/question";
import {
  fetchAllApprovedQuestions,
  generateQuestionsPdfHtml,
  printQuestionsPdf,
  normalizeQuestionType,
  getQuestionTypeFullLabel,
} from "../services/questionPdfExportService";
import { showFeedback } from "@/components/modal";

export default function ExportQuestionsPdfPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUserName = (auth as any)?.data?.user?.name || "Faculty Reviewer";

  // URL parameters if opened with preset filters
  const initialCategoryParam = searchParams.get("category") || "ALL";
  const initialTypeParam = searchParams.get("type") || "ALL";
  const initialDifficultyParam = searchParams.get("difficulty") || "ALL";

  // Document format options state
  const [mode, setMode] = useState<"comprehensive" | "exam_only" | "exam_with_key">(
    "comprehensive"
  );
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  // 5 Dropdown Filter states
  const [filterType, setFilterType] = useState<string>(initialTypeParam);
  const [filterSubject, setFilterSubject] = useState<string>(initialCategoryParam);
  const [filterTopic, setFilterTopic] = useState<string>("ALL");
  const [filterDifficulty, setFilterDifficulty] = useState<string>(initialDifficultyParam);
  const [filterAuthor, setFilterAuthor] = useState<string>("ALL");

  // Data state
  const [allQuestions, setAllQuestions] = useState<Question[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Load all approved questions on mount
  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchAllApprovedQuestions(axiosPrivate);
        if (!isSubscribed) return;
        setAllQuestions(data);
      } catch (err: any) {
        if (!isSubscribed) return;
        showFeedback.error(err?.message || "Failed to load approved questions for PDF.");
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [axiosPrivate]);

  const rawQuestions = allQuestions || [];

  // Question counts per type
  const typeCounts = useMemo(() => {
    let mcq = 0;
    let tf = 0;
    let sa = 0;
    for (const q of rawQuestions) {
      const norm = normalizeQuestionType(q.type);
      if (norm === "MCQ") mcq++;
      else if (norm === "TRUE_FALSE") tf++;
      else if (norm === "SHORT_ANSWER") sa++;
    }
    return { mcq, tf, sa, total: rawQuestions.length };
  }, [rawQuestions]);

  // Question counts per difficulty
  const difficultyCounts = useMemo(() => {
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const q of rawQuestions) {
      const diff = (q.difficulty || "MEDIUM").toUpperCase();
      if (diff === "EASY") easy++;
      else if (diff === "HARD") hard++;
      else medium++;
    }
    return { easy, medium, hard };
  }, [rawQuestions]);

  // Distinct subjects available in rawQuestions
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const q of rawQuestions) {
      const name = q.subject?.name || q.category?.name || "General Subject";
      const id = q.subjectId || q.categoryId || q.subject?.id || q.category?.id || name;
      const item = map.get(id);
      if (item) {
        item.count++;
      } else {
        map.set(id, { id, name, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawQuestions]);

  // Distinct topics available in rawQuestions (filtered by selected subject if one is chosen)
  const availableTopics = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const q of rawQuestions) {
      const subId =
        q.subjectId ||
        q.categoryId ||
        q.subject?.id ||
        q.category?.id ||
        q.subject?.name ||
        q.category?.name ||
        "General Subject";
      if (filterSubject !== "ALL" && subId !== filterSubject) {
        continue;
      }
      const topic = (q.topic || "").trim() || "Core Concept";
      const item = map.get(topic);
      if (item) {
        item.count++;
      } else {
        map.set(topic, { name: topic, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawQuestions, filterSubject]);

  // Distinct authors available in rawQuestions
  const availableAuthors = useMemo(() => {
    const map = new Map<string, { key: string; name: string; count: number }>();
    for (const q of rawQuestions) {
      let authorName = "Unknown Author";
      let authorKey = "";
      if (typeof q.author === "object" && q.author?.name) {
        authorName = q.author.name;
        authorKey = (q.author as any).id || (q as any).authorId || authorName;
      } else if (typeof q.author === "string" && q.author.trim()) {
        authorName = q.author.trim();
        authorKey = (q as any).authorId || authorName;
      } else if ((q as any).authorName) {
        authorName = (q as any).authorName;
        authorKey = (q as any).authorId || authorName;
      } else if ((q as any).authorId) {
        authorKey = (q as any).authorId;
        authorName = `Author (${(q as any).authorId.slice(0, 6)})`;
      } else {
        authorKey = "unknown";
      }

      const item = map.get(authorKey);
      if (item) {
        item.count++;
      } else {
        map.set(authorKey, { key: authorKey, name: authorName, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawQuestions]);

  // Active questions filtered by all 5 criteria in real-time
  const activeQuestions = useMemo(() => {
    return rawQuestions.filter((q) => {
      // 1. Question Type filter
      if (filterType !== "ALL") {
        const norm = normalizeQuestionType(q.type);
        if (norm !== filterType) return false;
      }

      // 2. Subject filter
      if (filterSubject !== "ALL") {
        const subId =
          q.subjectId ||
          q.categoryId ||
          q.subject?.id ||
          q.category?.id ||
          q.subject?.name ||
          q.category?.name;
        if (subId !== filterSubject) return false;
      }

      // 3. Topic filter
      if (filterTopic !== "ALL") {
        const topic = (q.topic || "").trim() || "Core Concept";
        if (topic !== filterTopic) return false;
      }

      // 4. Difficulty filter
      if (filterDifficulty !== "ALL") {
        const diff = (q.difficulty || "MEDIUM").toUpperCase();
        if (diff !== filterDifficulty) return false;
      }

      // 5. Author filter
      if (filterAuthor !== "ALL") {
        let authorKey = "";
        if (typeof q.author === "object" && (q.author as any).id) {
          authorKey = (q.author as any).id;
        } else if ((q as any).authorId) {
          authorKey = (q as any).authorId;
        } else if (typeof q.author === "object" && q.author?.name) {
          authorKey = q.author.name;
        } else if (typeof q.author === "string" && q.author.trim()) {
          authorKey = (q as any).authorId || q.author.trim();
        } else if ((q as any).authorName) {
          authorKey = (q as any).authorId || (q as any).authorName;
        } else {
          authorKey = "unknown";
        }
        if (authorKey !== filterAuthor) return false;
      }

      return true;
    });
  }, [
    rawQuestions,
    filterType,
    filterSubject,
    filterTopic,
    filterDifficulty,
    filterAuthor,
  ]);

  const activeCount = activeQuestions.length;

  const hasActiveFilters =
    filterType !== "ALL" ||
    filterSubject !== "ALL" ||
    filterTopic !== "ALL" ||
    filterDifficulty !== "ALL" ||
    filterAuthor !== "ALL";

  const handleResetFilters = () => {
    setFilterType("ALL");
    setFilterSubject("ALL");
    setFilterTopic("ALL");
    setFilterDifficulty("ALL");
    setFilterAuthor("ALL");
  };

  // Generated HTML for live preview and export
  const previewHtml = useMemo(() => {
    if (activeQuestions.length === 0) return "";

    const activeFilterLabels: string[] = [];
    if (filterType !== "ALL") {
      activeFilterLabels.push(getQuestionTypeFullLabel(filterType));
    }
    if (filterSubject !== "ALL") {
      const foundSub = availableSubjects.find((s) => s.id === filterSubject);
      if (foundSub) activeFilterLabels.push(`Subject: ${foundSub.name}`);
    }
    if (filterTopic !== "ALL") {
      activeFilterLabels.push(`Topic: ${filterTopic}`);
    }
    if (filterDifficulty !== "ALL") {
      activeFilterLabels.push(`Diff: ${filterDifficulty}`);
    }
    if (filterAuthor !== "ALL") {
      const foundAuth = availableAuthors.find((a) => a.key === filterAuthor);
      if (foundAuth) activeFilterLabels.push(`Author: ${foundAuth.name}`);
    }

    const filterDescriptor =
      activeFilterLabels.length > 0 ? ` • ${activeFilterLabels.join(" • ")}` : "";

    let headerCategoryName = "All Subjects (Entire Bank)";
    if (filterSubject !== "ALL") {
      const foundSub = availableSubjects.find((s) => s.id === filterSubject);
      if (foundSub) headerCategoryName = foundSub.name;
    }

    return generateQuestionsPdfHtml({
      title:
        filterSubject !== "ALL"
          ? `${headerCategoryName} - Evaluation Questions`
          : "BoardQuest Question Bank - Approved Questions",
      subtitle: `Official compilation of ${activeCount} approved examination items${filterDescriptor}`,
      questions: activeQuestions,
      categoryName: headerCategoryName,
      includeAnswerKey: mode !== "exam_only",
      includeExplanations: mode === "comprehensive" && includeExplanations,
      includeMetadata,
      mode,
      generatedBy: currentUserName,
      selectedTypes: filterType !== "ALL" ? [filterType] : undefined,
    });
  }, [
    activeQuestions,
    activeCount,
    mode,
    includeExplanations,
    includeMetadata,
    currentUserName,
    filterType,
    filterSubject,
    filterTopic,
    filterDifficulty,
    filterAuthor,
    availableSubjects,
    availableAuthors,
  ]);

  const handlePrintOrSavePdf = async () => {
    if (!previewHtml || activeQuestions.length === 0) {
      showFeedback.warning("No questions available to export.");
      return;
    }

    setIsPrinting(true);
    try {
      await printQuestionsPdf(previewHtml);
      showFeedback.success(
        `Export ready! Prepared ${activeQuestions.length} approved questions for PDF save.`,
        {
          description: "Choose 'Save as PDF' in the destination dropdown to download.",
        }
      );
    } catch (err: any) {
      showFeedback.error("Failed to trigger print dialog.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col font-sans bg-background text-foreground overflow-hidden">
      {/* Top Page Header Bar */}
      <header className="px-5 sm:px-7 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex flex-col gap-2.5 shrink-0 shadow-2xs">
        {/* Back Link Row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/question-bank/shared-library")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Question Bank
          </button>
        </div>

        {/* Title, Badge & Main Action CTA Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 shadow-2xs">
              <FileDown size={22} className="stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  Export Question Bank to PDF
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0 rounded-full shrink-0"
                >
                  <CheckCircle2 size={11} className="mr-1 inline" />
                  {isLoading ? "Loading..." : `${activeCount} Questions`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">
                Configure layouts, filter questions on the left sidebar, and preview the print-ready vector PDF in real-time.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body: Left Sidebar + Right Preview Canvas */}
      <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Left Filter & Configuration Sidebar */}
        <aside className="w-72 lg:w-80 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden shadow-xs">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#A70202]" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Document Filters
              </span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-6.5 text-[11px] px-2 text-[#A70202] hover:bg-[#A70202]/10 cursor-pointer gap-1 font-semibold rounded-md"
                title="Reset all filters"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {/* Sidebar Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* ── Document Format Section ── */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                1. Document Format
              </span>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Layout Type</label>
                <Select
                  value={mode}
                  onValueChange={(val: "comprehensive" | "exam_only" | "exam_with_key") =>
                    setMode(val)
                  }
                >
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="comprehensive">
                      Faculty Guide (Answers & Rationales)
                    </SelectItem>
                    <SelectItem value="exam_with_key">
                      Exam Paper + Separate Key at End
                    </SelectItem>
                    <SelectItem value="exam_only">
                      Exam Questionnaire Only (No Answers)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Switches */}
              <div className="space-y-2 pt-1 bg-muted/30 p-2.5 rounded-xl border border-border/60">
                {mode === "comprehensive" && (
                  <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                    <span className="text-xs font-medium text-foreground">
                      Include Rationales
                    </span>
                    <Switch
                      checked={includeExplanations}
                      onCheckedChange={setIncludeExplanations}
                      className="scale-85"
                    />
                  </label>
                )}

                <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Show Difficulty & Topic
                  </span>
                  <Switch
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                    className="scale-85"
                  />
                </label>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* ── Question Filters Section ── */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Filter Questions
                </span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-bold text-[#A70202] bg-[#A70202]/10">
                    Active
                  </Badge>
                )}
              </div>

              {/* Filter 1: Question Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Question Type</span>
                  {filterType !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Types ({typeCounts.total})</SelectItem>
                    <SelectItem value="MCQ">Multiple Choice ({typeCounts.mcq})</SelectItem>
                    <SelectItem value="TRUE_FALSE">True / False ({typeCounts.tf})</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer ({typeCounts.sa})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 2: Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Subject</span>
                  {filterSubject !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select
                  value={filterSubject}
                  onValueChange={(val) => {
                    setFilterSubject(val);
                    setFilterTopic("ALL");
                  }}
                >
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-64">
                    <SelectItem value="ALL">All Subjects ({availableSubjects.length})</SelectItem>
                    {availableSubjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name} ({sub.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 3: Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Topic</span>
                  {filterTopic !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterTopic} onValueChange={setFilterTopic}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-64">
                    <SelectItem value="ALL">All Topics ({availableTopics.length})</SelectItem>
                    {availableTopics.map((top) => (
                      <SelectItem key={top.name} value={top.name}>
                        {top.name} ({top.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 4: Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Difficulty</span>
                  {filterDifficulty !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy ({difficultyCounts.easy})</SelectItem>
                    <SelectItem value="MEDIUM">Medium ({difficultyCounts.medium})</SelectItem>
                    <SelectItem value="HARD">Hard ({difficultyCounts.hard})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 5: Author */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Author / Contributor</span>
                  {filterAuthor !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Authors" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-64">
                    <SelectItem value="ALL">All Authors ({availableAuthors.length})</SelectItem>
                    {availableAuthors.map((auth) => (
                      <SelectItem key={auth.key} value={auth.key}>
                        {auth.name} ({auth.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Questions Summary Stat Box in Sidebar */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Matching Items</span>
                <span className="text-xs font-bold text-foreground">
                  {activeCount} of {rawQuestions.length}
                </span>
              </div>
              <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#A70202] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${rawQuestions.length > 0 ? (activeCount / rawQuestions.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Sticky Bottom CTA */}
          <div className="p-3 border-t border-border bg-card/95 shrink-0 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handlePrintOrSavePdf}
              disabled={isLoading || isPrinting || activeCount === 0}
              className="w-full h-8.5 bg-[#A70202] hover:bg-[#A70202]/90 text-white font-semibold text-xs rounded-xl gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Save PDF ({activeCount})</span>
            </Button>
          </div>
        </aside>

        {/* Right Vector Preview Canvas - Full Width and Height */}
        <main className="flex-1 min-w-0 h-full bg-white overflow-hidden relative flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Loader2 className="size-9 animate-spin text-[#A70202]" />
              <p className="text-sm font-semibold text-foreground">
                Retrieving approved questions repository...
              </p>
              <p className="text-xs text-muted-foreground">
                Compiling vector typography, answer choices, and rationales for print preview.
              </p>
            </div>
          ) : activeCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
              <div className="flex flex-col items-center justify-center gap-3 text-center max-w-md p-8 bg-card border border-border rounded-2xl shadow-xs">
                <HelpCircle className="size-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground text-base">
                  No matching questions found
                </p>
                <p className="text-xs text-muted-foreground">
                  There are no approved questions matching the selected filter combination on the sidebar. Try resetting filters or choosing broader options.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="mt-2 text-xs font-semibold cursor-pointer gap-1.5"
                  >
                    <RotateCcw size={12} />
                    <span>Clear All Filters</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <iframe
              id="boardquest-pdf-fullpage-preview"
              srcDoc={previewHtml}
              title="Question Bank PDF Preview"
              className="w-full h-full border-0 bg-white block"
            />
          )}
        </main>
      </div>

      {/* Page Footer Bar */}
      <footer className="px-5 sm:px-7 py-2 border-t border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-muted-foreground shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-emerald-500" />
          <span>
            High-resolution vector PDF &bull; Ready for paper printing or digital archiving.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">
            Active Filter: <strong className="text-foreground">{activeCount}</strong> of {rawQuestions.length} approved items
          </span>
        </div>
      </footer>
    </div>
  );
}
