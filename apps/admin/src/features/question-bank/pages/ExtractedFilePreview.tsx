import { useState } from "react";
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
import QuestionSynthesizerDialog, { type SynthesizedResult } from "../components/dialog/QuestionSynthesizerDialog";
import { useExtractedQuestionsStore, useBulkUploadQuestionStore, useEditBulkQuestionStore } from "@/store/QuestionBankStore";
import { CheckCircle2, Sparkles, Trash2, Tag } from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getDifficultyColor } from "@/utils/style";

function ExtractedFilePreview() {
    const { extractedQuestions, setExtractedQuestions } = useExtractedQuestionsStore();
    const { isUploading, handleBulkUpload } = useBulkUploadQuestionStore();
    const { editingIndex } = useEditBulkQuestionStore();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [synthesizingIndex, setSynthesizingIndex] = useState<number | null>(null);
    const from = location.state?.from?.pathname || "/question-bank";

    const onUploadClick = () => {
        handleBulkUpload(axiosPrivate, navigate, from);
    };

    const handleDeleteRow = (index: number) => {
      const updated = extractedQuestions.filter((_, i) => i !== index);
      setExtractedQuestions(updated);
      toast.success(`Removed question #${index + 1}`);
    };

    const targetRowQuestion = synthesizingIndex !== null ? extractedQuestions[synthesizingIndex] : null;

    const handleApplySynthesizedToRow = (synthesized: SynthesizedResult) => {
      if (synthesizingIndex === null) return;
      const updated = [...extractedQuestions];
      updated[synthesizingIndex] = {
        ...updated[synthesizingIndex],
        question: synthesized.question,
        choices: synthesized.choices,
        correctAnswer: synthesized.correctAnswer,
        difficulty: synthesized.difficulty,
      };
      setExtractedQuestions(updated);
      toast.success(`Question #${synthesizingIndex + 1} updated with AI synthesized wording!`);
      setSynthesizingIndex(null);
    };

    const handleSaveBothRows = async (synthesized: SynthesizedResult) => {
      if (synthesizingIndex === null) return;
      const originalQ = extractedQuestions[synthesizingIndex];
      const synthesizedQ = {
        ...originalQ,
        question: synthesized.question,
        choices: synthesized.choices,
        correctAnswer: synthesized.correctAnswer,
        difficulty: synthesized.difficulty,
      };

      const updated = [...extractedQuestions];
      updated.splice(synthesizingIndex + 1, 0, synthesizedQ);
      setExtractedQuestions(updated);
      toast.success(`Added AI synthesized variant to review list (Original preserved)!`);
      setSynthesizingIndex(null);
    };

    return (
      <div className="flex flex-col gap-4 w-full animate-in zoom-in-95 duration-200 font-sans">
        <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 md:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/40">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                Review Extracted Questions
                <span className="text-[11px] font-semibold text-muted-foreground bg-background border border-border px-2.5 py-0.5 rounded-full">
                  Click ✨ on any row to AI synthesize
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Double-check the questions below. You can edit entries inline, synthesize with AI, or delete rows before saving.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs shrink-0">
              <CheckCircle2 size={14} />
              {extractedQuestions.length} Questions Ready
            </div>
          </div>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="hidden lg:table-cell w-[60px] pl-4 text-center">#</TableHead>
                  <TableHead className="min-w-[200px]">Question Wording</TableHead>
                  <TableHead className="hidden lg:table-cell w-[120px]">Topic</TableHead>
                  <TableHead className="hidden lg:table-cell w-[100px]">Type</TableHead>
                  <TableHead className="hidden lg:table-cell w-[110px]">Difficulty</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px]">Answer Key</TableHead>
                  <TableHead className="w-[120px] lg:w-[150px] text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No extracted questions available.
                    </TableCell>
                  </TableRow>
                ) : (
                  extractedQuestions.map((q: any, idx: number) => {
                    const choicesDisplay = Array.isArray(q.choices)
                      ? q.choices.join(" | ")
                      : q.choices || "";

                    return (
                      <TableRow key={idx} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="hidden lg:table-cell pl-4 text-center font-bold text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] border border-border">
                            #{idx + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 max-w-[420px]">
                            <span className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed" title={q.question}>
                              {q.question || "Untitled Question"}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {choicesDisplay && (
                                <span className="text-[11px] text-muted-foreground truncate max-w-[250px]" title={choicesDisplay}>
                                  Choices: {choicesDisplay}
                                </span>
                              )}
                              <span className="lg:hidden rounded bg-muted border border-border px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                {q.difficulty || "MEDIUM"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
                            <Tag size={10} className="text-muted-foreground/60" />
                            {q.topic || "General"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            {q.type || "MCQ"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty || "MEDIUM"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs font-medium text-foreground bg-primary/5 px-2 py-1 rounded-md border border-primary/10 inline-block truncate max-w-[240px]" title={q.correctAnswer}>
                            {q.correctAnswer || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSynthesizingIndex(idx)}
                              className="h-7 px-2.5 text-xs font-bold text-primary border-primary/30 bg-primary/5 hover:bg-primary/15 cursor-pointer rounded-lg flex items-center gap-1 shadow-2xs"
                              title="AI Synthesize Question"
                            >
                              <Sparkles size={13} className="text-primary" />
                              <span>Synthesize</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRow(idx)}
                              className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer rounded-lg"
                              title="Remove Question"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
              Cancel & Re-upload
            </Button>

            <Button
              size="sm"
              onClick={onUploadClick}
              disabled={isUploading || editingIndex !== null}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-bold px-5 h-9 rounded-xl text-xs flex items-center gap-2 shadow-xs"
            >
              {isUploading ? (
                <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              Upload {extractedQuestions.length} Questions to Bank
            </Button>
          </div>
        </Card>

        {/* AI Question Synthesizer Preview Modal for Row Review */}
        {targetRowQuestion && (
          <QuestionSynthesizerDialog
            open={synthesizingIndex !== null}
            onOpenChange={(open) => {
              if (!open) setSynthesizingIndex(null);
            }}
            originalData={{
              question: targetRowQuestion.question,
              choices: targetRowQuestion.choices || [],
              correctAnswer: targetRowQuestion.correctAnswer || "",
              topic: targetRowQuestion.topic || "General",
              difficulty: (targetRowQuestion.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
              type: (targetRowQuestion.type as "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER") || "MCQ",
              categoryId: (targetRowQuestion as any).categoryId || "",
            }}
            onSaveBoth={handleSaveBothRows}
            onSaveSynthesizedOnly={async (synth) => handleApplySynthesizedToRow(synth)}
            onApplyToForm={handleApplySynthesizedToRow}
          />
        )}
      </div>
    );
}

export default ExtractedFilePreview;