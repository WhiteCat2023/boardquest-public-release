import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { CandidateScoreDrawer } from "@/features/scores/components/CandidateScoreDrawer";
import { PdfPreviewModal } from "@/features/scores/components/PdfPreviewModal";

export function SchoolYearStudentsPage() {
  const { schoolYear = "2026-2027" } = useParams<{ schoolYear: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const { data, isLoading } = useCandidates({
    search: searchTerm,
    schoolYear,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const deleteCandidateMutation = useDeleteCandidate();

  const candidates = data?.candidates || [];
  const total = data?.total || 0;

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
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

  const handleDelete = (cand: Candidate) => {
    deleteCandidateMutation.mutate(cand.id, {
      onSuccess: () => {
        toast.success(`Removed ${cand.name} from enrolled students.`);
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to remove student."
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
    <div className="space-y-5 max-w-7xl w-full mx-auto font-sans">
      {/* ── 1. Top Navigation & Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/candidates"
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer mr-0.5"
              title="Back to School Years"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <span>School Year {schoolYear}</span>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                {total} {total === 1 ? "Student" : "Students"}
              </span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Showing all MedTech review students enrolled for S.Y. {schoolYear}.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            asChild
            className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Link to={`/candidates/${schoolYear}/add`}>
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
          <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Users className="size-7" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-foreground">
                {isFiltered
                  ? "No Students Match Filters"
                  : `No Students in S.Y. ${schoolYear} Yet`}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isFiltered
                  ? "Try changing your search term or status filter."
                  : "Add students individually or bulk paste multiple students at once."}
              </p>
            </div>

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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {candidates.map((cand) => {
                  const initials = cand.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="px-4 py-3 min-w-[200px]">
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
                      </td>

                      {/* Student ID */}
                      <td className="px-4 py-3 font-mono text-[11.5px] text-foreground font-semibold">
                        {cand.schoolId || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {cand.status === "COMPLETED" ? (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Enrolled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setScoreCandidateId(cand.id)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            title="View Scores & Grades"
                          >
                            <GraduationCap size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSingle(cand)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cand)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    </div>
  );
}

export default SchoolYearStudentsPage;
