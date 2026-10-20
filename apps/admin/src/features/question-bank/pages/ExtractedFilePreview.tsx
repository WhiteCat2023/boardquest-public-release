import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  useExtractedQuestionsStore,
  useBulkUploadQuestionStore,
} from "@/store/QuestionBankStore";
import { BulkUploadSummaryModal } from "@/components/feedback";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import { showFeedback } from "@/components/modal";
import ExtractedQuestionAccordionRow from "../components/ExtractedQuestionAccordionRow";

function ExtractedFilePreview() {
  const { extractedQuestions, setExtractedQuestions } =
    useExtractedQuestionsStore();
  const {
    isUploading,
    handleBulkUpload,
    uploadSummary,
    closeUploadSummary,
  } = useBulkUploadQuestionStore();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const from = location.state?.from?.pathname || "/question-bank";

  const normalize = (str: string) =>
    (str || "").toLowerCase().trim().replace(/\s+/g, " ");

  const duplicateInfo = useMemo(() => {
    const seen = new Set<string>();
    const duplicateIndices = new Set<number>();
    extractedQuestions.forEach((q, idx) => {
      const norm = normalize(q.question);
      if (norm) {
        if (seen.has(norm)) {
          duplicateIndices.add(idx);
        } else {
          seen.add(norm);
        }
      }
    });
    return {
      duplicateIndices,
      count: duplicateIndices.size,
    };
  }, [extractedQuestions]);

  const handleRemoveInFileDuplicates = () => {
    const seen = new Set<string>();
    const unique: any[] = [];
    extractedQuestions.forEach((q) => {
      const norm = normalize(q.question);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        unique.push(q);
      }
    });
    const removedCount = extractedQuestions.length - unique.length;
    setExtractedQuestions(unique);
    setExpandedIndices(new Set());
    showFeedback.success(`Removed ${removedCount} duplicate question(s) from the preview.`);
  };

  const onUploadClick = () => {
    handleBulkUpload(axiosPrivate, navigate, from);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIndices.size === extractedQuestions.length) {
      setExpandedIndices(new Set());
    } else {
      setExpandedIndices(new Set(extractedQuestions.map((_, i) => i)));
    }
  };

  const handleUpdateQuestion = (index: number, updated: any) => {
    const updatedList = [...extractedQuestions];
    updatedList[index] = updated;
    setExtractedQuestions(updatedList);
  };

  const handleDeleteRow = (index: number) => {
    const updated = extractedQuestions.filter((_, i) => i !== index);
    setExtractedQuestions(updated);
    setExpandedIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
    showFeedback.success(`Removed question #${index + 1}`);
  };

  const allExpanded =
    extractedQuestions.length > 0 &&
    expandedIndices.size === extractedQuestions.length;

  return (
    <div className="flex flex-col gap-4 w-full animate-in zoom-in-95 duration-200 font-sans">
      <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 md:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/40">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>Review Extracted Questions</span>
              <span className="text-[11px] font-semibold text-muted-foreground bg-background border border-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Layers size={11} className="text-primary" />
                Accordion View &amp; Edit
              </span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Double-check the questions below. Click on any row or the Edit button to expand the accordion and modify wording, choices, or metadata before uploading.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {extractedQuestions.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="h-7 px-2.5 text-xs font-semibold gap-1 rounded-xl border-border hover:bg-background cursor-pointer shadow-2xs"
                title={allExpanded ? "Collapse all rows" : "Expand all rows"}
              >
                {allExpanded ? (
                  <>
                    <ChevronUp size={13} />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    <span>
                      Expand All
                      {expandedIndices.size > 0 &&
                        ` (${expandedIndices.size}/${extractedQuestions.length})`}
                    </span>
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs">
              <CheckCircle2 size={14} />
              <span>{extractedQuestions.length} Questions Ready</span>
            </div>
          </div>
        </div>

        {/* In-File Duplicates Warning Banner */}
        {duplicateInfo.count > 0 && (
          <div className="mx-4 md:mx-5 my-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={17} />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block sm:inline">
                  {duplicateInfo.count} duplicate question(s) detected in this file.
                </span>{" "}
                <span className="text-muted-foreground">
                  Identical questions will be automatically skipped upon upload to prevent duplicates in the question bank.
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveInFileDuplicates}
              className="h-7 px-3 text-xs font-semibold gap-1.5 rounded-lg border-amber-500/40 bg-background text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 cursor-pointer shrink-0 shadow-2xs"
            >
              <Trash2 size={12} />
              <span>Remove {duplicateInfo.count} Duplicates</span>
            </Button>
          </div>
        )}

        {/* Extracted Questions Table with Accordion Rows */}
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="hidden lg:table-cell w-[60px] pl-4 text-center">
                  #
                </TableHead>
                <TableHead className="min-w-[200px]">Question Wording</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">
                  Topic
                </TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">
                  Type
                </TableHead>
                <TableHead className="hidden lg:table-cell w-[110px]">
                  Difficulty
                </TableHead>
                <TableHead className="hidden lg:table-cell min-w-[150px]">
                  Answer Key
                </TableHead>
                <TableHead className="w-[120px] lg:w-[150px] text-right pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedQuestions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No extracted questions available.
                  </TableCell>
                </TableRow>
              ) : (
                extractedQuestions.map((q: any, idx: number) => (
                  <ExtractedQuestionAccordionRow
                    key={idx}
                    index={idx}
                    question={q}
                    isExpanded={expandedIndices.has(idx)}
                    isDuplicate={duplicateInfo.duplicateIndices.has(idx)}
                    onToggleExpand={() => toggleExpand(idx)}
                    onUpdateQuestion={(updated) =>
                      handleUpdateQuestion(idx, updated)
                    }
                    onDelete={() => handleDeleteRow(idx)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Bottom Actions Bar */}
        <div className="p-4 md:p-5 border-t border-border bg-muted/40 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setExtractedQuestions([])}
            disabled={isUploading}
            className="cursor-pointer border-border hover:bg-accent font-semibold px-4 h-9 rounded-xl text-xs"
          >
            Cancel &amp; Re-upload
          </Button>

          <Button
            size="sm"
            onClick={onUploadClick}
            disabled={isUploading || extractedQuestions.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-bold px-5 h-9 rounded-xl text-xs flex items-center gap-2 shadow-xs"
          >
            {isUploading ? (
              <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>
              Upload {extractedQuestions.length} Questions to Bank
              {duplicateInfo.count > 0 && ` (${duplicateInfo.count} duplicate${duplicateInfo.count > 1 ? "s" : ""} skipped)`}
            </span>
          </Button>
        </div>
      </Card>

      <BulkUploadSummaryModal
        open={Boolean(uploadSummary?.isOpen)}
        onOpenChange={(open) => {
          if (!open) {
            const redirectPath = uploadSummary?.from || from;
            closeUploadSummary();
            setExtractedQuestions([]);
            navigate(redirectPath, { replace: true });
          }
        }}
        title={
          uploadSummary && uploadSummary.uploadedCount === 0
            ? "All Duplicates Skipped"
            : "Upload Complete with Notices"
        }
        description={
          uploadSummary && uploadSummary.uploadedCount === 0
            ? "All questions in this file already exist in this category and were skipped."
            : undefined
        }
        stats={{
          total: uploadSummary?.totalCount || 0,
          successful: uploadSummary?.uploadedCount || 0,
          skipped: uploadSummary?.skippedDuplicates || 0,
        }}
        skippedReasonText="Questions with identical question text already present in this subject were automatically skipped to prevent duplication."
        primaryAction={{
          label: "View Question Bank",
          onClick: () => {
            const redirectPath = uploadSummary?.from || from;
            closeUploadSummary();
            setExtractedQuestions([]);
            navigate(redirectPath, { replace: true });
          },
        }}
        secondaryAction={
          uploadSummary && uploadSummary.uploadedCount === 0
            ? {
                label: "Re-upload File",
                onClick: () => {
                  closeUploadSummary();
                  setExtractedQuestions([]);
                  navigate("/question-bank/import");
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export default ExtractedFilePreview;