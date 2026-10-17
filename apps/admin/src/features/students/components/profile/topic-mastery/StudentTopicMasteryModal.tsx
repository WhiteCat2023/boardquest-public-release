import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  FlaskConical,
  Microscope,
  Droplet,
  Dna,
  Eye,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Sword,
  Target,
  X,
} from "lucide-react";
import type { StudentTopicMasteryDetail } from "@/features/analytics/types/types";

export interface StudentTopicMasteryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSubject?: string | null;
  topics: StudentTopicMasteryDetail[];
  studentName?: string;
  onPrescribeGuidance?: (topicName: string, subjectName: string) => void;
}

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Clinical Chemistry": FlaskConical,
  "Microbiology": Microscope,
  "Hematology": Droplet,
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

type FilterStatus = "ALL" | "NEEDS_REVIEW" | "PROFICIENT" | "MASTERED" | "UNATTEMPTED";
type SortOption = "PRIORITY" | "ACCURACY_DESC" | "ACCURACY_ASC" | "QUESTIONS_DESC" | "NAME_ASC";

export function StudentTopicMasteryModal({
  open,
  onOpenChange,
  initialSubject,
  topics = [],
  studentName = "Student",
  onPrescribeGuidance,
}: StudentTopicMasteryModalProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("PRIORITY");

  // Keep selectedSubject in sync when modal opens with initialSubject
  React.useEffect(() => {
    if (open && initialSubject) {
      setSelectedSubject(initialSubject);
    } else if (open && !initialSubject) {
      setSelectedSubject("ALL");
    }
  }, [open, initialSubject]);

  // Filter and sort topics
  const filteredTopics = useMemo(() => {
    let list = [...topics];

    // Subject Filter
    if (selectedSubject !== "ALL") {
      list = list.filter((t) => t.subject === selectedSubject);
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.diagnosticNote && t.diagnosticNote.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter === "NEEDS_REVIEW") {
      list = list.filter((t) => t.status === "Needs Review");
    } else if (statusFilter === "PROFICIENT") {
      list = list.filter((t) => t.status === "Proficient");
    } else if (statusFilter === "MASTERED") {
      list = list.filter((t) => t.status === "Mastered");
    } else if (statusFilter === "UNATTEMPTED") {
      list = list.filter((t) => t.status === "Unattempted");
    }

    // Sort Order
    list.sort((a, b) => {
      if (sortBy === "PRIORITY") {
        const priorityOrder: Record<string, number> = {
          "Needs Review": 1,
          "Unattempted": 2,
          "Proficient": 3,
          "Mastered": 4,
        };
        const pDiff = (priorityOrder[a.status] || 5) - (priorityOrder[b.status] || 5);
        if (pDiff !== 0) return pDiff;
        if (a.status === "Needs Review" || a.status === "Proficient") {
          return a.accuracy - b.accuracy;
        }
        return b.totalQuestions - a.totalQuestions;
      }
      if (sortBy === "ACCURACY_DESC") return b.accuracy - a.accuracy;
      if (sortBy === "ACCURACY_ASC") return a.accuracy - b.accuracy;
      if (sortBy === "QUESTIONS_DESC") return b.totalQuestions - a.totalQuestions;
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [topics, selectedSubject, searchQuery, statusFilter, sortBy]);

  // Metrics for header pill badges
  const metrics = useMemo(() => {
    const targetSet = selectedSubject === "ALL" ? topics : topics.filter((t) => t.subject === selectedSubject);
    const total = targetSet.length;
    const mastered = targetSet.filter((t) => t.status === "Mastered").length;
    const needsReview = targetSet.filter((t) => t.status === "Needs Review").length;
    const totalAttempts = targetSet.reduce((sum, t) => sum + (t.totalAttempts || 0), 0);
    const totalCorrect = targetSet.reduce((sum, t) => sum + (t.totalCorrect || 0), 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return { total, mastered, needsReview, avgAccuracy };
  }, [topics, selectedSubject]);

  const IconComponent = selectedSubject !== "ALL" ? (SUBJECT_ICONS[selectedSubject] || BookOpen) : BookOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-2 border-primary/20 shadow-2xl rounded-2xl sm:rounded-3xl font-sans">
        
        {/* 1. Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b border-border/80 p-4 sm:p-5 shrink-0">
          <div className="flex items-start justify-between gap-3 relative z-10 pr-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-2xs shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Topic Mastery Matrix
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                    &bull; {studentName}&apos;s MTLE Diagnostic Profile
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg md:text-xl font-black tracking-tight text-foreground uppercase truncate">
                  {selectedSubject === "ALL" ? "All Board Licensure Disciplines" : selectedSubject}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                  Granular subtopic performance analytics, curriculum coverage, and educational guidance referral.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-border/60">
            <div className="bg-background/80 backdrop-blur-sm border border-border/80 rounded-xl p-2 text-center">
              <span className="text-[9.5px] uppercase font-bold text-muted-foreground block truncate">Total Topics</span>
              <span className="text-base font-black font-mono text-foreground">{metrics.total}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-2 text-center">
              <span className="text-[9.5px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block truncate">Mastered</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{metrics.mastered}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2 text-center">
              <span className="text-[9.5px] uppercase font-bold text-amber-600 dark:text-amber-400 block truncate">Needs Review</span>
              <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">{metrics.needsReview}</span>
            </div>
            <div className="bg-primary/10 border border-primary/25 rounded-xl p-2 text-center">
              <span className="text-[9.5px] uppercase font-bold text-primary block truncate">Avg Accuracy</span>
              <span className="text-base font-black font-mono text-primary">{metrics.avgAccuracy}%</span>
            </div>
          </div>
        </div>

        {/* 2. Controls Toolbar: Discipline Dropdown, Search Input & Sort Dropdown */}
        <div className="p-3 sm:p-4 bg-muted/30 border-b border-border/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
          {/* Discipline Selector */}
          <div className="w-full md:w-56 shrink-0">
            <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val)}>
              <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-background border border-border">
                <SelectValue placeholder="All Disciplines" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem value="ALL" className="text-xs font-semibold cursor-pointer">
                  All Disciplines
                </SelectItem>
                {OFFICIAL_SUBJECTS.map((sub) => (
                  <SelectItem key={sub} value={sub} className="text-xs font-semibold cursor-pointer">
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g., Lipids, Cocci, Urinalysis)..."
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
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-background border border-border gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                <SelectItem value="PRIORITY" className="text-xs font-semibold cursor-pointer">
                  Priority (Weakest First)
                </SelectItem>
                <SelectItem value="ACCURACY_DESC" className="text-xs font-semibold cursor-pointer">
                  Highest Accuracy
                </SelectItem>
                <SelectItem value="ACCURACY_ASC" className="text-xs font-semibold cursor-pointer">
                  Lowest Accuracy
                </SelectItem>
                <SelectItem value="QUESTIONS_DESC" className="text-xs font-semibold cursor-pointer">
                  Most Questions
                </SelectItem>
                <SelectItem value="NAME_ASC" className="text-xs font-semibold cursor-pointer">
                  Topic Name (A-Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Status Filter Pills */}
        <div className="px-3 sm:px-4 py-2 border-b border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
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
            All ({metrics.total})
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
            Needs Review ({topics.filter((t) => (selectedSubject === "ALL" || t.subject === selectedSubject) && t.status === "Needs Review").length})
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
            Proficient ({topics.filter((t) => (selectedSubject === "ALL" || t.subject === selectedSubject) && t.status === "Proficient").length})
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
            Mastered ({topics.filter((t) => (selectedSubject === "ALL" || t.subject === selectedSubject) && t.status === "Mastered").length})
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
            Unattempted ({topics.filter((t) => (selectedSubject === "ALL" || t.subject === selectedSubject) && t.status === "Unattempted").length})
          </Button>
        </div>

        {/* 4. Scrollable Topics List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-[320px] max-h-[55vh]">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topicItem) => {
              const isUnattempted = topicItem.totalAttempts === 0 || topicItem.status === "Unattempted";
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
                  className="p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/row shadow-2xs"
                >
                  {/* Left: Name, Subject, Diagnostic note */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover/row:text-primary transition-colors">
                        {topicItem.name}
                      </span>
                      <Badge variant="outline" className="text-[9.5px] font-semibold text-muted-foreground bg-muted/60">
                        {topicItem.subject}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {topicItem.diagnosticNote || "High-yield licensure examination topic."}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-0.5">
                      <span>Questions Attempted: <strong className="text-foreground">{topicItem.attemptedQuestions}</strong> / {topicItem.totalQuestions || "Bank"}</span>
                      {topicItem.totalAttempts > 0 && (
                        <span>Attempts: <strong className="text-foreground">{topicItem.totalAttempts}</strong></span>
                      )}
                      {topicItem.lastPracticed && (
                        <span>Last Active: {new Date(topicItem.lastPracticed).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Accuracy Pill & Action Button */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <Badge variant="outline" className={`text-[10px] font-mono font-bold px-2 py-0.5 ${badgeStyle}`}>
                      {isUnattempted ? "Unattempted" : `${topicItem.accuracy}% Acc`}
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onOpenChange(false);
                        onPrescribeGuidance?.(topicItem.name, topicItem.subject);
                      }}
                      className="h-7 px-2.5 text-[11px] font-bold border-primary/30 hover:bg-primary/10 text-primary rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Sword className="w-3 h-3 text-primary" />
                      <span>Prescribe Drill</span>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-1.5 my-4">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="text-xs font-bold text-foreground">No matching topics found</p>
              <p className="text-[11px]">Try adjusting your search terms or status filters above.</p>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
