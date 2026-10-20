import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  SlidersHorizontal,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import type { ReviewCenterCandidateItem } from "../api/useReviewCenter";
import type { ReviewCenterRepresentative } from "../types/types";
import {
  fetchReviewCenterCandidates,
  generateReviewCenterPdfHtml,
  printReviewCenterPdf,
} from "../services/reviewCenterPdfExportService";
import { exportReviewCenterCandidatesToExcel } from "../services/reviewCenterExcelExportService";
import { showFeedback } from "@/components/modal";

export default function ExportReviewCenterPdfPage() {
  const navigate = useNavigate();
  const { reviewCenterId } = useParams<{ reviewCenterId: string }>();
  const [searchParams] = useSearchParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUserName = (auth as any)?.data?.user?.name || "Review Center Coordinator";

  // URL parameters if opened with preset filters
  const initialSyParam = searchParams.get("sy") || "ALL";
  const initialGameStatusParam = searchParams.get("gameStatus") || "ALL";

  // Document format options state
  const [mode, setMode] = useState<"comprehensive" | "attendance_roster" | "game_status">(
    "comprehensive"
  );
  const [includeGameStats, setIncludeGameStats] = useState(true);
  const [includeSchoolYear, setIncludeSchoolYear] = useState(true);

  // Dropdown Filter states
  const [filterSchoolYear, setFilterSchoolYear] = useState<string>(initialSyParam);
  const [filterGameStatus, setFilterGameStatus] = useState<string>(initialGameStatusParam);
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState<string>("ALL");

  // Data state
  const [reviewCenter, setReviewCenter] = useState<ReviewCenterRepresentative | null>(null);
  const [allCandidates, setAllCandidates] = useState<ReviewCenterCandidateItem[] | null>(null);
  const [availableSchoolYears, setAvailableSchoolYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Load review center details and candidate records
  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      if (!reviewCenterId) {
        showFeedback.error("No Review Center ID provided.");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Review Center metadata & candidates in parallel
        const [centerRes, candidatesRes] = await Promise.all([
          axiosPrivate.get(`/review-center/${reviewCenterId}`).catch(() => null),
          fetchReviewCenterCandidates(axiosPrivate, reviewCenterId),
        ]);

        if (!isSubscribed) return;

        if (centerRes?.data?.data?.reviewCenter) {
          setReviewCenter(centerRes.data.data.reviewCenter);
        } else if (centerRes?.data?.reviewCenter) {
          setReviewCenter(centerRes.data.reviewCenter);
        }

        setAllCandidates(candidatesRes.candidates);
        setAvailableSchoolYears(candidatesRes.schoolYears);
      } catch (err: any) {
        if (!isSubscribed) return;
        showFeedback.error(err?.message || "Failed to load review center candidates for PDF.");
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [axiosPrivate, reviewCenterId]);

  const rawCandidates = allCandidates || [];

  // Active candidates filtered in real-time
  const activeCandidates = useMemo(() => {
    return rawCandidates.filter((c) => {
      // 1. School Year filter
      if (filterSchoolYear !== "ALL") {
        const sy = (c.schoolYear || "").trim();
        if (sy !== filterSchoolYear) return false;
      }

      // 2. Game Status filter
      if (filterGameStatus !== "ALL") {
        const isPlaying = Boolean(c.studentId || c.studentDetails);
        if (filterGameStatus === "REGISTERED" && !isPlaying) return false;
        if (filterGameStatus === "UNREGISTERED" && isPlaying) return false;
      }

      // 3. Enrollment Status filter
      if (filterEnrollmentStatus !== "ALL") {
        const st = (c.status || "ENROLLED").toUpperCase();
        if (st !== filterEnrollmentStatus) return false;
      }

      return true;
    });
  }, [rawCandidates, filterSchoolYear, filterGameStatus, filterEnrollmentStatus]);

  const activeCount = activeCandidates.length;

  const hasActiveFilters =
    filterSchoolYear !== "ALL" ||
    filterGameStatus !== "ALL" ||
    filterEnrollmentStatus !== "ALL";

  const handleResetFilters = () => {
    setFilterSchoolYear("ALL");
    setFilterGameStatus("ALL");
    setFilterEnrollmentStatus("ALL");
  };

  // Generated HTML for live preview and export
  const previewHtml = useMemo(() => {
    if (activeCandidates.length === 0) return "";

    const filterLabels: string[] = [];
    if (filterSchoolYear !== "ALL") {
      filterLabels.push(`S.Y. ${filterSchoolYear}`);
    }
    if (filterGameStatus !== "ALL") {
      filterLabels.push(filterGameStatus === "REGISTERED" ? "In-Game Players" : "Unregistered");
    }
    if (filterEnrollmentStatus !== "ALL") {
      filterLabels.push(`Status: ${filterEnrollmentStatus}`);
    }

    return generateReviewCenterPdfHtml({
      title: `${reviewCenter?.companyName || "Review Center"} - Candidate Roster`,
      subtitle: `Official compilation of ${activeCount} candidate records`,
      reviewCenter,
      candidates: activeCandidates,
      mode,
      includeGameStats,
      includeSchoolYear,
      generatedBy: currentUserName,
      filterLabels,
    });
  }, [
    activeCandidates,
    activeCount,
    mode,
    includeGameStats,
    includeSchoolYear,
    reviewCenter,
    currentUserName,
    filterSchoolYear,
    filterGameStatus,
    filterEnrollmentStatus,
  ]);

  const handlePrintOrSavePdf = async () => {
    if (!previewHtml || activeCandidates.length === 0) {
      showFeedback.warning("No candidate records available to export.");
      return;
    }

    setIsPrinting(true);
    try {
      await printReviewCenterPdf(previewHtml);
      showFeedback.success(
        `Export ready! Prepared ${activeCandidates.length} candidate records for PDF save.`,
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

  const handleExportToExcel = () => {
    if (activeCount === 0 || activeCandidates.length === 0) {
      showFeedback.warning("No candidate records available to export.");
      return;
    }

    setIsExportingExcel(true);
    try {
      exportReviewCenterCandidatesToExcel(activeCandidates, {
        reviewCenter,
        includeGameStats,
        includeSchoolYear,
      });
      showFeedback.success(
        `Exported ${activeCandidates.length} candidate records to Excel (.xlsx)`,
        {
          description: "Spreadsheet file downloaded to your system.",
        }
      );
    } catch (err: any) {
      showFeedback.error(err?.message || "Failed to generate Excel spreadsheet.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const backUrl = reviewCenterId
    ? `/review-center/${reviewCenterId}`
    : "/review-center";

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col font-sans bg-background text-foreground overflow-hidden">
      {/* Top Page Header Bar */}
      <header className="px-5 sm:px-7 py-3 border-b border-border bg-card/95 backdrop-blur-sm flex flex-col gap-2.5 shrink-0 shadow-2xs">
        {/* Back Link Row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to {reviewCenter?.companyName || "Review Center"}
          </button>
        </div>

        {/* Title, Badge & Main Action CTA Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 shadow-2xs">
              <Building2 size={22} className="stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  {reviewCenter?.companyName
                    ? `${reviewCenter.companyName} - Candidate Roster`
                    : "Export Review Center Candidates"}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0 rounded-full shrink-0"
                >
                  <CheckCircle2 size={11} className="mr-1 inline" />
                  {isLoading ? "Loading..." : `${activeCount} Candidates`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">
                Configure layouts, filter enrolled candidate cohorts on the left sidebar, and export to PDF or Excel (.xlsx) spreadsheet.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              disabled={isLoading || isPrinting || isExportingExcel || activeCount === 0}
              className="h-8.5 px-3 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs rounded-xl gap-1.5 shadow-2xs cursor-pointer"
            >
              {isExportingExcel ? (
                <Loader2 size={13} className="animate-spin text-emerald-600" />
              ) : (
                <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Export to Excel</span>
            </Button>
            <Button
              size="sm"
              onClick={handlePrintOrSavePdf}
              disabled={isLoading || isPrinting || activeCount === 0}
              className="h-8.5 px-3 bg-[#A70202] hover:bg-[#A70202]/90 text-white font-semibold text-xs rounded-xl gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </Button>
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
                  onValueChange={(val: "comprehensive" | "attendance_roster" | "game_status") =>
                    setMode(val)
                  }
                >
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="comprehensive">
                      Comprehensive Candidate Report
                    </SelectItem>
                    <SelectItem value="attendance_roster">
                      Official Exam & Attendance Roster
                    </SelectItem>
                    <SelectItem value="game_status">
                      Game Registration & Verification
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Switches */}
              <div className="space-y-2 pt-1 bg-muted/30 p-2.5 rounded-xl border border-border/60">
                <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Include Game Progress & XP
                  </span>
                  <Switch
                    checked={includeGameStats}
                    onCheckedChange={setIncludeGameStats}
                    className="scale-85"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Include School Year Info
                  </span>
                  <Switch
                    checked={includeSchoolYear}
                    onCheckedChange={setIncludeSchoolYear}
                    className="scale-85"
                  />
                </label>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* ── Candidate Filters Section ── */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Filter Candidates
                </span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-bold text-[#A70202] bg-[#A70202]/10">
                    Active
                  </Badge>
                )}
              </div>

              {/* Filter 1: School Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>School Year</span>
                  {filterSchoolYear !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterSchoolYear} onValueChange={setFilterSchoolYear}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue placeholder="All School Years" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All School Years</SelectItem>
                    {availableSchoolYears.map((sy) => (
                      <SelectItem key={sy} value={sy}>
                        S.Y. {sy}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 2: BoardQuest Game Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>BoardQuest Status</span>
                  {filterGameStatus !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterGameStatus} onValueChange={setFilterGameStatus}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Game Status</SelectItem>
                    <SelectItem value="REGISTERED">Playing Game (Active)</SelectItem>
                    <SelectItem value="UNREGISTERED">Not in Game Yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 3: Enrollment Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Enrollment Status</span>
                  {filterEnrollmentStatus !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterEnrollmentStatus} onValueChange={setFilterEnrollmentStatus}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ENROLLED">Enrolled</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Candidates Summary Stat Box in Sidebar */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Matching Candidates</span>
                <span className="text-xs font-bold text-foreground">
                  {activeCount} of {rawCandidates.length}
                </span>
              </div>
              <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#A70202] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${rawCandidates.length > 0 ? (activeCount / rawCandidates.length) * 100 : 0}%`,
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              disabled={isLoading || isPrinting || isExportingExcel || activeCount === 0}
              className="w-full h-8.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              {isExportingExcel ? (
                <Loader2 size={13} className="animate-spin text-emerald-600" />
              ) : (
                <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Export to Excel ({activeCount})</span>
            </Button>
          </div>
        </aside>

        {/* Right Vector Preview Canvas - Full Width and Height */}
        <main className="flex-1 min-w-0 h-full bg-white overflow-hidden relative flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Loader2 className="size-9 animate-spin text-[#A70202]" />
              <p className="text-sm font-semibold text-foreground">
                Retrieving candidate registry...
              </p>
              <p className="text-xs text-muted-foreground">
                Compiling candidate roster, school year allocations, and BoardQuest status for vector print preview.
              </p>
            </div>
          ) : activeCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
              <div className="flex flex-col items-center justify-center gap-3 text-center max-w-md p-8 bg-card border border-border rounded-2xl shadow-xs">
                <HelpCircle className="size-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground text-base">
                  No matching candidates found
                </p>
                <p className="text-xs text-muted-foreground">
                  There are no candidate records matching the selected filter combination on the sidebar. Try resetting filters or choosing broader options.
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
              id="boardquest-reviewcenter-fullpage-preview"
              srcDoc={previewHtml}
              title="Review Center Candidate Roster PDF Preview"
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
            Active Filter: <strong className="text-foreground">{activeCount}</strong> of {rawCandidates.length} enrolled candidates
          </span>
        </div>
      </footer>
    </div>
  );
}
