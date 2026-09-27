import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  Plus,
  Search,
  Upload,
  Eye,
  Send,
  Trash2,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Users,
  Layers,
  FileSpreadsheet,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Sparkles,
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
import { toast } from "sonner";
import {
  useAssessments,
  useDeleteAssessment,
  useEmailGradeReports,
} from "../api/useAssessments";
import { useSchoolYears, useCandidates } from "@/features/students/api/useCandidates";
import {
  MEDTECH_SUBJECT_DETAILS,
  getSubjectBySlug,
} from "../types";
import type { MedTechSubject, Assessment } from "../types";
import { CreateAssessmentModal } from "../components/CreateAssessmentModal";
import { BulkScoreUploadModal } from "../components/BulkScoreUploadModal";
import { CandidateScoreDrawer } from "../components/CandidateScoreDrawer";
import { PdfPreviewModal } from "../components/PdfPreviewModal";
import { ConfirmDialog } from "@/components/custom/ConfirmDialog";
import { DeleteAssessmentModal } from "../components/DeleteAssessmentModal";
import { Pagination } from "@/components/custom/Pagination";

export function SubjectScoresPage() {
  const { subjectSlug, schoolYear: routeSchoolYear } = useParams<{
    subjectSlug: string;
    schoolYear?: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectDetail = getSubjectBySlug(subjectSlug);
  const currentSubjectName: MedTechSubject = subjectDetail?.name || "Clinical Chemistry";

  const { data: candidatesData } = useCandidates();
  const { data: dbSchoolYears = [] } = useSchoolYears();

  const candidateSchoolYears = candidatesData?.schoolYears || [];

  const allSchoolYears = useMemo(() => {
    return Array.from(
      new Set([
        ...(routeSchoolYear ? [routeSchoolYear] : []),
        ...(searchParams.get("sy") ? [searchParams.get("sy")!] : []),
        ...dbSchoolYears,
        ...candidateSchoolYears,
        "2026-2027",
        "2025-2026",
        "2024-2025",
      ])
    ).sort((a, b) => b.localeCompare(a));
  }, [routeSchoolYear, searchParams, dbSchoolYears, candidateSchoolYears]);

  const selectedSchoolYear = searchParams.get("sy") || routeSchoolYear || allSchoolYears[0] || "2026-2027";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleSchoolYearChange = (sy: string) => {
    setSearchParams({ sy });
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadAssessment, setUploadAssessment] = useState<Assessment | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    assessmentId: string;
    candidateId?: string;
  } | null>(null);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ id: string; title: string } | null>(null);
  const [emailConfirmData, setEmailConfirmData] = useState<{ id: string; title: string } | null>(null);

  // Queries
  const { data: assessmentsData, isLoading: isAssessmentsLoading, refetch: refetchAssessments } = useAssessments({
    schoolYear: selectedSchoolYear,
    subject: currentSubjectName,
    search: searchTerm || undefined,
  });

  const deleteAssessmentMutation = useDeleteAssessment();
  const emailReportsMutation = useEmailGradeReports();

  const assessments = assessmentsData?.assessments || [];

  const totalAssessments = assessments.length;
  const totalPages = Math.max(1, Math.ceil(totalAssessments / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  // Clamp page if total pages shrink (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Paginated assessments for the current page
  const paginatedAssessments = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return assessments.slice(start, start + pageSize);
  }, [assessments, validCurrentPage, pageSize]);

  // Aggregated Statistical Metrics for this specific subject
  const aggregateStats = useMemo(() => {
    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        avgMean: null,
        avgMedian: null,
        totalPassed: 0,
        totalFailed: 0,
        passRate: null,
      };
    }

    let totalMeanSum = 0;
    let meanCount = 0;
    let totalMedianSum = 0;
    let medianCount = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const a of assessments) {
      if (a.meanScore !== null && a.meanScore !== undefined) {
        totalMeanSum += a.meanScore;
        meanCount++;
      }
      if (a.medianScore !== null && a.medianScore !== undefined) {
        totalMedianSum += a.medianScore;
        medianCount++;
      }
      totalPassed += a.passCount || 0;
      totalFailed += a.failCount || 0;
    }

    const totalStudentsScored = totalPassed + totalFailed;
    const passRate =
      totalStudentsScored > 0
        ? Number(((totalPassed / totalStudentsScored) * 100).toFixed(1))
        : null;

    return {
      totalAssessments: assessments.length,
      avgMean: meanCount > 0 ? (totalMeanSum / meanCount).toFixed(1) : null,
      avgMedian: medianCount > 0 ? (totalMedianSum / medianCount).toFixed(1) : null,
      totalPassed,
      totalFailed,
      passRate,
    };
  }, [assessments]);

  const handleDeleteAssessment = (id: string, title: string) => {
    setDeleteConfirmData({ id, title });
  };

  const handleEmailCohortReports = (assessmentId: string, title: string) => {
    setEmailConfirmData({ id: assessmentId, title });
  };

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans pb-12 animate-in fade-in duration-200">
      {/* ── 1. Page Header & Top Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Left: Subject Info */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/scores?sy=${selectedSchoolYear}`)}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer mr-0.5"
              title="Back to All 6 Subjects"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <BookOpen className="size-5" />
            </div>

            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {currentSubjectName}
            </h1>

            <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
              {subjectDetail?.weightPercent}% PRC Board Weight
            </Badge>

            <Badge variant="secondary" className="font-mono text-xs uppercase">
              {subjectDetail?.code}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            {subjectDetail?.description}
          </p>
        </div>

        {/* Right: Stacked Top Actions */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-56 font-bold gap-1.5 shadow-sm text-xs h-9 px-4 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create Assessment</span>
          </Button>

          {/* Fast Subject Switcher */}
          <Select
            value={subjectDetail?.slug || "clinical-chemistry"}
            onValueChange={(slug) => navigate(`/scores/subject/${slug}?sy=${selectedSchoolYear}`)}
          >
            <SelectTrigger className="w-full sm:w-56 h-8 text-xs font-semibold bg-card border-border shadow-xs">
              <SelectValue placeholder="Switch Subject" />
            </SelectTrigger>
            <SelectContent>
              {MEDTECH_SUBJECT_DETAILS.map((s) => (
                <SelectItem key={s.slug} value={s.slug} className="text-xs font-medium">
                  {s.name} ({s.weightPercent}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 2. Cohort Statistical Summary Banner for this Subject ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Assessments */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Assessments
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {aggregateStats.totalAssessments}
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Recorded test modules
            </p>
          </div>
        </div>

        {/* Card 2: Subject Mean */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Subject Mean (Avg)
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {aggregateStats.avgMean !== null ? aggregateStats.avgMean : "—"}
              </h3>
              {aggregateStats.avgMean !== null && (
                <span className="text-xs font-bold text-muted-foreground">pts</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Average across all tests
            </p>
          </div>
        </div>

        {/* Card 3: Subject Median */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Subject Median
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {aggregateStats.avgMedian !== null ? aggregateStats.avgMedian : "—"}
              </h3>
              {aggregateStats.avgMedian !== null && (
                <span className="text-xs font-bold text-muted-foreground">pts</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Midpoint score benchmark
            </p>
          </div>
        </div>

        {/* Card 4: Passing Rate */}
        {(() => {
          const isHighPass = aggregateStats.passRate !== null && aggregateStats.passRate >= 75;
          const totalPassed = aggregateStats.totalPassed || 0;
          const totalFailed = aggregateStats.totalFailed || 0;
          const totalScored = totalPassed + totalFailed;

          return (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Passing Rate (&ge; 75%)
                </span>
                <div
                  className={`p-2 rounded-xl border ${
                    aggregateStats.passRate === null
                      ? "bg-muted text-muted-foreground border-border"
                      : isHighPass
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}
                >
                  {isHighPass ? (
                    <CheckCircle2 className="size-4" />
                  ) : aggregateStats.passRate !== null ? (
                    <XCircle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                </div>
              </div>
              <div>
                <h3
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    aggregateStats.passRate === null
                      ? "text-foreground"
                      : isHighPass
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {aggregateStats.passRate !== null ? `${aggregateStats.passRate}%` : "—"}
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-1">
                  {totalScored > 0
                    ? `${totalPassed} Passed • ${totalFailed} Failed`
                    : "No test records"}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── 3. Filters Bar ── */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
        {/* Search (Left) */}
        <div className="space-y-1 w-full sm:max-w-md">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Search Assessments
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search title, label (e.g. Mock Board, Quiz 1)..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* School Year (Right) */}
        <div className="space-y-1 w-full sm:w-52 shrink-0">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            School Year
          </label>
          <Select value={selectedSchoolYear} onValueChange={handleSchoolYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="School Year" />
            </SelectTrigger>
            <SelectContent>
              {allSchoolYears.map((sy) => (
                <SelectItem key={sy} value={sy}>
                  {sy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 4. Main View Content: Assessments List ── */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span>Recorded Assessments ({assessments.length})</span>
            </h2>
          </div>

          {assessments.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
              <div className="p-3 bg-muted w-fit mx-auto rounded-full text-muted-foreground mb-3">
                <BookOpen className="size-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No assessments recorded in {currentSubjectName}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Get started by creating a new quiz, prelim, or mock board exam for this subject.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                size="sm"
                className="mt-4 font-bold gap-1.5"
              >
                <Plus className="size-4" />
                <span>Create First Assessment</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAssessments.map((a) => {
                  return (
                    <Card
                      key={a.id}
                      onClick={() =>
                        navigate(
                          `/scores/subject/${subjectDetail?.slug || "clinical-chemistry"}/assessment/${a.id}?sy=${selectedSchoolYear}`
                        )
                      }
                      className="group bg-card border-border hover:border-primary hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <CardHeader className="p-4 pb-2 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className="font-bold text-[10px] bg-primary/10 text-primary border-primary/20"
                          >
                            {a.subject}
                          </Badge>
                          {a.customLabel && (
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              {a.customLabel}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <CardTitle className="text-base font-extrabold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {a.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Max: <strong>{a.maxScore} pts</strong> • Passing: <strong>{a.passingScore} pts ({a.passingRate}%)</strong>
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 space-y-3">
                        {/* Cohort Stats Mini Box */}
                        <div className="bg-muted/40 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Mean
                            </span>
                            <p className="font-extrabold text-foreground">
                              {a.meanScore !== null && a.meanScore !== undefined ? a.meanScore.toFixed(1) : "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Median
                            </span>
                            <p className="font-extrabold text-foreground">
                              {a.medianScore !== null && a.medianScore !== undefined ? a.medianScore.toFixed(1) : "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Pass / Fail
                            </span>
                            <p className="font-extrabold text-foreground">
                              <span className="text-green-600">{a.passCount}</span> /{" "}
                              <span className="text-red-500">{a.failCount}</span>
                            </p>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        {(() => {
                          const hasScores = (a._count?.scores ?? 0) > 0 || ((a.passCount || 0) + (a.failCount || 0) > 0);
                          return (
                            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border">
                              <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                                <span>View &amp; Upload Scores</span>
                                <ArrowRight className="size-3.5" />
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!hasScores}
                                  onClick={() => setPdfPreviewData({ assessmentId: a.id })}
                                  title={hasScores ? "Preview Official Student PDF Grade Slip" : "Upload scores first to preview PDF grade slip"}
                                  className="h-7 px-2 text-xs font-bold text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Eye className="size-3.5" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!hasScores || emailReportsMutation.isPending}
                                  onClick={() => handleEmailCohortReports(a.id, a.title)}
                                  title={hasScores ? "Email Grade Reports to Students" : "Upload scores first to email reports"}
                                  className="h-7 px-2 text-xs font-bold text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Send className="size-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAssessment(a.id, a.title)}
                                  className="h-7 px-2 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* ── Pagination Footer ── */}
              <Pagination
                currentPage={validCurrentPage}
                totalPages={totalPages}
                totalItems={totalAssessments}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 9, 12, 24]}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={handlePageSizeChange}
                itemName="assessments"
              />
            </>
          )}
        </div>

      {/* ── 5. Modals & Drawers ── */}
      <CreateAssessmentModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultSchoolYear={selectedSchoolYear}
        defaultSubject={currentSubjectName}
        availableSchoolYears={allSchoolYears}
        onCreated={() => {
          refetchAssessments();
        }}
      />

      <BulkScoreUploadModal
        open={Boolean(uploadAssessment)}
        onOpenChange={(open) => !open && setUploadAssessment(null)}
        assessment={uploadAssessment}
        onScoresSaved={() => {
          refetchAssessments();
        }}
      />

      <CandidateScoreDrawer
        open={Boolean(selectedCandidateId)}
        onOpenChange={(open) => !open && setSelectedCandidateId(null)}
        candidateId={selectedCandidateId}
        onPreviewPdf={(assessmentId, candidateId) => {
          setPdfPreviewData({ assessmentId, candidateId });
        }}
      />

      <PdfPreviewModal
        open={Boolean(pdfPreviewData)}
        onOpenChange={(open) => !open && setPdfPreviewData(null)}
        assessmentId={pdfPreviewData?.assessmentId || null}
        candidateId={pdfPreviewData?.candidateId || null}
      />

      <ConfirmDialog
        open={Boolean(emailConfirmData)}
        onOpenChange={(open) => !open && setEmailConfirmData(null)}
        title="Email Grade Reports"
        description={`Send official PDF grade slips via email to all enrolled students with recorded scores for "${emailConfirmData?.title}"?`}
        confirmLabel="Send Emails"
        icon="email"
        isLoading={emailReportsMutation.isPending}
        onConfirm={() => {
          if (!emailConfirmData) return;
          emailReportsMutation.mutate(
            { assessmentId: emailConfirmData.id },
            {
              onSuccess: (res) => {
                toast.success(`Dispatched grade reports: ${res?.sentCount || 0} sent.`);
                setEmailConfirmData(null);
                refetchAssessments();
              },
              onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to send emails.");
              },
            }
          );
        }}
      />

      <DeleteAssessmentModal
        open={Boolean(deleteConfirmData)}
        onOpenChange={(open) => !open && setDeleteConfirmData(null)}
        assessmentTitle={deleteConfirmData?.title || ""}
        isLoading={deleteAssessmentMutation.isPending}
        onConfirm={() => {
          if (!deleteConfirmData) return;
          deleteAssessmentMutation.mutate(deleteConfirmData.id, {
            onSuccess: () => {
              toast.success("Assessment deleted.");
              setDeleteConfirmData(null);
              refetchAssessments();
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
