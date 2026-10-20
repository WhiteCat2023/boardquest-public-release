import { useState } from "react";
import {
  Award,
  BookOpen,
  FileText,
  Printer,
  Loader2,
  Building2,
  Calendar,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showFeedback } from "@/components/modal";
import { useReviewCenterCandidateScores } from "@/features/review-center/api/useReviewCenter";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

interface StudentReviewCenterTabProps {
  student: any;
}

const MEDTECH_SUBJECT_WEIGHTS: Record<string, number> = {
  "Clinical Chemistry": 0.2,
  "Microbiology & Parasitology": 0.2,
  "Hematology": 0.2,
  "Immunology & Serology and Immunohematology": 0.2,
  "Clinical Microscopy & Parasitology": 0.1,
  "Histopathology and Medtech Laws": 0.1,
};

export default function StudentReviewCenterTab({
  student,
}: StudentReviewCenterTabProps) {
  const axiosPrivate = useAxiosPrivate();

  // If student already has reviewCenterTranscript preloaded, use it; otherwise fetch by student ID
  const { data: queryTranscript, isLoading } = useReviewCenterCandidateScores(
    student?.reviewCenterTranscript ? undefined : student?.id,
  );

  const transcript = student?.reviewCenterTranscript || queryTranscript;

  // PDF Preview State
  const [pdfAssessmentId, setPdfAssessmentId] = useState<string | null>(null);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const candidate = transcript?.candidate;
  const subjectAverages = transcript?.subjectAverages || [];
  const simulation = transcript?.boardExamSimulation;

  const gwa =
    simulation?.gwa ?? simulation?.generalWeightedAverage ?? 0;
  const passed = Boolean(simulation?.passed);
  const conditionFailed = Boolean(simulation?.conditionFailed);
  const failedSubjects = simulation?.failedSubjects || [];

  const handleOpenPdfSlip = async (assessmentId: string, specificCandidateId?: string) => {
    const targetId = specificCandidateId || candidate?.id || student?.id;
    if (!targetId) return;
    try {
      setPdfAssessmentId(assessmentId);
      setIsPdfLoading(true);
      const url = `/review-center/assessments/${assessmentId}/preview-report/${targetId}`;
      const res = await axiosPrivate.get(url);
      setPdfHtml(res.data?.data?.html || null);
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to load grade report slip preview.",
      );
      setPdfAssessmentId(null);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handlePrintSlip = () => {
    const iframe = document.getElementById(
      "student-slip-preview-iframe",
    ) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground bg-card border border-border rounded-2xl">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="text-xs">Checking Review Center records & scores...</span>
      </div>
    );
  }

  if (!transcript || !candidate) {
    return (
      <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
          <GraduationCap className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            No Review Center Records Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            This student is not enrolled in a partner review center cohort or no
            assessment scores have been submitted for them yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── 1. Review Center Partner Enrollment Banner ── */}
      <Card className="rounded-2xl border-border bg-card shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {candidate.companyName || "Partner Review Center"}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase"
                >
                  {candidate.status || "Enrolled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Cohort: <strong>S.Y. {candidate.schoolYear}</strong></span>
                {candidate.batch && <span>• {candidate.batch}</span>}
                {candidate.schoolId && <span>• ID: <strong className="font-mono">{candidate.schoolId}</strong></span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Simulated PRC MedTech Licensure Rating ── */}
      {simulation && (
        <div
          className={`p-4 rounded-xl border ${
            passed
              ? "bg-emerald-500/10 border-emerald-500/30"
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
                passed
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {passed
                ? "PASSED (Rating >= 75%)"
                : "CONDITION / NEEDS REVIEW"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                General Weighted Avg (GWA)
              </span>
              <div className="text-xl font-black text-foreground">
                {gwa > 0 ? `${gwa.toFixed(1)}%` : "N/A"}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Passing Criteria (75%)
              </span>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {gwa >= 75 ? (
                  <span className="text-emerald-600 font-bold">
                    Met Standard
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold">
                    Below 75% Cutoff
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Condition Rule (No subj &lt; 50%)
              </span>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {!conditionFailed ? (
                  <span className="text-emerald-600 font-bold">All &ge; 50%</span>
                ) : (
                  <span className="text-destructive font-bold">
                    Failed: {failedSubjects.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MedTech Subject Performance & Assessment History ── */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BookOpen className="size-3.5" />
          <span>MedTech Subject Performance & History</span>
        </h4>

        <div className="space-y-3">
          {subjectAverages.map((subj: any) => {
            const weight =
              MEDTECH_SUBJECT_WEIGHTS[subj.subject] || 0.1667;
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
                              ? "text-emerald-600"
                              : subj.averagePercentage >= 50
                              ? "text-amber-600"
                              : "text-destructive"
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

                {/* Itemized Assessment Scores List */}
                {subj.scores && subj.scores.length > 0 ? (
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
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0"
                              >
                                {s.assessment.customLabel}
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>
                              Score:{" "}
                              <strong>
                                {s.score ?? "—"} / {s.assessment?.maxScore}
                              </strong>
                            </span>
                            {s.percentile !== null &&
                              s.percentile !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary font-bold">
                                    {s.percentile}th Percentile
                                  </span>
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
                              onClick={() => handleOpenPdfSlip(s.assessmentId, s.candidateId)}
                              title={
                                s.score !== null && s.score !== undefined
                                  ? "View Official Grade Slip"
                                  : "Score not recorded"
                              }
                              className="h-7 text-[11px] font-bold text-primary gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10"
                            >
                            <FileText className="size-3" />
                            <span>PDF Slip</span>
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

      {/* ── Official PDF Grade Slip Preview Dialog ── */}
      <Dialog
        open={Boolean(pdfAssessmentId)}
        onOpenChange={(open) => !open && setPdfAssessmentId(null)}
      >
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] flex flex-col p-4 rounded-2xl bg-card border-border font-sans">
          <DialogHeader className="pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Student Grade Report Slip</span>
              </DialogTitle>
              {pdfHtml && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintSlip}
                  className="h-7 text-xs font-bold gap-1 rounded-xl"
                >
                  <Printer className="size-3.5 text-primary" />
                  Print Slip
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-[460px] bg-white rounded-xl overflow-hidden mt-2 border border-border">
            {isPdfLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground p-12">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs">Generating grade report slip...</span>
              </div>
            ) : pdfHtml ? (
              <iframe
                id="student-slip-preview-iframe"
                srcDoc={pdfHtml}
                title="Grade Slip Preview"
                className="w-full h-full min-h-[460px] border-0"
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-xs text-muted-foreground">
                Unable to render grade slip preview.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
