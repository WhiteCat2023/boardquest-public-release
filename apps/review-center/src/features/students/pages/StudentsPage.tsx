import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Calendar,
  GraduationCap,
  Edit3,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCandidates,
  useDeleteCandidate,
  type Candidate,
} from "../api/useCandidates";
import EnrollCandidateModal from "../components/EnrollCandidateModal";
import BulkEnrollModal from "../components/BulkEnrollModal";
import { CandidateScoreDrawer } from "@/features/scores/components/CandidateScoreDrawer";
import { PdfPreviewModal } from "@/features/scores/components/PdfPreviewModal";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";

const DEFAULT_KNOWN_YEARS = ["2026-2027", "2025-2026", "2024-2025"];

export function StudentsPage() {
  const { activeSchoolYear, currentSchoolYear } = useActiveSchoolYear();

  // Navigation State: null = School Years List, string = specific School Year view
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string | null>(
    null
  );

  // Filters within a School Year
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Query all candidates
  const { data, isLoading } = useCandidates({
    search: selectedSchoolYear ? searchTerm : undefined,
    schoolYear: selectedSchoolYear || undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const deleteCandidateMutation = useDeleteCandidate();

  const candidates = data?.candidates || [];
  const querySchoolYears = useMemo(() => data?.schoolYears || [], [data?.schoolYears]);
  const total = data?.total || 0;

  // Combine known and existing school years
  const allSchoolYearsList = useMemo(() => {
    return Array.from(
      new Set([...DEFAULT_KNOWN_YEARS, ...querySchoolYears])
    ).sort((a, b) => b.localeCompare(a));
  }, [querySchoolYears]);

  // Group stats per school year for the overview cards
  const { data: allData } = useCandidates();
  const allCandidatesList = useMemo(() => allData?.candidates || [], [allData?.candidates]);

  const schoolYearStats = useMemo(() => {
    const statsMap: Record<
      string,
      { count: number; completedCount: number; sampleStudents: string[] }
    > = {};

    allSchoolYearsList.forEach((sy) => {
      statsMap[sy] = { count: 0, completedCount: 0, sampleStudents: [] };
    });

    allCandidatesList.forEach((c) => {
      const sy = c.schoolYear || "2026-2027";
      if (!statsMap[sy]) {
        statsMap[sy] = { count: 0, completedCount: 0, sampleStudents: [] };
      }
      statsMap[sy].count++;
      if (c.status === "COMPLETED") {
        statsMap[sy].completedCount++;
      }
      if (statsMap[sy].sampleStudents.length < 3) {
        statsMap[sy].sampleStudents.push(c.name);
      }
    });

    return statsMap;
  }, [allSchoolYearsList, allCandidatesList]);

  const totalCompleted = allCandidatesList.filter((c) => c.status === "COMPLETED").length;

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [scoreCandidateId, setScoreCandidateId] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    assessmentId: string;
    candidateId: string;
  } | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(
    null
  );

  const handleOpenAddSingle = () => {
    setEditingCandidate(null);
    setIsSingleModalOpen(true);
  };

  const handleOpenEditSingle = (cand: Candidate) => {
    setEditingCandidate(cand);
    setIsSingleModalOpen(true);
  };

  const handleOpenBulk = () => {
    setIsBulkModalOpen(true);
  };

  const handleOpenDelete = (cand: Candidate) => {
    setCandidateToDelete(cand);
  };

  const handleConfirmDelete = () => {
    if (!candidateToDelete) return;
    deleteCandidateMutation.mutate(candidateToDelete.id, {
      onSuccess: () => {
        toast.success(`Removed ${candidateToDelete.name} from enrolled students.`);
        setCandidateToDelete(null);
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to remove student."
        );
      },
    });
  };

  const resetDrilldownFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  const isFiltered =
    Boolean(searchTerm) ||
    selectedStatus !== "ALL";

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 font-sans pb-12 animate-in fade-in duration-200">
      {/* ══════════════════════════════════════════════════════════════════
          VIEW 1: SCHOOL YEARS DIRECTORY (When no school year is selected)
      ══════════════════════════════════════════════════════════════════ */}
      {!selectedSchoolYear ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                <Users className="size-6 text-primary shrink-0" />
                Enrolled Students
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a school year below to view enrolled students.
              </p>
            </div>

            <Button
              onClick={() => {
                setSelectedSchoolYear("2026-2027");
                handleOpenAddSingle();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 h-9 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add Student</span>
            </Button>
          </div>

          {/* Overall Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Total Enrolled Students
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {allCandidatesList.length}
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <GraduationCap className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    School Years Active
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {allSchoolYearsList.length}
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Completed Students
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {totalCompleted}
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* School Years Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FolderOpen size={16} className="text-primary" />
              School Year Directory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSchoolYearsList.map((sy) => {
                const stats = schoolYearStats[sy] || {
                  count: 0,
                  completedCount: 0,
                  sampleStudents: [],
                };
                const isCurrent =
                  sy === currentSchoolYear ||
                  (!currentSchoolYear && sy === activeSchoolYear);

                return (
                  <Card
                    key={sy}
                    onClick={() => setSelectedSchoolYear(sy)}
                    className="rounded-2xl border-border bg-card shadow-2xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <CardContent className="p-5 space-y-3.5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                              S.Y. {sy}
                            </span>
                            {isCurrent && (
                              <span className="text-[9.5px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {stats.count === 0
                              ? "No students added yet"
                              : `${stats.count} enrolled student${stats.count === 1 ? "" : "s"}`}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
            VIEW 2: DRILL-DOWN STUDENTS LIST (For the clicked School Year)
        ══════════════════════════════════════════════════════════════════ */
        <div className="space-y-5">
          {/* Back Navigation Bar & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSchoolYear(null);
                    resetDrilldownFilters();
                  }}
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer mr-0.5"
                  title="Back to School Years"
                >
                  <ArrowLeft className="size-4" />
                </button>

                <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <span>School Year {selectedSchoolYear}</span>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                    {total} {total === 1 ? "Student" : "Students"}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing all MedTech review students enrolled for S.Y. {selectedSchoolYear}.
              </p>
            </div>

            {/* Action Buttons (Single Add & Bulk Add) */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Button
                variant="outline"
                onClick={handleOpenBulk}
                className="h-9 px-3.5 text-xs font-bold rounded-xl border-border hover:bg-accent flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-primary" />
                <span>Bulk Add Students</span>
              </Button>

              <Button
                onClick={handleOpenAddSingle}
                className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Student</span>
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-2xl border border-border shadow-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, email, or student ID..."
                className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="ALL" className="text-xs font-semibold">
                    All Status
                  </SelectItem>
                  <SelectItem value="ENROLLED" className="text-xs">
                    Enrolled
                  </SelectItem>
                  <SelectItem value="COMPLETED" className="text-xs">
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDrilldownFilters}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Students Table */}
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-2">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading students...</span>
              </div>
            ) : candidates.length === 0 ? (
              <Empty className="py-16">
                <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Users className="size-7" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle className="text-base font-bold text-foreground">
                    {isFiltered
                      ? "No Students Match Filters"
                      : `No Students in S.Y. ${selectedSchoolYear} Yet`}
                  </EmptyTitle>
                  <EmptyDescription className="text-xs text-muted-foreground leading-relaxed">
                    {isFiltered
                      ? "Try changing your search term or status filter."
                      : "Add students individually or bulk paste multiple students at once."}
                  </EmptyDescription>
                </EmptyHeader>

                {!isFiltered && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={handleOpenAddSingle}
                      size="sm"
                      className="font-bold text-xs rounded-xl gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Student</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleOpenBulk}
                      size="sm"
                      className="font-bold text-xs rounded-xl gap-1.5"
                    >
                      <FileSpreadsheet size={14} />
                      <span>Bulk Add Students</span>
                    </Button>
                  </div>
                )}
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Student</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Student ID</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((cand) => {
                      const initials = cand.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <TableRow
                          key={cand.id}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          {/* Student Info */}
                          <TableCell className="px-4 py-3 min-w-[200px]">
                            <button
                              type="button"
                              onClick={() => setScoreCandidateId(cand.id)}
                              className="flex items-center gap-2.5 text-left cursor-pointer group/student w-fit"
                              title="Click to view student scores & grade breakdown"
                            >
                              <Avatar className="size-8 rounded-lg border border-border shrink-0 group-hover/student:border-primary/50 transition-colors">
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground group-hover/student:text-primary transition-colors truncate">
                                  {cand.name}
                                </span>
                                <span className="text-[10.5px] text-muted-foreground truncate">
                                  {cand.email}
                                </span>
                              </div>
                            </button>
                          </TableCell>

                          {/* Student ID */}
                          <TableCell className="px-4 py-3 font-mono text-[11.5px] text-foreground font-semibold">
                            {cand.schoolId || "—"}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="px-4 py-3">
                            {cand.status === "COMPLETED" ? (
                              <Badge variant="muted" className="text-[10px] font-bold px-2 py-0.5">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] font-bold gap-1 px-2 py-0.5">
                                <CheckCircle2 size={10} /> Enrolled
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setScoreCandidateId(cand.id)}
                                className="size-7 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                title="View Scores & Grades"
                              >
                                <GraduationCap size={14} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenEditSingle(cand)}
                                className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit3 size={13} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenDelete(cand)}
                                className="size-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Individual Add/Edit Modal ── */}
      <EnrollCandidateModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        initialData={editingCandidate}
        defaultSchoolYear={selectedSchoolYear || "2026-2027"}
        existingSchoolYears={allSchoolYearsList}
      />

      {/* ── Bulk Add Modal ── */}
      <BulkEnrollModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        schoolYear={selectedSchoolYear || "2026-2027"}
      />

      {/* ── Candidate Scores & Grade Transcript Modal ── */}
      <CandidateScoreDrawer
        open={Boolean(scoreCandidateId)}
        onOpenChange={(open) => !open && setScoreCandidateId(null)}
        candidateId={scoreCandidateId}
        onPreviewPdf={(assessmentId, candidateId) => {
          setPdfPreviewData({ assessmentId, candidateId });
        }}
      />

      {/* ── PDF Preview Modal ── */}
      <PdfPreviewModal
        open={Boolean(pdfPreviewData)}
        onOpenChange={(open) => !open && setPdfPreviewData(null)}
        assessmentId={pdfPreviewData?.assessmentId || null}
        candidateId={pdfPreviewData?.candidateId || null}
      />

      {/* ── Confirm Delete Student Modal ── */}
      <ConfirmDialog
        open={Boolean(candidateToDelete)}
        onOpenChange={(open) => !open && setCandidateToDelete(null)}
        title="Remove Enrolled Student"
        description={
          <span>
            Are you sure you want to remove{" "}
            <strong className="text-foreground">{candidateToDelete?.name}</strong>
            {candidateToDelete?.schoolId ? ` (${candidateToDelete.schoolId})` : ""} from the directory?
            <br />
            This action will unenroll the candidate and remove their associated score records.
          </span>
        }
        confirmLabel="Remove Student"
        cancelLabel="Cancel"
        variant="destructive"
        icon="danger"
        isLoading={deleteCandidateMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default StudentsPage;
