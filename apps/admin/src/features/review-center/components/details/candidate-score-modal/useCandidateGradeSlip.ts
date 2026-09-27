import { useState } from "react";
import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEmailGradeReports } from "../../../api/useReviewCenter";

export function useCandidateGradeSlip(defaultCandidateId: string | null) {
  const axiosPrivate = useAxiosPrivate();
  const emailMutation = useEmailGradeReports();

  const [pdfPreviewAssessmentId, setPdfPreviewAssessmentId] = useState<
    string | null
  >(null);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleOpenPdfSlip = async (
    assessmentId: string,
    specificCandidateId?: string
  ) => {
    const targetId = specificCandidateId || defaultCandidateId;
    if (!targetId) return;

    try {
      setPdfPreviewAssessmentId(assessmentId);
      setIsPdfLoading(true);
      const url = `/review-center/assessments/${assessmentId}/preview-report/${targetId}`;
      const res = await axiosPrivate.get(url);
      setPdfHtml(res.data?.data?.html || null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load grade slip preview."
      );
      setPdfPreviewAssessmentId(null);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSendSingleGradeEmail = (
    assessmentId: string,
    specificCandidateId?: string
  ) => {
    const targetId = specificCandidateId || defaultCandidateId;
    if (!targetId) return;

    emailMutation.mutate(
      {
        assessmentId,
        candidateIds: [targetId],
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

  const handlePrintSlip = () => {
    const iframe = document.getElementById(
      "admin-slip-preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const closePdfPreview = () => {
    setPdfPreviewAssessmentId(null);
    setPdfHtml(null);
  };

  return {
    pdfPreviewAssessmentId,
    pdfHtml,
    isPdfLoading,
    isEmailPending: emailMutation.isPending,
    handleOpenPdfSlip,
    handleSendSingleGradeEmail,
    handlePrintSlip,
    closePdfPreview,
  };
}
