import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  Sword,
  Target,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Microscope,
  Droplet,
  Dna,
  Eye,
  FileText,
  X,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentTopicMastery } from "@/features/analytics";
import type { TopicDiagnosticItem } from "@/features/analytics/types/types";
import type { Student, SubjectMetricItem } from "../../types/types";
import { TopicMasteryAiHeroCard } from "./topic-mastery/TopicMasteryAiHeroCard";
import { StudentTopicMasteryModal } from "./topic-mastery/StudentTopicMasteryModal";

export interface StudentTopicMasteryTabProps {
  student: Student;
  onPrescribeGuidance?: (initialData?: {
    subject?: string;
    reason?: string;
  }) => void;
}

const SUBJECT_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Clinical Chemistry": FlaskConical,
  Microbiology: Microscope,
  Hematology: Droplet,
  "Immunology & Serology and Immunohematology": Dna,
  "Clinical Microscopy & Parasitology": Eye,
  "Histopathology & MT Laws": FileText,
  "Histopathology and Medtech Laws": FileText,
};

const OFFICIAL_SUBJECTS = [
  "Clinical Chemistry",
  "Microbiology",
  "Hematology",
  "Immunology & Serology and Immunohematology",
  "Clinical Microscopy & Parasitology",
  "Histopathology and Medtech Laws",
];

type InPageStatusFilter =
  | "ALL"
  | "NEEDS_REVIEW"
  | "PROFICIENT"
  | "MASTERED"
  | "UNATTEMPTED";
type InPageSort = "PRIORITY" | "ACCURACY_DESC" | "ACCURACY_ASC" | "NAME_ASC";

