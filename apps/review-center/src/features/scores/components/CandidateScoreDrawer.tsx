import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Mail,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Percent,
} from "lucide-react";
import { useCandidateScores, useEmailGradeReports } from "../api/useAssessments";
import { MEDTECH_SUBJECT_WEIGHTS } from "../types";
import type { MedTechSubject } from "../types";

interface CandidateScoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string | null;
  onPreviewPdf?: (assessmentId: string, candidateId: string) => void;
}

export function CandidateScoreDrawer({
  open,
  onOpenChange,
  candidateId,
  onPreviewPdf,
}: CandidateScoreDrawerProps) {
  const { data, isLoading } = useCandidateScores(candidateId || undefined);
  const emailMutation = useEmailGradeReports();

  if (!candidateId) return null;

  const candidate = data?.candidate;
  const subjectAverages = data?.subjectAverages || [];
  const simulation = data?.boardExamSimulation;

  const handleSendSingleGradeEmail = (assessmentId: string) => {
    if (!candidateId) return;
    emailMutation.mutate(
      {
        assessmentId,
        candidateIds: [candidateId],
      },
      {
        onSuccess: () => {
          toast.success("Grade report email sent to student!");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to send email.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="size-11 rounded-full border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-black text-base">
                {candidate?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "ST"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <span>{candidate?.name || "Student Transcript"}</span>
                {candidate?.schoolId && (
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {candidate.schoolId}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {candidate?.email} • SY {candidate?.schoolYear}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs">Loading candidate grade history...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* MedTech Board Licensure Rating Simulation Card */}
            {simulation && (
              <div
                className={`p-4 rounded-xl border ${
                  simulation.passed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wide text-foreground">
                        Simulated PRC MedTech Licensure Rating
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Official PRC Board Exam Weights (20/20/20/20/10/10)
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs font-black uppercase px-2.5 py-0.5 ${
                      simulation.passed
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {simulation.passed ? "PASSED (Rating >= 75%)" : "CONDITION / NEEDS REVIEW"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      General Weighted Avg (GWA)
                    </span>
                    <div className="text-xl font-black text-foreground">
                      {simulation.gwa > 0 ? `${simulation.gwa.toFixed(1)}%` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Passing Criteria (75%)
                    </span>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {simulation.gwa >= 75 ? (
                        <span className="text-green-600 font-bold">Met Standard</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Below 75% Cutoff</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Condition Rule (No subj &lt; 50%)
                    </span>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {!simulation.conditionFailed ? (
                        <span className="text-green-600 font-bold">All &ge; 50%</span>
                      ) : (
                        <span className="text-red-500 font-bold">
                          Failed: {simulation.failedSubjects.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subject-by-Subject Performance Cards */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                <span>MedTech Subject Performance & History</span>
              </h4>

              <div className="space-y-3">
                {subjectAverages.map((subj) => {
                  const weight = MEDTECH_SUBJECT_WEIGHTS[subj.subject as MedTechSubject] || 0.1667;
                  const weightPct = (weight * 100).toFixed(0);

                  return (
                    <div
                      key={subj.subject}
                      className="border border-border rounded-xl p-3.5 bg-card/60 space-y-2.5"
                    >
                      {/* Subject Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-extrabold text-foreground flex items-center gap-2">
                            <span>{subj.subject}</span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              PRC: {weightPct}%
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {subj.assessmentsCount} assessment(s) recorded
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-foreground">
                            {subj.averagePercentage !== null ? (
                              <span
                                className={
                                  subj.averagePercentage >= 75
                                    ? "text-green-600"
                                    : subj.averagePercentage >= 50
                                    ? "text-amber-600"
                                    : "text-red-500"
                                }
                              >
                                {subj.averagePercentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No scores</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Itemized Assessment History List */}
                      {subj.scores.length > 0 ? (
                        <div className="border border-border/70 rounded-lg overflow-hidden divide-y divide-border/60">
                          {subj.scores.map((s: any) => (
                            <div
                              key={s.id}
                              className="p-2.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <div className="font-bold text-foreground flex items-center gap-1.5">
                                  <span>{s.assessment?.title}</span>
                                  {s.assessment?.customLabel && (
                                    <Badge variant="outline" className="text-[9px] py-0">
                                      {s.assessment.customLabel}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                  <span>Score: <strong>{s.score ?? "—"} / {s.assessment?.maxScore}</strong></span>
                                  {s.percentile !== null && (
                                    <>
                                      <span>•</span>
                                      <span className="text-primary font-bold">{s.percentile}th Percentile</span>
                                    </>
                                  )}
                                </div>
                                {s.remarks && (
                                  <p className="text-[11px] text-amber-700 dark:text-amber-300 italic mt-1 bg-amber-500/10 px-2 py-0.5 rounded">
                                    "{s.remarks}"
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={s.score === null || s.score === undefined}
                                  onClick={() =>
                                    onPreviewPdf?.(s.assessmentId, candidate?.id || "")
                                  }
                                  title={s.score !== null && s.score !== undefined ? "View PDF Slip" : "Score not recorded"}
                                  className="h-7 text-[11px] font-bold text-primary gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <FileText className="size-3" />
                                  <span>PDF Slip</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={s.score === null || s.score === undefined || emailMutation.isPending}
                                  onClick={() =>
                                    handleSendSingleGradeEmail(s.assessmentId)
                                  }
                                  title={s.score !== null && s.score !== undefined ? "Email Grade Slip" : "Score not recorded"}
                                  className="h-7 text-[11px] font-bold gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Send className="size-3" />
                                  <span>Email</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">
                          No exams recorded yet for this subject.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
