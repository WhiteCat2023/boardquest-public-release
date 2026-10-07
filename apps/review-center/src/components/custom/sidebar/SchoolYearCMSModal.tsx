import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";
import {
  useCandidates,
  useCreateSchoolYear,
  useUpdateSchoolYear,
  useDeleteSchoolYear,
} from "@/features/students/api/useCandidates";
import {
  formatSchoolYearInput,
  normalizeSchoolYear,
  isValidSchoolYear,
} from "@/lib/utils";

export function SchoolYearCMSModal() {
  const {
    isCMSModalOpen,
    closeCMSModal,
    cmsModalMode,
    activeSchoolYear,
    currentSchoolYear,
    selectSchoolYear,
    schoolYears,
  } = useActiveSchoolYear();

  const { data: candidatesData } = useCandidates();
  const createMutation = useCreateSchoolYear();
  const updateMutation = useUpdateSchoolYear();
  const deleteMutation = useDeleteSchoolYear();

  // Create form state
  const [newYearInput, setNewYearInput] = useState("");

  // Edit modal state
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [editYearInput, setEditYearInput] = useState("");

  // Delete modal state
  const [deletingYear, setDeletingYear] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Calculate student count per school year
  const candidates = candidatesData?.candidates || [];
  const candidateCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    candidates.forEach((c) => {
      if (c.schoolYear) {
        map[c.schoolYear] = (map[c.schoolYear] || 0) + 1;
      }
    });
    return map;
  }, [candidates]);

  // Handle New School Year submission
  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = normalizeSchoolYear(newYearInput);

    if (!isValidSchoolYear(formatted)) {
      toast.error(
        "Please enter a valid school year in YYYY-YYYY format (e.g. 2026-2027)."
      );
      return;
    }

    if (schoolYears.includes(formatted)) {
      toast.error(`School Year ${formatted} already exists.`);
      return;
    }

    createMutation.mutate(
      { schoolYear: formatted, isCurrent: true },
      {
        onSuccess: () => {
          toast.success(`School Year ${formatted} created and set as current!`);
          setNewYearInput("");
          selectSchoolYear(formatted);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to create school year."
          );
        },
      }
    );
  };

  // Open Edit Dialog for a year
  const handleOpenEdit = (sy: string) => {
    setEditingYear(sy);
    setEditYearInput(sy);
  };

  // Submit Edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear) return;

    const formatted = normalizeSchoolYear(editYearInput);
    if (!isValidSchoolYear(formatted)) {
      toast.error("Please enter a valid YYYY-YYYY format.");
      return;
    }

    if (formatted === editingYear) {
      setEditingYear(null);
      return;
    }

    updateMutation.mutate(
      { oldSchoolYear: editingYear, newSchoolYear: formatted },
      {
        onSuccess: () => {
          toast.success(
            `Renamed ${editingYear} to ${formatted} successfully!`
          );
          if (activeSchoolYear === editingYear) {
            selectSchoolYear(formatted);
          }
          setEditingYear(null);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to rename school year."
          );
        },
      }
    );
  };

  // Open Delete Confirmation
  const handleOpenDelete = (sy: string) => {
    setDeletingYear(sy);
    setDeleteConfirmText("");
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingYear) return;

    const count = candidateCounts[deletingYear] || 0;
    if (count > 0 && deleteConfirmText !== deletingYear) {
      toast.error(`Please type "${deletingYear}" to confirm deletion.`);
      return;
    }

    deleteMutation.mutate(deletingYear, {
      onSuccess: () => {
        toast.success(`School Year ${deletingYear} deleted.`);
        if (activeSchoolYear === deletingYear) {
          const remaining = schoolYears.filter((y) => y !== deletingYear);
          if (remaining.length > 0) {
            selectSchoolYear(remaining[0]);
          }
        }
        setDeletingYear(null);
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to delete school year."
        );
      },
    });
  };

  return (
    <>
      {/* ── Main School Year CMS Modal ── */}
      <Dialog open={isCMSModalOpen} onOpenChange={(open) => !open && closeCMSModal()}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl font-sans">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-5 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Calendar className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  School Year Cohort Management (CMS)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage academic cohorts. The selected school year scopes candidate rosters and performance evaluations.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* ── Create New School Year Section ── */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Plus className="size-3.5 text-primary" />
                Add New School Year Cohort
              </span>
              <form onSubmit={handleCreateYear} className="flex gap-2">
                <Input
                  autoFocus={cmsModalMode === "create"}
                  type="text"
                  placeholder="e.g. 2027-2028 (or type 2027)"
                  value={newYearInput}
                  onChange={(e) =>
                    setNewYearInput(formatSchoolYearInput(e.target.value))
                  }
                  onBlur={() =>
                    setNewYearInput(normalizeSchoolYear(newYearInput))
                  }
                  className="text-xs h-9 font-medium"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newYearInput || createMutation.isPending}
                  className="h-9 px-3.5 text-xs font-bold shrink-0 cursor-pointer"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="size-3.5 mr-1" />
                      Add Year
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* ── Existing Cohorts List ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Available School Years ({schoolYears.length})
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Click a cohort to switch active view
                </span>
              </div>

              <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-background">
                {schoolYears.map((sy) => {
                  const isActive = sy === activeSchoolYear;
                  const isCurrent = sy === currentSchoolYear;
                  const count = candidateCounts[sy] || 0;

                  return (
                    <div
                      key={sy}
                      className={`flex items-center justify-between p-3 transition-colors ${
                        isActive
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <GraduationCap className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold truncate ${
                                isActive ? "text-primary" : "text-foreground"
                              }`}
                            >
                              SY {sy}
                            </span>
                            {isCurrent && (
                              <Badge
                                variant="outline"
                                className="text-[8.5px] px-1.5 py-0 bg-primary/15 text-primary border-primary/25 font-black uppercase tracking-wider"
                              >
                                Current
                              </Badge>
                            )}
                            {isActive && !isCurrent && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-muted text-muted-foreground border-border font-extrabold"
                              >
                                Active View
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground block truncate">
                            {count} candidate{count === 1 ? "" : "s"} enrolled
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isActive ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              selectSchoolYear(sy);
                              toast.info(`Switched to School Year ${sy}`);
                            }}
                            className="h-7 text-[11px] font-bold px-2 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          >
                            Set Active
                          </Button>
                        ) : (
                          <span className="text-[11px] font-bold text-primary flex items-center gap-1 px-1">
                            <CheckCircle2 className="size-3.5" />
                            Current
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sy)}
                          className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Rename school year"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(sy)}
                          className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete school year"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit School Year Dialog ── */}
      <Dialog
        open={Boolean(editingYear)}
        onOpenChange={(open) => !open && setEditingYear(null)}
      >
        <DialogContent className="max-w-md p-5 rounded-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              Rename School Year
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the cohort label. All candidates and evaluations in {editingYear} will automatically update.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                New School Year
              </label>
              <Input
                type="text"
                value={editYearInput}
                onChange={(e) =>
                  setEditYearInput(formatSchoolYearInput(e.target.value))
                }
                onBlur={() =>
                  setEditYearInput(normalizeSchoolYear(editYearInput))
                }
                className="h-9 text-xs font-medium"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingYear(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending || !editYearInput}
              >
                {updateMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete School Year Dialog ── */}
      <Dialog
        open={Boolean(deletingYear)}
        onOpenChange={(open) => !open && setDeletingYear(null)}
      >
        <DialogContent className="max-w-md p-5 rounded-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Delete School Year {deletingYear}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {(candidateCounts[deletingYear || ""] || 0) > 0 ? (
                <>
                  Warning: There are{" "}
                  <strong>{candidateCounts[deletingYear || ""]}</strong>{" "}
                  candidate(s) enrolled in this school year. Deleting this cohort
                  will impact associated evaluation records.
                </>
              ) : (
                "Are you sure you want to remove this empty school year cohort?"
              )}
            </DialogDescription>
          </DialogHeader>

          {(candidateCounts[deletingYear || ""] || 0) > 0 && (
            <div className="space-y-1.5 mt-2">
              <label className="text-xs text-muted-foreground block">
                Type <strong>{deletingYear}</strong> below to confirm:
              </label>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deletingYear || ""}
                className="h-9 text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingYear(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={
                deleteMutation.isPending ||
                ((candidateCounts[deletingYear || ""] || 0) > 0 &&
                  deleteConfirmText !== deletingYear)
              }
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              )}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SchoolYearCMSModal;
