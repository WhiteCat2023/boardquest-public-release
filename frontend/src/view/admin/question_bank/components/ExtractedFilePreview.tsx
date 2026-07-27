import { useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import QuestionTable from "./table/questionTable";
import QuestionSynthesizerDialog, { type SynthesizedResult } from "./dialog/QuestionSynthesizerDialog";
import { useExtractedQuestionsStore, useBulkUploadQuestionStore, useEditBulkQuestionStore } from "../../../../store/QuestionBankStore";
import { CheckCircle2, Sparkles } from "lucide-react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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
            <QuestionTable onSynthesizeRow={(idx) => setSynthesizingIndex(idx)} />
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
              status: "DRAFT",
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