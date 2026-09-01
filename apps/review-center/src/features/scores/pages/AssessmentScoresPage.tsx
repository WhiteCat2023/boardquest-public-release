import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  Upload,
  Eye,
  Send,
  Trash2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Users,
  Sparkles,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Mail,
  FileText,
  Plus,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useAssessment,
  useDeleteAssessment,
  useEmailGradeReports,
  downloadAssessmentTemplate,
} from "../api/useAssessments";
import { useCandidates } from "@/features/students/api/useCandidates";
import {
  MEDTECH_SUBJECT_DETAILS,
  getSubjectBySlug,
} from "../types";
import type { ScoreRecord } from "../types";
import { BulkScoreUploadModal } from "../components/BulkScoreUploadModal";
import { PdfPreviewModal } from "../components/PdfPreviewModal";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { DeleteAssessmentModal } from "../components/DeleteAssessmentModal";
import { ManualScoreModal } from "../components/ManualScoreModal";

export function AssessmentScoresPage() {
  const { assessmentId, subjectSlug } = useParams<{
    assessmentId: string;
    subjectSlug?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Queries
  const { data: assessmentData, isLoading: isAssessmentLoading, refetch: refetchAssessment } = useAssessment(assessmentId);
  const assessment = assessmentData?.assessment;

  const subjectDetail = getSubjectBySlug(subjectSlug || (assessment?.subject ? assessment.subject.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined));
  const activeSubjectName = assessment?.subject || subjectDetail?.name || "Clinical Chemistry";
  const activeSchoolYear = assessment?.schoolYear || searchParams.get("sy") || "2026-2027";

  const { data: candidatesData } = useCandidates({
    schoolYear: activeSchoolYear,
  });

  const enrolledCandidates = candidatesData?.candidates || [];

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    assessmentId: string;
    candidateId?: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [manualScoreStudent, setManualScoreStudent] = useState<{
    candidateId: string;
    name: string;
    email: string;
    schoolId?: string;
    score: number | null;
  } | null>(null);

  const deleteAssessmentMutation = useDeleteAssessment();
  const emailReportsMutation = useEmailGradeReports();

  // Combine enrolled candidates with existing score records
  const studentRows = useMemo(() => {
    const scoresMap = new Map<string, ScoreRecord>();
    if (assessment?.scores) {
      for (const s of assessment.scores) {
        scoresMap.set(s.candidateId, s);
      }
    }

    // List all enrolled candidates in this school year
    const allStudents = enrolledCandidates.map((c) => {
      const scoreRecord = scoresMap.get(c.id);
      return {
        candidateId: c.id,
        name: c.name,
        email: c.email,
        schoolId: c.schoolId || "—",
        scoreRecord,
        score: scoreRecord?.score ?? null,
        percentage: scoreRecord?.percentage ?? null,
        percentile: scoreRecord?.percentile ?? null,
        status: scoreRecord?.status ?? "NOT_RECORDED",
        emailStatus: scoreRecord?.emailStatus ?? "NOT_SENT",
      };
    });

    // Also include any score records for candidates not in current enrolledCandidates list
    for (const s of assessment?.scores || []) {
      const exists = allStudents.some((st) => st.candidateId === s.candidateId);
      if (!exists && s.candidate) {
        allStudents.push({
          candidateId: s.candidateId,
          name: s.candidate.name,
          email: s.candidate.email,
          schoolId: s.candidate.schoolId || "—",
          scoreRecord: s,
          score: s.score,
          percentage: s.percentage,
          percentile: s.percentile,
          status: s.status,
          emailStatus: s.emailStatus,
        });
      }
    }

    // Filter by search & score status
    return allStudents.filter((row) => {
      const matchesSearch =
        !searchTerm ||
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.schoolId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "RECORDED") return row.score !== null;
      if (statusFilter === "NOT_RECORDED") return row.score === null;
      if (statusFilter === "PASSED") {
        return row.percentage !== null && row.percentage >= (assessment?.passingRate || 75);
      }
      if (statusFilter === "FAILED") {
        return row.percentage !== null && row.percentage < (assessment?.passingRate || 75);
      }

      return true;
    });
  }, [enrolledCandidates, assessment, searchTerm, statusFilter]);

  const hasScores = (assessment?._count?.scores ?? 0) > 0 || (assessment?.scores?.length ?? 0) > 0;

  const handleDeleteAssessment = () => {
    if (!assessment) return;
    setIsDeleteDialogOpen(true);
  };

  const handleEmailCohortReports = () => {
    if (!assessment) return;
    setIsEmailDialogOpen(true);
  };

  const handleDownloadTemplate = async () => {
    if (!assessment) return;
    try {
      await downloadAssessmentTemplate(assessment.id, assessment.title);
      toast.success("Roster template downloaded.");
    } catch {
      toast.error("Failed to download template.");
    }
  };

  if (isAssessmentLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center font-sans text-sm text-muted-foreground animate-pulse">
        Loading assessment details & scores...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card max-w-lg mx-auto mt-12">
        <AlertCircle className="size-8 text-destructive mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground">Assessment Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1">
          This assessment does not exist or you do not have permission to view it.
        </p>
        <Button
          onClick={() => navigate("/scores")}
          size="sm"
          className="mt-4 font-bold"
        >
          Return to Scores Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans pb-12 animate-in fade-in duration-200">
      {/* ── 1. Page Header & Top Actions ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Left: Info Cluster */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(`/scores/subject/${subjectDetail?.slug || "clinical-chemistry"}?sy=${activeSchoolYear}`)}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs shrink-0 cursor-pointer mt-0.5"
            title="Back to Subject"
          >
            <ArrowLeft className="size-4" />
          </button>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-foreground tracking-tight capitalize">
                {assessment.title}
              </h1>
              <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                {activeSubjectName}
              </Badge>
              {assessment.customLabel && (
                <Badge variant="secondary" className="font-semibold text-xs tracking-wide">
                  {assessment.customLabel}
                </Badge>
              )}
            </div>

            {/* Assessment Key Parameters Bar */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                <span>S.Y. {assessment.schoolYear}</span>
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Award className="size-3.5 text-muted-foreground/70" />
                <span>Max Score: <strong className="text-foreground font-bold">{assessment.maxScore} pts</strong></span>
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
                <span>Passing Cutoff: <strong className="text-foreground font-bold">{assessment.passingScore} pts</strong> ({assessment.passingRate}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 self-start xl:self-center shrink-0">
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="font-bold gap-1.5 shadow-sm text-xs h-9 px-4 cursor-pointer"
          >
            <Upload className="size-3.5" />
            <span>Upload</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-bold gap-1.5 text-xs h-9 px-3 bg-card hover:bg-muted text-foreground cursor-pointer shadow-xs"
              >
                <span>Actions</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-sans">
              <DropdownMenuItem
                disabled={!hasScores}
                onClick={() => setPdfPreviewData({ assessmentId: assessment.id })}
                className="gap-2 text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                <Eye className="size-3.5 text-primary" />
                <span>Preview PDF Grade Slip</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!hasScores || emailReportsMutation.isPending}
                onClick={handleEmailCohortReports}
                className="gap-2 text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                <Send className="size-3.5 text-blue-600" />
                <span>Email Students</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDownloadTemplate}
                className="gap-2 text-xs font-semibold cursor-pointer"
              >
                <Download className="size-3.5 text-muted-foreground" />
                <span>Download Roster CSV</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDeleteAssessment}
                className="gap-2 text-xs font-semibold text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Assessment</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── 2. Cohort Statistical KPI Cards for this Assessment ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Enrolled / Scored */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled / Scored
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Users className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {(assessment.passCount || 0) + (assessment.failCount || 0)}
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                / {enrolledCandidates.length} enrolled
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              {enrolledCandidates.length > 0
                ? `${Math.round((((assessment.passCount || 0) + (assessment.failCount || 0)) / enrolledCandidates.length) * 100)}% roster recorded`
                : "No students enrolled"}
            </p>
          </div>
        </div>

        {/* Card 2: Assessment Mean */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Assessment Mean (&mu;)
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {assessment.meanScore !== null && assessment.meanScore !== undefined
                  ? assessment.meanScore.toFixed(1)
                  : "—"}
              </h3>
              {assessment.meanScore !== null && assessment.meanScore !== undefined && (
                <span className="text-xs font-bold text-muted-foreground">
                  pts / {assessment.maxScore}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Cohort average score
            </p>
          </div>
        </div>

        {/* Card 3: Median Score */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Median Score
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {assessment.medianScore !== null && assessment.medianScore !== undefined
                  ? assessment.medianScore.toFixed(1)
                  : "—"}
              </h3>
              {assessment.medianScore !== null && assessment.medianScore !== undefined && (
                <span className="text-xs font-bold text-muted-foreground">
                  pts / {assessment.maxScore}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              50th percentile midpoint
            </p>
          </div>
        </div>

        {/* Card 4: Passing Rate */}
        {(() => {
          const total = (assessment.passCount || 0) + (assessment.failCount || 0);
          const rate = total > 0 ? ((assessment.passCount || 0) / total) * 100 : null;
          const isHighPass = rate !== null && rate >= (assessment.passingRate || 75);

          return (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Passing Rate (&ge; {assessment.passingRate}%)
                </span>
                <div
                  className={`p-2 rounded-xl border ${
                    rate === null
                      ? "bg-muted text-muted-foreground border-border"
                      : isHighPass
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}
                >
                  {isHighPass ? (
                    <CheckCircle2 className="size-4" />
                  ) : rate !== null ? (
                    <XCircle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                </div>
              </div>
              <div>
                <h3
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    rate === null
                      ? "text-foreground"
                      : isHighPass
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {rate !== null ? `${rate.toFixed(1)}%` : "—"}
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  {total > 0
                    ? `${assessment.passCount || 0} Passed • ${assessment.failCount || 0} Failed`
                    : "No scores recorded"}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 3. Filter Bar & Student Scores Table ── */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
        {/* Table Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 text-xs font-bold bg-muted/40">
                <SelectValue placeholder="Filter Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Students ({enrolledCandidates.length})</SelectItem>
                <SelectItem value="RECORDED">Scored Only</SelectItem>
                <SelectItem value="NOT_RECORDED">Unrecorded Only</SelectItem>
                <SelectItem value="PASSED">Passed (&#8805; {assessment.passingRate}%)</SelectItem>
                <SelectItem value="FAILED">Failed (&lt; {assessment.passingRate}%)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="size-3.5" />
              <span>Roster CSV</span>
            </Button>
          </div>
        </div>

        {/* Table Content */}
        {!hasScores && studentRows.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
            <div className="p-3 bg-muted w-fit mx-auto rounded-full text-muted-foreground mb-3">
              <Upload className="size-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Scores Recorded Yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload scores from a CSV roster or paste directly from Google Sheets / Excel.
            </p>
            <Button
              onClick={() => setIsUploadOpen(true)}
              size="sm"
              className="mt-4 font-bold gap-1.5"
            >
              <Upload className="size-4" />
              <span>Upload Student Scores</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Score (/{assessment.maxScore})</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Percentile</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {studentRows.map((row) => {
                  const isPassed = row.percentage !== null && row.percentage >= (assessment.passingRate || 75);
                  return (
                    <tr
                      key={row.candidateId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-foreground">{row.name}</p>
                        <p className="text-[11px] text-muted-foreground">{row.email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {row.schoolId}
                      </td>
                      <td className="py-3 px-4">
                        {row.score !== null ? (
                          <button
                            type="button"
                            onClick={() => setManualScoreStudent(row)}
                            title="Click to edit score"
                            className="font-black text-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5 group/score cursor-pointer"
                          >
                            <span>{row.score}</span>
                            <PenLine className="size-3 text-muted-foreground opacity-0 group-hover/score:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setManualScoreStudent(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Enter Score</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {row.percentage !== null ? `${row.percentage.toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-purple-600 dark:text-purple-400">
                        {row.percentile !== null ? `${row.percentile.toFixed(1)}th` : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {row.score !== null ? (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-extrabold ${
                              isPassed
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {isPassed ? "PASSED" : "FAILED"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setManualScoreStudent(row)}
                            title={row.score !== null ? "Edit Score" : "Record Score"}
                            className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <PenLine className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={row.score === null}
                            onClick={() => setPdfPreviewData({ assessmentId: assessment.id, candidateId: row.candidateId })}
                            title={row.score !== null ? "View PDF Slip" : "No score recorded"}
                            className="h-7 px-2 text-xs font-bold text-primary disabled:opacity-30 cursor-pointer"
                          >
                            <FileText className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Modals ── */}
      <BulkScoreUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        assessment={assessment}
        onScoresSaved={() => {
          refetchAssessment();
        }}
      />

      {assessment && (
        <ManualScoreModal
          open={Boolean(manualScoreStudent)}
          onOpenChange={(open) => !open && setManualScoreStudent(null)}
          assessment={assessment}
          student={manualScoreStudent}
          onScoreSaved={() => {
            refetchAssessment();
          }}
        />
      )}

      <PdfPreviewModal
        open={Boolean(pdfPreviewData)}
        onOpenChange={(open) => !open && setPdfPreviewData(null)}
        assessmentId={pdfPreviewData?.assessmentId || null}
        candidateId={pdfPreviewData?.candidateId || null}
      />

      <ConfirmDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        title="Email Grade Reports"
        description={`Send official PDF grade slips via email to all enrolled students with recorded scores for "${assessment?.title}"?`}
        confirmLabel="Send Emails"
        icon="email"
        isLoading={emailReportsMutation.isPending}
        onConfirm={() => {
          if (!assessment) return;
          emailReportsMutation.mutate(
            { assessmentId: assessment.id },
            {
              onSuccess: (res) => {
                toast.success(`Dispatched grade reports: ${res?.sentCount || 0} sent.`);
                setIsEmailDialogOpen(false);
                refetchAssessment();
              },
              onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to send emails.");
              },
            }
          );
        }}
      />

      <DeleteAssessmentModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        assessmentTitle={assessment?.title || ""}
        isLoading={deleteAssessmentMutation.isPending}
        onConfirm={() => {
          if (!assessment) return;
          deleteAssessmentMutation.mutate(assessment.id, {
            onSuccess: () => {
              toast.success("Assessment deleted.");
              setIsDeleteDialogOpen(false);
              navigate(`/scores/subject/${subjectDetail?.slug || "clinical-chemistry"}?sy=${activeSchoolYear}`);
            },
            onError: (err: any) => {
              toast.error(err?.response?.data?.message || "Failed to delete assessment.");
            },
          });
        }}
      />
    </div>
  );
}
