import { BookOpen } from "lucide-react";
import CandidateSubjectCard from "./CandidateSubjectCard";

interface CandidateSubjectPerformanceListProps {
  subjectAverages: Array<{
    subject: string;
    assessmentsCount: number;
    averagePercentage: number | null;
    scores?: any[];
  }>;
  isEmailPending: boolean;
  onOpenPdfSlip: (assessmentId: string, candidateId?: string) => void;
  onSendEmail: (assessmentId: string, candidateId?: string) => void;
}

export default function CandidateSubjectPerformanceList({
  subjectAverages,
  isEmailPending,
  onOpenPdfSlip,
  onSendEmail,
}: CandidateSubjectPerformanceListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <BookOpen className="size-3.5" />
        <span>MedTech Subject Performance &amp; History</span>
      </h4>

      <div className="space-y-3">
        {subjectAverages.map((subj) => (
          <CandidateSubjectCard
            key={subj.subject}
            subject={subj}
            isEmailPending={isEmailPending}
            onOpenPdfSlip={onOpenPdfSlip}
            onSendEmail={onSendEmail}
          />
        ))}
      </div>
    </div>
  );
}
