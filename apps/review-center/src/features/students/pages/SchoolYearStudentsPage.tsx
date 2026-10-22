import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  GraduationCap,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useCandidates,
  useDeleteCandidate,
  useUpdateSchoolYear,
  useDeleteSchoolYear,
  type Candidate,
} from "../api/useCandidates";
import {
  formatSchoolYearInput,
  normalizeSchoolYear,
  isValidSchoolYear,
} from "@/lib/utils";
import EnrollCandidateModal from "../components/EnrollCandidateModal";
import { CandidateScoreDrawer } from "@/features/scores/components/CandidateScoreDrawer";
import { PdfPreviewModal } from "@/features/scores/components/PdfPreviewModal";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";

import { useActiveSchoolYear } from "@/context/SchoolYearContext";

export function SchoolYearStudentsPage() {
  const navigate = useNavigate();
  const { activeSchoolYear } = useActiveSchoolYear();
  const { schoolYear: routeSchoolYear } = useParams<{ schoolYear: string }>();
  const schoolYear = routeSchoolYear || activeSchoolYear || "2026-2027";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isEditYearOpen, setIsEditYearOpen] = useState(false);
  const [editYearInput, setEditYearInput] = useState(schoolYear);

  const [isDeleteYearOpen, setIsDeleteYearOpen] = useState(false);
  const [deleteYearConfirmInput, setDeleteYearConfirmInput] = useState("");

  const { data, isLoading } = useCandidates({
    search: searchTerm,
    schoolYear,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const deleteCandidateMutation = useDeleteCandidate();
  const updateSchoolYearMutation = useUpdateSchoolYear();
  const deleteSchoolYearMutation = useDeleteSchoolYear();

  const candidates = data?.candidates || [];
  const total = data?.total || 0;

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(
    null
  );
  const [scoreCandidateId, setScoreCandidateId] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    assessmentId: string;
    candidateId: string;
  } | null>(null);

  const handleOpenEditSingle = (cand: Candidate) => {
    setEditingCandidate(cand);
    setIsSingleModalOpen(true);
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

  const handleUpdateSchoolYear = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = normalizeSchoolYear(editYearInput);

    if (!isValidSchoolYear(formatted)) {
      toast.error("Please enter a valid school year in YYYY-YYYY format (e.g. 2026-2027).");
      return;
    }

    if (formatted === schoolYear) {
      setIsEditYearOpen(false);
      return;
    }

    updateSchoolYearMutation.mutate(
      { oldSchoolYear: schoolYear, newSchoolYear: formatted },
      {
        onSuccess: () => {
          toast.success(`School Year updated to ${formatted}!`);
          setIsEditYearOpen(false);
          navigate(`/candidates/${formatted}`, { replace: true });
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update school year."
          );
        },
      }
    );
  };

  const handleDeleteSchoolYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteYearConfirmInput.trim() !== schoolYear.trim()) {
      toast.error(`Please type "${schoolYear}" exactly to confirm deletion.`);
      return;
    }

    deleteSchoolYearMutation.mutate(schoolYear, {
      onSuccess: () => {
        toast.success(`School Year ${schoolYear} deleted successfully.`);
        setIsDeleteYearOpen(false);
        navigate("/candidates", { replace: true });
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to delete school year."
        );
      },
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  const isFiltered =
    Boolean(searchTerm) ||
    selectedStatus !== "ALL";

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 font-sans pb-12 animate-in fade-in duration-200">
      {/* ── 1. Top Navigation & Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Enrolled Students
              </h1>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                SY {schoolYear}
              </span>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                {total} {total === 1 ? "Student" : "Students"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing all MedTech review students enrolled for School Year {schoolYear}.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            asChild
            className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Link to={`/candidates/${encodeURIComponent(schoolYear)}/add`}>
              <Plus size={14} />
              <span>Add Student</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. Search & Filter Bar ── */}
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

        {/* Reset Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* ── 3. Students Table ── */}
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
                  : `No Students in S.Y. ${schoolYear} Yet`}
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
                  asChild
                  size="sm"
                  className="font-bold text-xs rounded-xl gap-1.5"
                >
                  <Link to={`/candidates/${schoolYear}/add`}>
                    <Plus size={14} />
                    <span>Add Student</span>
                  </Link>
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

      {/* ── Individual Add/Edit Modal ── */}
      <EnrollCandidateModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        initialData={editingCandidate}
        defaultSchoolYear={schoolYear}
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
            This action will unenroll the candidate from School Year {schoolYear} and remove their associated score records.
          </span>
        }
        confirmLabel="Remove Student"
        cancelLabel="Cancel"
        variant="destructive"
        icon="danger"
        isLoading={deleteCandidateMutation.isPending}
        onConfirm={handleConfirmDelete}
      />

      {/* ── Edit School Year Modal ── */}
      <Dialog
        open={isEditYearOpen}
        onOpenChange={(open) => !open && setIsEditYearOpen(false)}
      >
        <DialogContent className="max-w-[420px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
          <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Pencil className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                  Edit School Year
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update School Year {schoolYear}. Enrolled candidates and assessments will be updated.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateSchoolYear} className="px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>School Year</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={editYearInput}
                onChange={(e) => setEditYearInput(formatSchoolYearInput(e.target.value))}
                onBlur={() => setEditYearInput(normalizeSchoolYear(editYearInput))}
                placeholder="2026-2027"
                maxLength={9}
                className="h-9.5 text-xs font-mono rounded-xl bg-background border-border"
                autoFocus
                disabled={updateSchoolYearMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditYearOpen(false)}
                className="h-8.5 px-3.5 text-xs rounded-xl border-border cursor-pointer"
                disabled={updateSchoolYearMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !editYearInput.trim() ||
                  editYearInput === schoolYear ||
                  updateSchoolYearMutation.isPending
                }
                className="h-8.5 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
              >
                {updateSchoolYearMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete School Year Confirmation Modal ── */}
      <Dialog
        open={isDeleteYearOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteYearOpen(false);
            setDeleteYearConfirmInput("");
          }
        }}
      >
        <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
          <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-destructive/5">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-destructive tracking-tight">
                  Delete School Year
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Confirm deletion for School Year {schoolYear}.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleDeleteSchoolYear} className="px-5 py-4 space-y-4">
            {/* Warning Message */}
            <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
              <div className="flex items-start gap-2 text-destructive font-bold text-xs">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>Notice: Make sure your data is backed up</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please make sure you have backed up any data inside or that there is no data inside this school year before proceeding.
              </p>
              {total > 0 && (
                <div className="text-[11.5px] font-semibold text-destructive bg-destructive/10 p-2 rounded-lg">
                  Deleting this school year will permanently delete {total} enrolled candidate{total === 1 ? "" : "s"} and all their examination scores.
                </div>
              )}
            </div>

            {/* Confirmation input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                To confirm, please type <span className="font-mono font-bold text-destructive select-all">{schoolYear}</span> below:
              </label>
              <Input
                value={deleteYearConfirmInput}
                onChange={(e) => setDeleteYearConfirmInput(e.target.value)}
                placeholder={schoolYear || "YYYY-YYYY"}
                className="h-9.5 text-xs font-mono rounded-xl bg-background border-border"
                autoFocus
                disabled={deleteSchoolYearMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteYearOpen(false);
                  setDeleteYearConfirmInput("");
                }}
                className="h-8.5 px-3.5 text-xs rounded-xl border-border cursor-pointer"
                disabled={deleteSchoolYearMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !schoolYear ||
                  deleteYearConfirmInput.trim() !== schoolYear.trim() ||
                  deleteSchoolYearMutation.isPending
                }
                className="h-8.5 px-4 text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs cursor-pointer"
              >
                {deleteSchoolYearMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Deleting...
                  </>
                ) : (
                  "Delete School Year"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SchoolYearStudentsPage;
