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
  RotateCcw,
  ArrowLeft,
  SlidersHorizontal,
  GraduationCap,
  FileSpreadsheet,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import type { Student } from "../types/types";
import {
  fetchAllStudents,
  generateStudentsPdfHtml,
  printStudentsPdf,
} from "../services/studentPdfExportService";
import { exportStudentsToExcel } from "../services/studentExcelExportService";
import { toast } from "sonner";

export default function ExportStudentsPdfPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUserName = (auth as any)?.data?.user?.name || "Academic Administrator";

  // URL parameters if opened with preset filters
  const initialStandingParam = searchParams.get("standing") || "ALL";
  const initialPaceParam = searchParams.get("pace") || "ALL";
  const initialEngagementParam = searchParams.get("engagement") || "ALL";

  // Document format options state
  const [mode, setMode] = useState<"comprehensive" | "roster_only" | "at_risk">(
    initialStandingParam === "FAILING" ? "at_risk" : "comprehensive"
  );
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeContactInfo, setIncludeContactInfo] = useState(true);

  // 5 Dropdown Filter states
  const [filterStanding, setFilterStanding] = useState<string>(initialStandingParam);
  const [filterPace, setFilterPace] = useState<string>(initialPaceParam);
  const [filterEngagement, setFilterEngagement] = useState<string>(initialEngagementParam);
  const [filterGuidance, setFilterGuidance] = useState<string>("ALL");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");

  // Data state
  const [allStudents, setAllStudents] = useState<Student[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Load all students on mount
  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchAllStudents(axiosPrivate);
        if (!isSubscribed) return;
        setAllStudents(data);
      } catch (err: any) {
        if (!isSubscribed) return;
        toast.error(err?.message || "Failed to load students roster for PDF.");
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [axiosPrivate]);

  const rawStudents = allStudents || [];

  // Standing counts
  const standingCounts = useMemo(() => {
    let passing = 0;
    let failing = 0;
    let untested = 0;
    for (const s of rawStudents) {
      const st = (s.academicStanding || "UNTESTED").toUpperCase();
      if (st === "PASSING") passing++;
      else if (st === "FAILING") failing++;
      else untested++;
    }
    return { passing, failing, untested, total: rawStudents.length };
  }, [rawStudents]);

  // Pace counts
  const paceCounts = useMemo(() => {
    let onTrack = 0;
    let behind = 0;
    let critical = 0;
    let notScheduled = 0;
    for (const s of rawStudents) {
      const p = (s.calendarPace?.status || "NOT_SCHEDULED").toUpperCase();
      if (p === "ON_TRACK") onTrack++;
      else if (p === "BEHIND") behind++;
      else if (p === "CRITICAL") critical++;
      else notScheduled++;
    }
    return { onTrack, behind, critical, notScheduled };
  }, [rawStudents]);

  // Engagement counts
  const engagementCounts = useMemo(() => {
    let active = 0;
    let lowCadence = 0;
    let dormant = 0;
    for (const s of rawStudents) {
      const eng = (s.engagement?.status || "ACTIVE").toUpperCase();
      if (eng === "ACTIVE") active++;
      else if (eng === "LOW_CADENCE") lowCadence++;
      else if (eng === "DORMANT") dormant++;
    }
    return { active, lowCadence, dormant };
  }, [rawStudents]);

  // Distinct locations / campuses available in rawStudents
  const availableLocations = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of rawStudents) {
      const loc = (s.location || s.userSettings?.school || "Main Campus").trim();
      map.set(loc, (map.get(loc) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rawStudents]);

  // Active students filtered in real-time
  const activeStudents = useMemo(() => {
    return rawStudents.filter((s) => {
      // 1. Academic Standing filter
      if (filterStanding !== "ALL") {
        const st = (s.academicStanding || "UNTESTED").toUpperCase();
        if (st !== filterStanding) return false;
      }

      // 2. Calendar Pace filter
      if (filterPace !== "ALL") {
        const p = (s.calendarPace?.status || "NOT_SCHEDULED").toUpperCase();
        if (p !== filterPace) return false;
      }

      // 3. Engagement filter
      if (filterEngagement !== "ALL") {
        const eng = (s.engagement?.status || "ACTIVE").toUpperCase();
        if (eng !== filterEngagement) return false;
      }

      // 4. Guidance Advising filter
      if (filterGuidance !== "ALL") {
        const hasGuidance = Boolean(
          s.activeGuidance ||
            (s.guidanceAssignments || []).find(
              (g: any) =>
                String(g.status).toUpperCase() === "PENDING" ||
                String(g.status).toUpperCase() === "IN_PROGRESS"
            )
        );
        if (filterGuidance === "ASSIGNED" && !hasGuidance) return false;
        if (filterGuidance === "UNASSIGNED" && hasGuidance) return false;
      }

      // 5. Location filter
      if (filterLocation !== "ALL") {
        const loc = (s.location || s.userSettings?.school || "Main Campus").trim();
        if (loc !== filterLocation) return false;
      }

      return true;
    });
  }, [
    rawStudents,
    filterStanding,
    filterPace,
    filterEngagement,
    filterGuidance,
    filterLocation,
  ]);

  const activeCount = activeStudents.length;

  const hasActiveFilters =
    filterStanding !== "ALL" ||
    filterPace !== "ALL" ||
    filterEngagement !== "ALL" ||
    filterGuidance !== "ALL" ||
    filterLocation !== "ALL";

  const handleResetFilters = () => {
    setFilterStanding("ALL");
    setFilterPace("ALL");
    setFilterEngagement("ALL");
    setFilterGuidance("ALL");
    setFilterLocation("ALL");
  };

  // Generated HTML for live preview and export
  const previewHtml = useMemo(() => {
    if (activeStudents.length === 0) return "";

    const filterLabels: string[] = [];
    if (filterStanding !== "ALL") {
      filterLabels.push(`Standing: ${filterStanding}`);
    }
    if (filterPace !== "ALL") {
      filterLabels.push(`Pace: ${filterPace.replace("_", " ")}`);
    }
    if (filterEngagement !== "ALL") {
      filterLabels.push(`Activity: ${filterEngagement.replace("_", " ")}`);
    }
    if (filterGuidance !== "ALL") {
      filterLabels.push(filterGuidance === "ASSIGNED" ? "Has Guidance" : "Unassigned");
    }
    if (filterLocation !== "ALL") {
      filterLabels.push(`Campus: ${filterLocation}`);
    }

    return generateStudentsPdfHtml({
      title:
        mode === "at_risk"
          ? "BoardQuest Student Directory - At-Risk & Intervention Roster"
          : mode === "roster_only"
          ? "BoardQuest Student Directory - Official Enrollment & Attendance Roster"
          : "BoardQuest Student Directory & Advising Roster",
      subtitle: `Official compilation of ${activeCount} student records`,
      students: activeStudents,
      mode,
      includeMetrics,
      includeContactInfo,
      generatedBy: currentUserName,
      filterLabels,
    });
  }, [
    activeStudents,
    activeCount,
    mode,
    includeMetrics,
    includeContactInfo,
    currentUserName,
    filterStanding,
    filterPace,
    filterEngagement,
    filterGuidance,
    filterLocation,
  ]);

  const handlePrintOrSavePdf = async () => {
    if (!previewHtml || activeStudents.length === 0) {
      toast.warning("No student records available to export.");
      return;
    }

    setIsPrinting(true);
    try {
      await printStudentsPdf(previewHtml);
      toast.success(
        `Export ready! Prepared ${activeStudents.length} student records for PDF save.`,
        {
          description: "Choose 'Save as PDF' in the destination dropdown to download.",
        }
      );
    } catch (err: any) {
      toast.error("Failed to trigger print dialog.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportToExcel = () => {
    if (activeCount === 0 || activeStudents.length === 0) {
      toast.warning("No student records available to export.");
      return;
    }

    setIsExportingExcel(true);
    try {
      exportStudentsToExcel(activeStudents, {
        mode,
        includeContactInfo,
        includeMetrics,
        institutionName: "PHINMA Education",
      });
      toast.success(
        `Exported ${activeStudents.length} student records to Excel (.xlsx)`,
        {
          description: "Spreadsheet file downloaded to your system.",
        }
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate Excel spreadsheet.");
    } finally {
      setIsExportingExcel(false);
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
            onClick={() => navigate("/student-management")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft
              size={13}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Student Directory
          </button>
        </div>

        {/* Title, Badge & Main Action CTA Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0 shadow-2xs">
              <GraduationCap size={22} className="stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground tracking-tight truncate">
                  Export Student Directory
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold px-2 py-0 rounded-full shrink-0"
                >
                  <CheckCircle2 size={11} className="mr-1 inline" />
                  {isLoading ? "Loading..." : `${activeCount} Students`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">
                Configure layouts, filter cohort records on the left sidebar, and export to PDF or Excel (.xlsx) spreadsheet.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          {/* <div className="flex items-center gap-2 shrink-0">
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
          </div> */}
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
                Roster Filters
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
                  onValueChange={(val: "comprehensive" | "roster_only" | "at_risk") =>
                    setMode(val)
                  }
                >
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="comprehensive">
                      Full Academic & Advising Report
                    </SelectItem>
                    <SelectItem value="roster_only">
                      Official Enrollment & Attendance Roster
                    </SelectItem>
                    <SelectItem value="at_risk">
                      At-Risk & Intervention Roster
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Switches */}
              <div className="space-y-2 pt-1 bg-muted/30 p-2.5 rounded-xl border border-border/60">
                <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Include Metrics & Cohort Stats
                  </span>
                  <Switch
                    checked={includeMetrics}
                    onCheckedChange={setIncludeMetrics}
                    className="scale-85"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none py-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Include Location / Campus
                  </span>
                  <Switch
                    checked={includeContactInfo}
                    onCheckedChange={setIncludeContactInfo}
                    className="scale-85"
                  />
                </label>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* ── Student Filters Section ── */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Filter Students
                </span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-bold text-[#A70202] bg-[#A70202]/10">
                    Active
                  </Badge>
                )}
              </div>

              {/* Filter 1: Academic Standing */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Academic Standing</span>
                  {filterStanding !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterStanding} onValueChange={setFilterStanding}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue placeholder="All Standings" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Standings ({standingCounts.total})</SelectItem>
                    <SelectItem value="PASSING">Passing ≥75% ({standingCounts.passing})</SelectItem>
                    <SelectItem value="FAILING">At-Risk / Failing &lt;75% ({standingCounts.failing})</SelectItem>
                    <SelectItem value="UNTESTED">Untested ({standingCounts.untested})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 2: Calendar Pace */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Calendar Pace</span>
                  {filterPace !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterPace} onValueChange={setFilterPace}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Paces" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Paces</SelectItem>
                    <SelectItem value="ON_TRACK">On Track ({paceCounts.onTrack})</SelectItem>
                    <SelectItem value="BEHIND">Behind Schedule ({paceCounts.behind})</SelectItem>
                    <SelectItem value="CRITICAL">Critical Lag ({paceCounts.critical})</SelectItem>
                    <SelectItem value="NOT_SCHEDULED">Unscheduled ({paceCounts.notScheduled})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 3: Engagement Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Activity & Engagement</span>
                  {filterEngagement !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterEngagement} onValueChange={setFilterEngagement}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Activity" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Activity</SelectItem>
                    <SelectItem value="ACTIVE">Active Recently ({engagementCounts.active})</SelectItem>
                    <SelectItem value="LOW_CADENCE">Low Cadence ({engagementCounts.lowCadence})</SelectItem>
                    <SelectItem value="DORMANT">Dormant 7d+ ({engagementCounts.dormant})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 4: Guidance Advising */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Guidance Advising</span>
                  {filterGuidance !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterGuidance} onValueChange={setFilterGuidance}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium">
                    <SelectValue placeholder="All Guidance Statuses" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="ALL">All Guidance Statuses</SelectItem>
                    <SelectItem value="ASSIGNED">Under Active Guidance</SelectItem>
                    <SelectItem value="UNASSIGNED">Unassigned / No Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 5: Campus / Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Campus / Location</span>
                  {filterLocation !== "ALL" && (
                    <span className="text-[10px] text-[#A70202] font-semibold">Filtered</span>
                  )}
                </label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger className="w-full h-8.5 bg-background border-border rounded-lg text-xs font-medium truncate">
                    <SelectValue placeholder="All Campuses" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-64">
                    <SelectItem value="ALL">All Campuses ({availableLocations.length})</SelectItem>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>
                        {loc.name} ({loc.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Students Summary Stat Box in Sidebar */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">Matching Students</span>
                <span className="text-xs font-bold text-foreground">
                  {activeCount} of {rawStudents.length}
                </span>
              </div>
              <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#A70202] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${rawStudents.length > 0 ? (activeCount / rawStudents.length) * 100 : 0}%`,
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
                Retrieving student directory records...
              </p>
              <p className="text-xs text-muted-foreground">
                Compiling academic standing, progress metrics, and cohort status for vector print preview.
              </p>
            </div>
          ) : activeCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
              <div className="flex flex-col items-center justify-center gap-3 text-center max-w-md p-8 bg-card border border-border rounded-2xl shadow-xs">
                <HelpCircle className="size-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground text-base">
                  No matching students found
                </p>
                <p className="text-xs text-muted-foreground">
                  There are no student records matching the selected filter combination on the sidebar. Try resetting filters or choosing broader options.
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
              id="boardquest-students-fullpage-preview"
              srcDoc={previewHtml}
              title="Student Directory PDF Preview"
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
            Active Filter: <strong className="text-foreground">{activeCount}</strong> of {rawStudents.length} enrolled students
          </span>
        </div>
      </footer>
    </div>
  );
}
