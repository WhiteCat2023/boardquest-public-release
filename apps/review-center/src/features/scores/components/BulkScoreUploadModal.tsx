import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  HelpCircle,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";
import {
  useBulkSaveScores,
  downloadAssessmentTemplate,
} from "../api/useAssessments";
import type { Assessment, ScoreInputItem } from "../types";
import {
  calculateMean,
  calculateMedian,
  calculateMode,
} from "@/utils/statsHelper";

interface BulkScoreUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
  onScoresSaved?: () => void;
}

interface ParsedRow {
  candidateId?: string;
  schoolId?: string;
  name?: string;
  email?: string;
  score: number | null;
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
  remarks?: string;
  isValid: boolean;
  error?: string;
}

export function BulkScoreUploadModal({
  open,
  onOpenChange,
  assessment,
  onScoresSaved,
}: BulkScoreUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteContent, setPasteContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkSaveMutation = useBulkSaveScores();

  if (!assessment) return null;

  const maxScore = assessment.maxScore || 100;
  const passingScore = assessment.passingScore || 75;

  // ── CSV / Text Parsing Logic ──
  const parseRawCsvText = (text: string) => {
    const lines = text
      .split(/\r\n|\n|\r/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const rows: ParsedRow[] = [];
    // Check if first row is header
    const firstLineLower = lines[0].toLowerCase();
    const startIndex =
      firstLineLower.includes("score") ||
      firstLineLower.includes("email") ||
      firstLineLower.includes("student") ||
      firstLineLower.includes("name")
        ? 1
        : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split by tab or comma (handling quoted commas)
      const delimiter = line.includes("\t") ? "\t" : ",";
      let parts: string[];

      if (delimiter === ",") {
        // Regex to split comma without breaking quoted strings
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        parts = matches
          ? matches.map((p) => p.replace(/^"|"$/g, "").trim())
          : line.split(",").map((p) => p.trim());
      } else {
        parts = line.split("\t").map((p) => p.trim());
      }

      if (parts.length < 2) continue;

      let schoolId = "";
      let name = "";
      let email = "";
      let rawScoreStr = "";
      let statusStr = "PRESENT";
      let remarks = "";

      if (parts.length >= 4) {
        // Format: Student ID, Full Name, Email, Score, Status, Remarks
        schoolId = parts[0] || "";
        name = parts[1] || "";
        email = parts[2] || "";
        rawScoreStr = parts[3] || "";
        statusStr = parts[4] || "PRESENT";
        remarks = parts[5] || "";
      } else if (parts.length === 3) {
        // Format: Email/ID, Name, Score
        if (parts[0].includes("@")) {
          email = parts[0];
        } else {
          schoolId = parts[0];
        }
        name = parts[1];
        rawScoreStr = parts[2];
      } else if (parts.length === 2) {
        // Format: Email/ID, Score
        if (parts[0].includes("@")) {
          email = parts[0];
        } else {
          schoolId = parts[0];
        }
        rawScoreStr = parts[1];
      }

      const normalizedStatus = statusStr.toUpperCase();
      let status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE" = "PRESENT";
      if (normalizedStatus.includes("ABS")) status = "ABSENT";
      else if (normalizedStatus.includes("EXC")) status = "EXCUSED";
      else if (normalizedStatus.includes("INC")) status = "INCOMPLETE";

      let score: number | null = null;
      let isValid = true;
      let error = "";

      if (status === "PRESENT") {
        if (rawScoreStr === "" || isNaN(Number(rawScoreStr))) {
          isValid = false;
          error = "Missing or invalid numeric score";
        } else {
          const num = Number(rawScoreStr);
          if (num < 0) {
            isValid = false;
            error = "Score cannot be negative";
          } else if (num > maxScore) {
            isValid = false;
            error = `Score ${num} exceeds maximum (${maxScore})`;
          } else {
            score = num;
          }
        }
      }

      if (!email && !schoolId && !name) {
        isValid = false;
        error = "No student identifier found (missing ID, email, or name)";
      }

      rows.push({
        schoolId,
        name,
        email,
        score,
        status,
        remarks,
        isValid,
        error,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseRawCsvText(content);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteContent(text);
    parseRawCsvText(text);
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info("Generating student roster template...");
      await downloadAssessmentTemplate(assessment.id, assessment.title);
      toast.success("Roster template downloaded!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to download template.");
    }
  };

  // Projected Cohort Statistics
  const validPresentScores = parsedRows
    .filter((r) => r.isValid && r.status === "PRESENT" && r.score !== null)
    .map((r) => r.score as number);

  const projectedMean = calculateMean(validPresentScores);
  const projectedMedian = calculateMedian(validPresentScores);
  const projectedMode = calculateMode(validPresentScores);
  const projectedPassingCount = validPresentScores.filter((s) => s >= passingScore).length;
  const projectedFailingCount = validPresentScores.length - projectedPassingCount;

  const validRowCount = parsedRows.filter((r) => r.isValid).length;
  const invalidRowCount = parsedRows.length - validRowCount;

  const handleSaveScores = () => {
    if (parsedRows.length === 0) {
      toast.error("No scores found to upload.");
      return;
    }

    if (invalidRowCount > 0) {
      toast.error(`Please correct ${invalidRowCount} invalid row(s) before saving.`);
      return;
    }

    const payload: ScoreInputItem[] = parsedRows.map((r) => ({
      candidateId: r.candidateId,
      schoolId: r.schoolId || undefined,
      email: r.email || undefined,
      score: r.score,
      status: r.status,
      remarks: r.remarks || undefined,
    }));

    bulkSaveMutation.mutate(
      {
        assessmentId: assessment.id,
        items: payload,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Scores recorded successfully! (${res.createdCount} new, ${res.updatedCount} updated)`
          );
          onScoresSaved?.();
          onOpenChange(false);
          setParsedRows([]);
          setFileName(null);
          setPasteContent("");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to upload scores.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                  Upload Student Scores & Grades
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {assessment.title} ({assessment.subject}) • Max Score: {maxScore} pts • Passing: {passingScore} pts
                </DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs font-bold text-primary gap-1.5"
            >
              <Download className="size-3.5" />
              <span>Download Roster CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-4 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === "file"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="size-3.5" />
            <span>Option 1: Upload CSV / Excel File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-all border-b-2 cursor-pointer ${
              activeTab === "paste"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clipboard className="size-3.5" />
            <span>Option 2: Copy-Paste from Sheets</span>
          </button>
        </div>

        {/* Option 1: File Upload Tab */}
        {activeTab === "file" && (
          <div className="space-y-3 py-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Upload className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {fileName ? fileName : "Click to select or drag & drop CSV file"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pre-filled template ensures 100% match with enrolled candidates
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Option 2: Paste Tab */}
        {activeTab === "paste" && (
          <div className="space-y-2 py-2">
            <Label className="text-xs font-bold text-muted-foreground">
              Paste student scores directly from Excel or Google Sheets (Tab or Comma separated):
            </Label>
            <textarea
              rows={4}
              value={pasteContent}
              onChange={handlePasteChange}
              placeholder="e.g.&#10;2024-0012	Maria Clara	maria.santos@email.com	88&#10;2024-0013	Juan Dela Cruz	juan.delacruz@email.com	92"
              className="w-full text-xs font-mono p-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Projected Statistical Banner */}
        {validPresentScores.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Projected Cohort Statistics:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-muted-foreground">
                Mean: <strong className="text-foreground">{projectedMean.toFixed(1)}</strong>
              </span>
              <span className="font-semibold text-muted-foreground">
                Median: <strong className="text-foreground">{projectedMedian.toFixed(1)}</strong>
              </span>
              <span className="font-semibold text-muted-foreground">
                Mode: <strong className="text-foreground">{projectedMode.length > 0 ? projectedMode.join(", ") : "Uniform"}</strong>
              </span>
              <span className="font-semibold text-muted-foreground">
                Passing: <strong className="text-green-600">{projectedPassingCount}</strong> / <span className="text-red-500">{projectedFailingCount} fail</span>
              </span>
            </div>
          </div>
        )}

        {/* Live Pre-Upload Validation Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Preview Parsed Scores ({parsedRows.length} students)</span>
                {invalidRowCount === 0 ? (
                  <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/30 text-[10px]">
                    All Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">
                    {invalidRowCount} Error(s)
                  </Badge>
                )}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Green indicates valid entries ready for sync
              </span>
            </div>

            <div className="border border-border rounded-lg max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-2">Student ID / Email</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Score / Max</th>
                    <th className="p-2 text-right">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? "hover:bg-muted/20" : "bg-destructive/10"}
                    >
                      <td className="p-2 font-mono text-[11px]">
                        {row.schoolId || row.email || "—"}
                      </td>
                      <td className="p-2 font-medium text-foreground">
                        {row.name || "—"}
                      </td>
                      <td className="p-2">
                        {row.score !== null ? (
                          <span className="font-bold">
                            {row.score} / {maxScore} (
                            {((row.score / maxScore) * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-destructive font-bold">Missing</span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-bold text-[11px]">
                            <CheckCircle2 className="size-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive font-bold text-[11px]" title={row.error}>
                            <AlertCircle className="size-3.5" />
                            <span>{row.error}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkSaveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveScores}
            disabled={
              bulkSaveMutation.isPending ||
              parsedRows.length === 0 ||
              invalidRowCount > 0
            }
            className="font-bold"
          >
            {bulkSaveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving Scores...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-1.5" />
                Save & Recalculate ({validRowCount} Scores)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
