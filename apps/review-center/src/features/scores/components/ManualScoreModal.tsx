import React, { useState, useEffect } from "react";
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
import { User, Award, CheckCircle2, XCircle, Loader2, Sparkles, PenLine } from "lucide-react";
import { useBulkSaveScores } from "../api/useAssessments";
import type { Assessment } from "../types";

interface ManualScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
  student: {
    candidateId: string;
    name: string;
    email: string;
    schoolId?: string;
    score: number | null;
  } | null;
  onScoreSaved: () => void;
}

export function ManualScoreModal({
  open,
  onOpenChange,
  assessment,
  student,
  onScoreSaved,
}: ManualScoreModalProps) {
  const [scoreInput, setScoreInput] = useState("");
  const saveScoresMutation = useBulkSaveScores();

  useEffect(() => {
    if (open && student) {
      setScoreInput(student.score !== null ? String(student.score) : "");
    }
  }, [open, student]);

  if (!student) return null;

  const numScore = scoreInput.trim() !== "" ? Number(scoreInput) : null;
  const isValidNumber = numScore !== null && !isNaN(numScore) && numScore >= 0 && numScore <= assessment.maxScore;
  const percentage = isValidNumber ? (numScore / assessment.maxScore) * 100 : null;
  const isPassed = percentage !== null && percentage >= (assessment.passingRate || 75);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNumber) {
      toast.error(`Please enter a valid score between 0 and ${assessment.maxScore}.`);
      return;
    }

    saveScoresMutation.mutate(
      {
        assessmentId: assessment.id,
        items: [
          {
            candidateId: student.candidateId,
            score: numScore,
            status: "PRESENT",
          },
        ],
      },
      {
        onSuccess: () => {
          toast.success(`Score for ${student.name} saved successfully!`);
          onOpenChange(false);
          onScoreSaved();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to save student score.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6 font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PenLine className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                {student.score !== null ? "Edit Student Score" : "Record Student Score"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manually record or update the score for this candidate.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Candidate Info Card */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-foreground">{student.name}</p>
              <p className="text-[11px] text-muted-foreground">{student.email}</p>
              {student.schoolId && student.schoolId !== "—" && (
                <p className="text-[10px] font-mono text-muted-foreground/80">ID: {student.schoolId}</p>
              )}
            </div>
            <Badge variant="outline" className="text-[10px] font-bold bg-card border-border shrink-0">
              {assessment.subject}
            </Badge>
          </div>

          {/* Score Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manualScoreInput" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Score (Out of {assessment.maxScore} pts) <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Passing Cutoff: <strong>{assessment.passingScore} pts</strong> ({assessment.passingRate}%)
              </span>
            </div>

            <Input
              id="manualScoreInput"
              type="number"
              min={0}
              max={assessment.maxScore}
              step="any"
              placeholder={`Enter score (0 - ${assessment.maxScore})...`}
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              className="text-base font-black h-11"
              autoFocus
              required
            />
          </div>

          {/* Live Score Preview */}
          {isValidNumber && (
            <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  Percentage & Result
                </p>
                <p className="text-sm font-black text-foreground mt-0.5">
                  {percentage?.toFixed(1)}%
                </p>
              </div>

              <Badge
                variant="secondary"
                className={`text-xs font-extrabold px-3 py-1 ${
                  isPassed
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {isPassed ? "PASSED" : "FAILED"}
              </Badge>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saveScoresMutation.isPending}
              className="text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidNumber || saveScoresMutation.isPending}
              size="sm"
              className="text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {saveScoresMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Score...</span>
                </>
              ) : (
                <>
                  <Award className="size-3.5" />
                  <span>Save Score</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
