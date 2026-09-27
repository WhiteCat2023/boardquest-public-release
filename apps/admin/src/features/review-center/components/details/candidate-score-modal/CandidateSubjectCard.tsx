import { FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MEDTECH_SUBJECT_WEIGHTS,
  getScorePercentageColor,
} from "./candidateScoreTypes";

interface CandidateSubjectCardProps {
  subject: {
    subject: string;
    assessmentsCount: number;
    averagePercentage: number | null;
    scores?: any[];
  };
  isEmailPending: boolean;
  onOpenPdfSlip: (assessmentId: string, candidateId?: string) => void;
  onSendEmail: (assessmentId: string, candidateId?: string) => void;
}

export default function CandidateSubjectCard({
  subject: subj,
  isEmailPending,
  onOpenPdfSlip,
  onSendEmail,
}: CandidateSubjectCardProps) {
  const weight = MEDTECH_SUBJECT_WEIGHTS[subj.subject] || 0.1667;
  const weightPct = (weight * 100).toFixed(0);

  return (
    <div className="border border-border rounded-xl p-3.5 bg-card/60 space-y-2.5">
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
              <span className={getScorePercentageColor(subj.averagePercentage)}>
                {subj.averagePercentage.toFixed(1)}%
              </span>
            ) : (
              <span className="text-muted-foreground">No scores</span>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Assessment History List */}
      {subj.scores && subj.scores.length > 0 ? (
        <div className="border border-border/70 rounded-lg overflow-hidden divide-y divide-border/60">
          {subj.scores.map((s: any) => {
            const hasScore = s.score !== null && s.score !== undefined;

            return (
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
                    <span>
                      Score:{" "}
                      <strong>
                        {s.score ?? "—"} / {s.assessment?.maxScore}
                      </strong>
                    </span>
                    {s.percentile !== null && s.percentile !== undefined && (
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
                    disabled={!hasScore}
                    onClick={() =>
                      onOpenPdfSlip(s.assessmentId, s.candidateId)
                    }
                    title={
                      hasScore
                        ? "View Official Grade Slip"
                        : "Score not recorded"
                    }
                    className="h-7 text-[11px] font-bold text-primary gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10"
                  >
                    <FileText className="size-3" />
                    <span>PDF Slip</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!hasScore || isEmailPending}
                    onClick={() =>
                      onSendEmail(s.assessmentId, s.candidateId)
                    }
                    title="Email Grade Slip to Student"
                    className="h-7 text-[11px] font-bold text-primary gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/10"
                  >
                    <Send className="size-3" />
                    <span>Email</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">
          No exams recorded yet for this subject.
        </p>
      )}
    </div>
  );
}