export function StudentTopicMasteryTab({
  student,
  onPrescribeGuidance,
}: StudentTopicMasteryTabProps) {
  const { data: topicData, isLoading } = useStudentTopicMastery(student.id);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialSubject, setModalInitialSubject] = useState<string | null>(
    null,
  );

  // In-Page Matrix Controls State
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InPageStatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<InPageSort>("PRIORITY");

  // In-Page Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset pagination to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDiscipline, searchQuery, statusFilter, sortBy]);

  const allTopics = topicData?.allTopics || [];
  const subjectMetrics: SubjectMetricItem[] = student.subjectMetrics || [];

  // Open modal with specific subject
  const handleOpenModal = (subject?: string) => {
    setModalInitialSubject(subject || null);
    setIsModalOpen(true);
  };

  // Prescribe guidance handler
  const handlePrescribeWeak = (item: TopicDiagnosticItem) => {
    onPrescribeGuidance?.({
      subject: item.subject,
      reason: `Prescribed academic drill for weak subtopic "${item.topic}" in ${item.subject}. Requires score remediation to reach 75% licensure passing threshold.`,
    });
  };

  const handlePrescribeTopicName = (topicName: string, subjectName: string) => {
    onPrescribeGuidance?.({
      subject: subjectName,
      reason: `Targeted review drill for "${topicName}" in ${subjectName}.`,
    });
  };

  // In-Page Filtered and Sorted Topics
  const inPageTopics = useMemo(() => {
    let list = [...allTopics];

    if (selectedDiscipline !== "ALL") {
      list = list.filter((t) => t.subject === selectedDiscipline);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.diagnosticNote && t.diagnosticNote.toLowerCase().includes(q)),
      );
    }

    if (statusFilter === "NEEDS_REVIEW") {
      list = list.filter((t) => t.status === "Needs Review");
    } else if (statusFilter === "PROFICIENT") {
      list = list.filter((t) => t.status === "Proficient");
    } else if (statusFilter === "MASTERED") {
      list = list.filter((t) => t.status === "Mastered");
    } else if (statusFilter === "UNATTEMPTED") {
      list = list.filter((t) => t.status === "Unattempted");
    }

    list.sort((a, b) => {
      if (sortBy === "PRIORITY") {
        const order: Record<string, number> = {
          "Needs Review": 1,
          Unattempted: 2,
          Proficient: 3,
          Mastered: 4,
        };
        const pDiff = (order[a.status] || 5) - (order[b.status] || 5);
        if (pDiff !== 0) return pDiff;
        if (a.status === "Needs Review") return a.accuracy - b.accuracy;
        return b.totalQuestions - a.totalQuestions;
      }
      if (sortBy === "ACCURACY_DESC") return b.accuracy - a.accuracy;
      if (sortBy === "ACCURACY_ASC") return a.accuracy - b.accuracy;
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [allTopics, selectedDiscipline, searchQuery, statusFilter, sortBy]);

  // Pagination Calculations
  const totalItems = inPageTopics.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTopics = inPageTopics.slice(startIndex, startIndex + pageSize);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200 font-sans text-foreground pb-8">
      {/* 1. HERO SECTION: Topic Mastery via AI Analytics (Matching Image 1) */}
      <TopicMasteryAiHeroCard
        summary={topicData?.summary}
        studentName={student.name}
        onOpenMatrixModal={handleOpenModal}
        onPrescribeGuidance={handlePrescribeWeak}
        onReviewTopic={(item) => handleOpenModal(item.subject)}
      />

      {/* 3. IN-PAGE INTERACTIVE TOPIC MATRIX EXPLORER */}
      <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-primary/10 text-primary">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span className="text-[9.5px] font-black uppercase tracking-widest text-primary">
                Curriculum Topic Diagnostics
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
              Full Subtopic Performance Explorer
            </h3>
            <p className="text-[11.5px] text-muted-foreground">
              Review accuracy scores and assign targeted remedial drills
              directly to {student.name}.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenModal()}
            className="h-8 px-3 text-xs font-bold border-primary/30 hover:bg-primary/10 text-primary rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Dedicated Modal</span>
          </Button>
        </div>

        {/* Toolbar: Discipline Filter, Search, Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Discipline Selector */}
          <div className="w-full md:w-56 shrink-0">
            <Select
              value={selectedDiscipline}
              onValueChange={(val) => setSelectedDiscipline(val)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-background border border-border">
                <SelectValue placeholder="All Disciplines" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem
                  value="ALL"
                  className="text-xs font-semibold cursor-pointer"
                >
                  All Disciplines
                </SelectItem>
                {OFFICIAL_SUBJECTS.map((sub) => (
                  <SelectItem
                    key={sub}
                    value={sub}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics by keyword (e.g., Lipoproteins, Enzymes)..."
              className="pl-9 pr-8 h-9 text-xs rounded-xl bg-background border-border"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-48 shrink-0">
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as InPageSort)}
            >
              <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-background border border-border gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem
                  value="PRIORITY"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Priority (Weakest First)
                </SelectItem>
                <SelectItem
                  value="ACCURACY_DESC"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Highest Accuracy
                </SelectItem>
                <SelectItem
                  value="ACCURACY_ASC"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Lowest Accuracy
                </SelectItem>
                <SelectItem
                  value="NAME_ASC"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Topic Name (A-Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter("ALL")}
            className={`h-7 px-2.5 text-[11px] rounded-lg font-bold shrink-0 transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
                : "border border-border/80 bg-background text-foreground hover:bg-muted"
            }`}
          >
            All Topics ({allTopics.length})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter("NEEDS_REVIEW")}
            className={`h-7 px-2.5 text-[11px] rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
              statusFilter === "NEEDS_REVIEW"
                ? "bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Needs Review (
            {allTopics.filter((t) => t.status === "Needs Review").length})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter("PROFICIENT")}
            className={`h-7 px-2.5 text-[11px] rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
              statusFilter === "PROFICIENT"
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                : "border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
            }`}
          >
            Proficient (
            {allTopics.filter((t) => t.status === "Proficient").length})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter("MASTERED")}
            className={`h-7 px-2.5 text-[11px] rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all ${
              statusFilter === "MASTERED"
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Mastered ({allTopics.filter((t) => t.status === "Mastered").length})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter("UNATTEMPTED")}
            className={`h-7 px-2.5 text-[11px] rounded-lg font-bold shrink-0 transition-all ${
              statusFilter === "UNATTEMPTED"
                ? "bg-muted-foreground text-background shadow-2xs"
                : "border border-border/80 bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Unattempted (
            {allTopics.filter((t) => t.status === "Unattempted").length})
          </Button>
        </div>

        {/* In-Page Topic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {paginatedTopics.length > 0 ? (
            paginatedTopics.map((topicItem) => {
              const isUnattempted =
                topicItem.totalAttempts === 0 ||
                topicItem.status === "Unattempted";
              const isMastered = topicItem.status === "Mastered";
              const isNeedsReview = topicItem.status === "Needs Review";

              const badgeStyle = isMastered
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : isNeedsReview
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                  : isUnattempted
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-blue-500/10 text-blue-500 border-blue-500/30";

              return (
                <div
                  key={`${topicItem.subject}-${topicItem.name}-${topicItem.id}`}
                  className="p-3 rounded-xl bg-muted/30 border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between gap-2.5 group/item shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover/item:text-primary transition-colors leading-tight">
                          {topicItem.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {topicItem.subject}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 shrink-0 ${badgeStyle}`}
                      >
                        {isUnattempted
                          ? "Unattempted"
                          : `${topicItem.accuracy}% Acc`}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {topicItem.diagnosticNote ||
                        "Licensure syllabus high-yield domain."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60 text-[10.5px]">
                    <span className="text-muted-foreground font-mono">
                      {topicItem.totalAttempts > 0
                        ? `${topicItem.totalAttempts} attempts • ${topicItem.totalCorrect} correct`
                        : "Unattempted in Quest Bank"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handlePrescribeTopicName(
                          topicItem.name,
                          topicItem.subject,
                        )
                      }
                      className="h-6 px-2 text-[10.5px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Sword className="w-3 h-3 text-primary" />
                      <span>Prescribe Drill</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground space-y-1.5">
              <p className="text-xs font-bold text-foreground">
                No topics match your current filter.
              </p>
              <p className="text-[11px]">
                Clear search or select another discipline.
              </p>
            </div>
          )}
        </div>

        {/* Standardized Pagination Footer */}
        {totalItems > 0 && (
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 30, 40]}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onPageSelect={(page) => setCurrentPage(page)}
            itemLabel="topics"
            variant="table-footer"
          />
        )}
      </Card>

      {/* 4. MODAL DIALOG COMPONENT */}
      <StudentTopicMasteryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialSubject={modalInitialSubject}
        topics={allTopics}
        studentName={student.name}
        onPrescribeGuidance={handlePrescribeTopicName}
      />
    </div>
  );
}
