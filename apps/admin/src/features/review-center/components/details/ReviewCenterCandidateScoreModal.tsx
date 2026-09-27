import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useReviewCenterCandidateScores } from "../../api/useReviewCenter";
import {
  type ReviewCenterCandidateScoreModalProps,
  MEDTECH_SUBJECT_WEIGHTS,
  useCandidateGradeSlip,
  CandidateScoreModalHeader,
  MedtechSimulationCard,
  CandidateSubjectPerformanceList,
  PdfGradeSlipDialog,
} from "./candidate-score-modal";

export type { ReviewCenterCandidateScoreModalProps };
export { MEDTECH_SUBJECT_WEIGHTS };

export default function ReviewCenterCandidateScoreModal({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  candidateSchoolId,
  reviewCenterId,
}: ReviewCenterCandidateScoreModalProps) {
  const { data, isLoading, error, refetch } = useReviewCenterCandidateScores(
    candidateId || undefined,
    reviewCenterId
  );

  const {
    pdfPreviewAssessmentId,
    pdfHtml,
    isPdfLoading,
    isEmailPending,
    handleOpenPdfSlip,
    handleSendSingleGradeEmail,
    handlePrintSlip,
    closePdfPreview,
  } = useCandidateGradeSlip(candidateId);

  if (!candidateId) return null;

  const candidate = data?.candidate;
  const subjectAverages = data?.subjectAverages || [];
  const simulation = data?.boardExamSimulation;
  const hasScores =
    (data?.scores && data.scores.length > 0) ||
    (simulation && (simulation.gwa ?? 0) > 0);

  const displayName = candidate?.name || candidateName || "Student Transcript";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-5 rounded-2xl bg-card border-border font-sans">
          {/* Header */}
          <CandidateScoreModalHeader
            displayName={displayName}
            schoolId={candidate?.schoolId || candidateSchoolId}
            email={candidate?.email}
            schoolYear={candidate?.schoolYear}
            companyName={candidate?.companyName}
          />

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Loading candidate grade history...</span>
            </div>
          ) : error ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3 text-center bg-destructive/10 border border-destructive/20 rounded-xl my-4">
              <AlertCircle className="size-8 text-destructive" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  Failed to load student scores
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(error as any)?.response?.data?.message ||
                    (error as any)?.message ||
                    "Could not retrieve transcript from review center."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8 text-xs font-bold"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* MedTech Board Licensure Rating Simulation Card */}
              {hasScores && simulation && (
                <MedtechSimulationCard simulation={simulation} />
              )}

              {/* Notice when candidate has 0 scores recorded */}
              {!hasScores && (
                <div className="p-4 rounded-xl border border-border/70 bg-muted/30 flex items-start gap-3 my-2">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">
                      No assessment scores recorded yet
                    </p>
                    <p>
                      No exams or mock board assessments have been uploaded yet
                      for this candidate at{" "}
                      {candidate?.companyName || "the review center"}. As soon
                      as scores are recorded, board ratings and subject
                      breakdowns will update here automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Subject-by-Subject Performance Cards */}
              <CandidateSubjectPerformanceList
                subjectAverages={subjectAverages}
                isEmailPending={isEmailPending}
                onOpenPdfSlip={handleOpenPdfSlip}
                onSendEmail={handleSendSingleGradeEmail}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Official PDF Grade Slip Preview Dialog ── */}
      <PdfGradeSlipDialog
        open={Boolean(pdfPreviewAssessmentId)}
        onOpenChange={(open) => !open && closePdfPreview()}
        pdfHtml={pdfHtml}
        isPdfLoading={isPdfLoading}
        onPrintSlip={handlePrintSlip}
      />
    </>
  );
}
