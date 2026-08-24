import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, CheckCircle2, Copy, Save, Layers, ShieldCheck, Zap, RotateCcw } from "lucide-react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface SynthesizedResult {
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  feedback: string;
  logicalSoundnessRating?: number;
}

interface QuestionSynthesizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalData: {
    question: string;
    choices: string[];
    correctAnswer: string;
    topic: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
    categoryId: string;
  };
  onSaveBoth: (synthesized: SynthesizedResult) => Promise<void>;
  onSaveSynthesizedOnly: (synthesized: SynthesizedResult) => Promise<void>;
  onApplyToForm: (synthesized: SynthesizedResult) => void;
  onRestoreOriginal?: () => void;
}

export default function QuestionSynthesizerDialog({
  open,
  onOpenChange,
  originalData,
  onSaveBoth,
  onSaveSynthesizedOnly,
  onApplyToForm,
  onRestoreOriginal,
}: QuestionSynthesizerDialogProps) {
  const axiosPrivate = useAxiosPrivate();
  
  const [targetDifficulty, setTargetDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    originalData.difficulty || "MEDIUM"
  );
  const [synthesizedList, setSynthesizedList] = useState<SynthesizedResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);


  const runSynthesis = async (diff: "EASY" | "MEDIUM" | "HARD") => {
    setIsSynthesizing(true);
    try {
      const response = await axiosPrivate.post("/questions/synthesize", {
        question: originalData.question,
        choices: originalData.choices,
        correctAnswer: originalData.correctAnswer,
        topic: originalData.topic || "General",
        targetDifficulty: diff,
        type: originalData.type || "MCQ",
        count: 5,
      });

      const listData = response.data?.data?.synthesizedList || response.data?.synthesizedList;
      if (Array.isArray(listData) && listData.length > 0) {
        setSynthesizedList(listData);
        setSelectedIndex(0);
        toast.success("5 AI Question Variants generated!");
      } else {
        const fallbackSingle = response.data?.data?.synthesized || response.data?.synthesized;
        if (fallbackSingle) {
          setSynthesizedList([fallbackSingle]);
          setSelectedIndex(0);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to synthesize question variants.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (open) {
      const initialDiff = originalData.difficulty || "MEDIUM";
      setTargetDifficulty(initialDiff);
      runSynthesis(initialDiff);
    } else {
      setSynthesizedList([]);
      setSelectedIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleReSynthesize = () => {
    runSynthesis(targetDifficulty);
  };

  const handleDifficultyChange = (newDiff: "EASY" | "MEDIUM" | "HARD") => {
    setTargetDifficulty(newDiff);
    runSynthesis(newDiff);
  };

  const selectedVariant = synthesizedList[selectedIndex] || null;

  const handleSaveBothClick = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      await onSaveBoth(selectedVariant);
      onOpenChange(false);
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSynthesizedOnlyClick = async () => {
    if (!selectedVariant) return;
    setIsSaving(true);
    try {
      await onSaveSynthesizedOnly(selectedVariant);
      onOpenChange(false);
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyClick = () => {
    if (!selectedVariant) return;
    onApplyToForm(selectedVariant);
    toast.success(`Option #${selectedIndex + 1} applied to form!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:max-w-[92vw] lg:max-w-[88vw] xl:max-w-6xl max-h-[88vh] flex flex-col p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden font-sans">
        
        {/* Compact Header */}
        <DialogHeader className="pb-2.5 border-b border-border shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Sparkles size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
                    AI Question Synthesizer
                  </DialogTitle>
                  <Badge variant="secondary" className="text-[9px] font-extrabold uppercase bg-primary/15 text-primary border-primary/25 px-1.5 py-0">
                    5 Variants
                  </Badge>
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground font-medium leading-none mt-0.5">
                  Select your favorite AI question option from the 5 variants on the right
                </DialogDescription>
              </div>
            </div>

            {/* Target Difficulty Selector */}
            <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Level:
              </span>
              <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border">
                {(["EASY", "MEDIUM", "HARD"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleDifficultyChange(lvl)}
                    disabled={isSynthesizing}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded transition-all cursor-pointer ${
                      targetDifficulty === lvl
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReSynthesize}
                disabled={isSynthesizing}
                className="cursor-pointer gap-1 text-[11px] font-bold border-primary/30 text-primary hover:bg-primary/10 rounded-lg px-2.5 h-7"
              >
                <RefreshCw size={12} className={isSynthesizing ? "animate-spin" : ""} />
                {isSynthesizing ? "..." : "Regenerate"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Compact Grid: Left (Original Draft) + Right (5 Compact AI Options) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden my-2 pr-1">
          {isSynthesizing ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2.5 text-muted-foreground">
              <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
                <Sparkles size={28} />
              </div>
              <p className="text-xs font-bold text-foreground">Generating 5 AI Question Variants...</p>
              <p className="text-[11px] text-muted-foreground">Calibrating for {targetDifficulty} difficulty level</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-start">
              
              {/* Left Column: Original Base Question (Compact) */}
              <div className="lg:col-span-4 p-3.5 rounded-xl border border-border/80 bg-muted/30 flex flex-col gap-2.5 sticky top-0">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <Badge variant="outline" className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5">
                    Original Draft
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Level: <strong className="text-foreground">{originalData.difficulty}</strong>
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Question Stem</label>
                  <p className="text-xs font-medium text-foreground bg-background p-2.5 rounded-lg border border-border/80 leading-snug break-words">
                    {originalData.question}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Choices & Correct Key</label>
                  <div className="space-y-1">
                    {originalData.choices.length > 0 ? (
                      originalData.choices.map((choice, idx) => {
                        const isCorrect = choice.trim().toLowerCase() === originalData.correctAnswer.trim().toLowerCase();
                        return (
                          <div
                            key={idx}
                            className={`p-2 text-[11px] font-medium rounded-lg border flex items-center justify-between gap-2 ${
                              isCorrect
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                                : "bg-background border-border/70 text-muted-foreground"
                            }`}
                          >
                            <span className="break-words">{choice}</span>
                            {isCorrect && (
                              <Badge className="bg-emerald-500 text-white text-[8px] font-bold uppercase px-1 py-0 shrink-0">
                                Key
                              </Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-2 text-[11px] font-medium text-muted-foreground bg-background border border-border/70 rounded-lg">
                        Correct Key: <strong className="text-foreground">{originalData.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: 5 Compact Selectable AI Variant Cards */}
              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-primary" />
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      AI Generated Options ({synthesizedList.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Click an option card to select
                  </span>
                </div>

                {synthesizedList.map((variant, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                          : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/20"
                      }`}
                    >
                      {/* Compact Card Header */}
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/50 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className={isSelected ? "text-primary fill-primary/20" : "text-muted-foreground/30"} />
                          <Badge className={`${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} text-[9px] font-extrabold uppercase px-2 py-0.5`}>
                            Option #{idx + 1}
                          </Badge>
                          {isSelected && (
                            <Badge variant="outline" className="border-primary/40 text-primary text-[8px] font-bold uppercase px-1.5 py-0">
                              ACTIVE SELECTION
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                            <ShieldCheck size={12} /> Soundness: {variant.logicalSoundnessRating || 10}/10
                          </span>
                          <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-bold uppercase px-1.5 py-0">
                            {targetDifficulty}
                          </Badge>
                        </div>
                      </div>

                      {/* Stem */}
                      <p className="text-xs font-bold text-foreground leading-snug break-words">
                        {variant.question}
                      </p>

                      {/* Choices Grid (Only visible or expanded) */}
                      {variant.choices && variant.choices.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {variant.choices.map((choice, choiceIdx) => {
                            const isCorrect = choice.trim().toLowerCase() === variant.correctAnswer.trim().toLowerCase();
                            return (
                              <div
                                key={choiceIdx}
                                className={`p-1.5 px-2.5 text-[11px] font-medium rounded-lg border flex items-center justify-between gap-2 ${
                                  isCorrect
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold"
                                    : "bg-muted/30 border-border/70 text-foreground"
                                }`}
                              >
                                <span className="break-words leading-tight">{choice}</span>
                                {isCorrect && (
                                  <Badge className="bg-emerald-500 text-white text-[8px] font-bold uppercase px-1 py-0 shrink-0">
                                    Key
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Rationale Snippet */}
                      <div className="text-[10px] text-muted-foreground font-medium leading-relaxed bg-background/80 p-2 rounded-lg border border-border/50 break-words">
                        <strong className="text-primary font-bold">Logic Rationale:</strong> {variant.feedback}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer Action Bar */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 bg-muted/20 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:p-4 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer h-8"
          >
            Close
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {onRestoreOriginal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onRestoreOriginal();
                  onOpenChange(false);
                }}
                disabled={isSaving}
                className="text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer flex items-center gap-1.5 h-8.5 px-3"
              >
                <RotateCcw size={13} />
                Use Original Question
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyClick}
              disabled={!selectedVariant || isSaving}
              className="text-xs font-bold border-border hover:bg-accent text-foreground rounded-lg cursor-pointer flex items-center gap-1.5 h-8.5 px-3"
            >
              <Copy size={13} />
              Apply Option #{selectedIndex + 1}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveSynthesizedOnlyClick}
              disabled={!selectedVariant || isSaving}
              className="text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 rounded-lg cursor-pointer flex items-center gap-1.5 h-8.5 px-3"
            >
              <Save size={13} />
              Save Option #{selectedIndex + 1} Only
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSaveBothClick}
              disabled={!selectedVariant || isSaving}
              className="text-xs font-extrabold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg cursor-pointer flex items-center gap-1.5 h-8.5 px-4 shadow-xs"
            >
              {isSaving ? (
                <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
              ) : (
                <Layers size={14} />
              )}
              Save BOTH (Draft & Option #{selectedIndex + 1}) to DB
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
