import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, Tag, BookOpen, Calendar, Award } from "lucide-react";
import { useCreateAssessment } from "../api/useAssessments";
import { MEDTECH_SUBJECTS } from "../types";
import type { MedTechSubject } from "../types";
import { LabelCombobox } from "./LabelCombobox";

interface CreateAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSchoolYear?: string;
  defaultSubject?: MedTechSubject;
  availableSchoolYears?: string[];
  onCreated?: (assessmentId: string) => void;
}

const PRESET_LABELS = [
  "Mock Board",
  "Diagnostic Exam",
  "Quiz 1",
  "Quiz 2",
  "Quiz 3",
  "Prelim Exam",
  "Midterm Exam",
  "Pre-Board",
  "Subject Grade",
];

export function CreateAssessmentModal({
  open,
  onOpenChange,
  defaultSchoolYear = "2026-2027",
  defaultSubject = "Clinical Chemistry",
  availableSchoolYears = [],
  onCreated,
}: CreateAssessmentModalProps) {
  const [title, setTitle] = useState("");
  const [customLabel, setCustomLabel] = useState("Mock Board");
  const [subject, setSubject] = useState<MedTechSubject>(defaultSubject);
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear);
  const [maxScore, setMaxScore] = useState("100");
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Keep schoolYear & subject in sync with the active filter on open
  useEffect(() => {
    if (open) {
      setSchoolYear(defaultSchoolYear);
      if (defaultSubject) {
        setSubject(defaultSubject);
      }
    }
  }, [open, defaultSchoolYear, defaultSubject]);

  const schoolYearsList = useMemo(() => {
    return Array.from(
      new Set([
        defaultSchoolYear,
        ...(availableSchoolYears || []),
        "2026-2027",
        "2025-2026",
        "2024-2025",
      ])
    ).sort((a, b) => b.localeCompare(a));
  }, [defaultSchoolYear, availableSchoolYears]);

  const createMutation = useCreateAssessment();

  const numMaxScore = Number(maxScore) || 100;
  const numPassingRate = 75;
  const computedPassingScore = ((numMaxScore * 75) / 100).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an assessment title.");
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        customLabel: customLabel.trim() || undefined,
        subject,
        schoolYear,
        maxScore: numMaxScore,
        passingRate: 75,
        assessmentDate: assessmentDate || undefined,
        isPublished: false,
      },
      {
        onSuccess: (assessment) => {
          toast.success(`Assessment "${assessment.title}" created successfully!`);
          onOpenChange(false);
          setTitle("");
          onCreated?.(assessment.id);
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to create assessment."
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                Create New Assessment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record quizzes, mock board exams, or subject grades for MedTech candidates.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Assessment Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assessment Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Diagnostic Mock Board Exam 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
              required
            />
          </div>

          {/* Subject (Strict MedTech) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              <span>Medical Technology Subject</span>
            </Label>
            <Select value={subject} onValueChange={(val) => setSubject(val as MedTechSubject)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select MedTech Subject" />
              </SelectTrigger>
              <SelectContent>
                {MEDTECH_SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Label Searchable Dropdown Combobox */}
          <div className="space-y-1.5">
            <Label htmlFor="customLabel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              <span>Custom Label / Type</span>
            </Label>
            <LabelCombobox
              value={customLabel}
              onChange={setCustomLabel}
              presetLabels={PRESET_LABELS}
            />
          </div>

          {/* School Year (Dynamic Dropdown) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>School Year</span>
            </Label>
            <Select value={schoolYear} onValueChange={setSchoolYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select School Year" />
              </SelectTrigger>
              <SelectContent>
                {schoolYearsList.map((sy) => (
                  <SelectItem key={sy} value={sy}>
                    {sy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scoring parameters */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxScore" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Max Score (Points) <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Fixed 75% Passing Rate
                </span>
              </div>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="font-semibold"
                required
              />
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/60 pt-2">
              <span>Required to Pass (75% PRC Benchmark):</span>
              <span className="font-bold text-foreground">
                {computedPassingScore} / {numMaxScore} points (75.0%)
              </span>
            </div>
          </div>

          {/* Assessment Date */}
          <div className="space-y-1.5">
            <Label htmlFor="assessmentDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Assessment Date</span>
            </Label>
            <Input
              id="assessmentDate"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !title.trim()}
              className="font-bold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1.5" />
                  Create Assessment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
