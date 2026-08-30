import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Calendar,
  Layers,
  GraduationCap,
  ChevronRight,
  FolderOpen,
  CalendarPlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useCandidates,
  useSchoolYears,
  useCreateSchoolYear,
} from "../api/useCandidates";

export function SchoolYearsPage() {
  const navigate = useNavigate();
  const [isNewYearModalOpen, setIsNewYearModalOpen] = useState(false);
  const [newSchoolYearInput, setNewSchoolYearInput] = useState("");

  const { data: candidatesData, isLoading: isCandidatesLoading } = useCandidates();
  const { data: dbSchoolYears = [], isLoading: isSchoolYearsLoading } = useSchoolYears();
  const createSchoolYearMutation = useCreateSchoolYear();

  const allCandidatesList = candidatesData?.candidates || [];
  const batches = candidatesData?.batches || [];

  // Strictly use actual school years from the database (No demo data)
  const allSchoolYearsList = useMemo(() => {
    const candidateYears = candidatesData?.schoolYears || [];
    return Array.from(new Set([...dbSchoolYears, ...candidateYears])).sort(
      (a, b) => b.localeCompare(a)
    );
  }, [dbSchoolYears, candidatesData?.schoolYears]);

  const schoolYearStats = useMemo(() => {
    const statsMap: Record<
      string,
      { count: number; batches: Set<string> }
    > = {};

    allSchoolYearsList.forEach((sy) => {
      statsMap[sy] = { count: 0, batches: new Set() };
    });

    allCandidatesList.forEach((c) => {
      const sy = c.schoolYear;
      if (sy) {
        if (!statsMap[sy]) {
          statsMap[sy] = { count: 0, batches: new Set() };
        }
        statsMap[sy].count++;
        if (c.batch) statsMap[sy].batches.add(c.batch);
      }
    });

    return statsMap;
  }, [allSchoolYearsList, allCandidatesList]);

  const handleCreateSchoolYear = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newSchoolYearInput.trim().replace(/^s\.?y\.?\s*/i, "");

    if (!formatted) {
      toast.error("Please enter a valid school year (e.g. 2026-2027).");
      return;
    }

    createSchoolYearMutation.mutate(formatted, {
      onSuccess: () => {
        toast.success(`School Year ${formatted} has been added to the database!`);
        setIsNewYearModalOpen(false);
        setNewSchoolYearInput("");
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to create school year."
        );
      },
    });
  };

  const isLoading = isCandidatesLoading || isSchoolYearsLoading;

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Users className="size-6 text-primary shrink-0" />
            Enrolled Students
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a school year below to view enrolled students and batches.
          </p>
        </div>

        <Button
          onClick={() => setIsNewYearModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 h-9 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>New School Year</span>
        </Button>
      </div>

      {/* ── Summary Cards ── */}
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
                School Years in Database
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
                Review Batches
              </span>
              <div className="text-2xl font-black text-foreground">
                {batches.length || 0}
              </div>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── School Years List ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FolderOpen size={16} className="text-primary" />
          School Year Directory
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted-foreground gap-2">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading school years from database...</span>
          </div>
        ) : allSchoolYearsList.length === 0 ? (
          /* Zero-Data / Empty State when database has no school years */
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs">
            <div className="flex flex-col items-center justify-center p-14 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <CalendarPlus className="size-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  No School Years Added Yet
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start by adding your review center's active school year to begin enrolling students.
                </p>
              </div>
              <Button
                onClick={() => setIsNewYearModalOpen(true)}
                size="sm"
                className="mt-2 font-bold text-xs rounded-xl gap-1.5"
              >
                <Plus size={14} />
                <span>New School Year</span>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border bg-card overflow-hidden shadow-xs divide-y divide-border/60">
            {allSchoolYearsList.map((sy, index) => {
              const stats = schoolYearStats[sy] || {
                count: 0,
                batches: new Set(),
              };
              const isFirst = index === 0;

              return (
                <div
                  key={sy}
                  onClick={() => navigate(`/candidates/${sy}`)}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          School Year {sy}
                        </span>
                        {isFirst && (
                          <span className="text-[9.5px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md">
                            Latest
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground">
                        {stats.count === 0
                          ? "No students enrolled yet"
                          : `${stats.count} enrolled student${stats.count === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </div>

                  {/* Middle & Right: Batches & Action */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Layers size={13.5} className="text-primary shrink-0" />
                      <span>
                        {stats.batches.size === 0
                          ? "0 batches"
                          : `${stats.batches.size} batch${stats.batches.size === 1 ? "" : "es"}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span className="hidden sm:inline">View Students</span>
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* ── Create New School Year Modal ── */}
      <Dialog
        open={isNewYearModalOpen}
        onOpenChange={(open) => !open && setIsNewYearModalOpen(false)}
      >
        <DialogContent className="max-w-[420px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
          <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <CalendarPlus className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                  New School Year
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Enter a school year to save to the database and start enrolling students.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateSchoolYear} className="px-5 py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>School Year</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={newSchoolYearInput}
                onChange={(e) => setNewSchoolYearInput(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="h-9.5 text-xs rounded-xl bg-background border-border"
                autoFocus
                disabled={createSchoolYearMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewYearModalOpen(false)}
                className="h-8.5 px-3.5 text-xs rounded-xl border-border"
                disabled={createSchoolYearMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newSchoolYearInput.trim() ||
                  createSchoolYearMutation.isPending
                }
                className="h-8.5 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              >
                {createSchoolYearMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Create School Year"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SchoolYearsPage;
