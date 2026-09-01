import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoreVertical,
  User,
  Sparkles,
  BarChart2,
} from "lucide-react";
import { useBulkSaveScores } from "../api/useAssessments";
import type { GradeMatrixResponse, ScoreInputItem } from "../types";

interface GradeMatrixTableProps {
  matrixData: GradeMatrixResponse;
  onCandidateClick?: (candidateId: string) => void;
  onRefresh?: () => void;
}

export function GradeMatrixTable({
  matrixData,
  onCandidateClick,
  onRefresh,
}: GradeMatrixTableProps) {
  // Local state to track in-cell edits
  // Map of `${candidateId}_${assessmentId}` -> { score: number | null, status: string }
  const [editedCells, setEditedCells] = useState<
    Record<
      string,
      {
        score: number | null;
        status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
        isDirty: boolean;
      }
    >
  >({});

  const [savingAssessmentId, setSavingAssessmentId] = useState<string | null>(null);
  const bulkSaveMutation = useBulkSaveScores();

  const assessments = matrixData.assessments || [];
  const rows = matrixData.rows || [];

  // Reset local state when matrix data updates
  useEffect(() => {
    const initial: typeof editedCells = {};
    for (const row of rows) {
      for (const [assessId, scoreObj] of Object.entries(row.scores)) {
        const key = `${row.candidate.id}_${assessId}`;
        initial[key] = {
          score: scoreObj.score,
          status: scoreObj.status,
          isDirty: false,
        };
      }
    }
    setEditedCells(initial);
  }, [matrixData]);

  const handleScoreChange = (
    candidateId: string,
    assessmentId: string,
    valStr: string,
    maxScore: number
  ) => {
    const key = `${candidateId}_${assessmentId}`;
    let score: number | null = null;
    if (valStr !== "" && !isNaN(Number(valStr))) {
      score = Math.min(Math.max(0, Number(valStr)), maxScore);
    }

    setEditedCells((prev) => ({
      ...prev,
      [key]: {
        score,
        status: prev[key]?.status || "PRESENT",
        isDirty: true,
      },
    }));
  };

  const handleStatusChange = (
    candidateId: string,
    assessmentId: string,
    status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE"
  ) => {
    const key = `${candidateId}_${assessmentId}`;
    setEditedCells((prev) => ({
      ...prev,
      [key]: {
        score: status === "PRESENT" ? prev[key]?.score ?? null : null,
        status,
        isDirty: true,
      },
    }));
  };

  const isAnyDirty = Object.values(editedCells).some((c) => c.isDirty);

  // Save all modified scores for an assessment or all modified assessments
  const handleSaveAll = async () => {
    const dirtyKeys = Object.keys(editedCells).filter((k) => editedCells[k].isDirty);
    if (dirtyKeys.length === 0) return;

    // Group dirty cells by assessmentId
    const byAssessment: Record<string, ScoreInputItem[]> = {};
    for (const key of dirtyKeys) {
      const [candidateId, assessmentId] = key.split("_");
      const cell = editedCells[key];
      if (!byAssessment[assessmentId]) byAssessment[assessmentId] = [];
      byAssessment[assessmentId].push({
        candidateId,
        score: cell.score,
        status: cell.status,
      });
    }

    try {
      for (const [assessmentId, items] of Object.entries(byAssessment)) {
        setSavingAssessmentId(assessmentId);
        await bulkSaveMutation.mutateAsync({ assessmentId, items });
      }
      toast.success("All spreadsheet changes saved and statistics updated!");
      onRefresh?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save spreadsheet scores.");
    } finally {
      setSavingAssessmentId(null);
    }
  };

  if (assessments.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <div className="p-3 bg-muted w-fit mx-auto rounded-full text-muted-foreground mb-3">
          <BarChart2 className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No assessments created for this filter</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Create an assessment above or select a different school year or subject.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sticky Save Bar if dirty */}
      {isAnyDirty && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
            <AlertCircle className="size-4 text-amber-500" />
            <span>You have unsaved changes in the spreadsheet matrix.</span>
          </div>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={Boolean(savingAssessmentId)}
            className="text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {savingAssessmentId ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>Save All Changes</span>
          </Button>
        </div>
      )}

      {/* Spreadsheet Matrix Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/70 sticky top-0 z-20 border-b border-border text-[11px] font-bold text-muted-foreground">
              <tr>
                {/* Sticky Candidate Column */}
                <th className="p-3 sticky left-0 z-30 bg-muted/90 min-w-[220px] border-r border-border uppercase">
                  Candidate Roster ({rows.length})
                </th>

                {/* Assessment Columns */}
                {assessments.map((assess) => (
                  <th
                    key={assess.id}
                    className="p-3 min-w-[150px] max-w-[190px] border-r border-border text-center"
                  >
                    <div className="font-extrabold text-foreground truncate" title={assess.title}>
                      {assess.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-normal flex items-center justify-center gap-1 mt-0.5">
                      <span>{assess.subject}</span>
                      <span>•</span>
                      <span className="font-bold">{assess.maxScore} pts</span>
                    </div>

                    {/* Mini Cohort Stats Header */}
                    <div className="mt-1.5 pt-1.5 border-t border-border/60 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                      <span title="Class Mean">
                        μ: <strong>{assess.meanScore !== null && assess.meanScore !== undefined ? assess.meanScore.toFixed(0) : "—"}</strong>
                      </span>
                      <span title="Class Median">
                        Med: <strong>{assess.medianScore !== null && assess.medianScore !== undefined ? assess.medianScore.toFixed(0) : "—"}</strong>
                      </span>
                      <span title="Passing / Total">
                        Pass: <strong className="text-green-600">{assess.passCount}</strong>
                      </span>
                    </div>
                  </th>
                ))}

                {/* Overall Summary Column */}
                <th className="p-3 min-w-[120px] text-center uppercase bg-muted/40 font-black">
                  Total %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.candidate.id} className="hover:bg-muted/20 transition-colors">
                  {/* Sticky Candidate Info */}
                  <td className="p-3 sticky left-0 z-10 bg-card border-r border-border">
                    <button
                      type="button"
                      onClick={() => onCandidateClick?.(row.candidate.id)}
                      className="text-left group cursor-pointer w-full"
                    >
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span className="truncate">{row.candidate.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {row.candidate.schoolId || row.candidate.email}
                      </div>
                    </button>
                  </td>

                  {/* Assessment Score Cells */}
                  {assessments.map((assess) => {
                    const key = `${row.candidate.id}_${assess.id}`;
                    const cell = editedCells[key] || {
                      score: row.scores[assess.id]?.score ?? null,
                      status: row.scores[assess.id]?.status ?? "PRESENT",
                      isDirty: false,
                    };

                    const isPassing = cell.score !== null && cell.score >= assess.passingScore;

                    return (
                      <td
                        key={assess.id}
                        className={`p-2 text-center border-r border-border ${
                          cell.isDirty ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <Input
                            type="number"
                            min="0"
                            max={assess.maxScore}
                            value={cell.score !== null ? cell.score : ""}
                            onChange={(e) =>
                              handleScoreChange(
                                row.candidate.id,
                                assess.id,
                                e.target.value,
                                assess.maxScore
                              )
                            }
                            placeholder="—"
                            className={`w-16 h-8 text-center text-xs font-bold font-mono px-1 ${
                              cell.score !== null
                                ? isPassing
                                  ? "text-green-700 dark:text-green-400 bg-green-500/5 border-green-500/30"
                                  : "text-red-600 dark:text-red-400 bg-red-500/5 border-red-500/30"
                                : ""
                            }`}
                          />
                        </div>
                      </td>
                    );
                  })}

                  {/* Summary % */}
                  <td className="p-3 text-center bg-muted/20">
                    {row.summary.overallPercentage !== null ? (
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          row.summary.isPassing
                            ? "text-green-700 bg-green-500/10 border border-green-500/30"
                            : "text-red-600 bg-red-500/10 border border-red-500/30"
                        }`}
                      >
                        {row.summary.overallPercentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
