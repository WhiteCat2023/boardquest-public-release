import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Printer,
  Download,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import rcAxios from "@/lib/axios";
import { useEmailGradeReports } from "../api/useAssessments";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string | null;
  candidateId?: string | null;
}

export function PdfPreviewModal({
  open,
  onOpenChange,
  assessmentId,
  candidateId,
}: PdfPreviewModalProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const emailMutation = useEmailGradeReports();

  useEffect(() => {
    if (open && assessmentId) {
      setIsLoading(true);
      const url = candidateId
        ? `/assessments/${assessmentId}/preview-report/${candidateId}`
        : `/assessments/${assessmentId}/preview-report`;

      rcAxios
        .get(url)
        .then((res) => {
          setHtmlContent(res.data?.data?.html || null);
        })
        .catch((err) => {
          toast.error("Failed to generate PDF grade slip preview.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, assessmentId, candidateId]);

  const handlePrint = () => {
    if (!htmlContent) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleEmailReport = () => {
    if (!assessmentId) return;
    emailMutation.mutate(
      {
        assessmentId,
        candidateIds: candidateId ? [candidateId] : undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Email dispatched successfully! (${res?.sentCount || 1} sent)`
          );
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to send email.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[840px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-foreground">
                  Official Grade Slip Preview (PDF Format)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Review Center branded report with Mean, Median, Mode, and Percentile Rank
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isLoading || !htmlContent}
                className="text-xs font-bold gap-1.5"
              >
                <Printer className="size-3.5" />
                <span>Print / Save PDF</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleEmailReport}
                disabled={isLoading || emailMutation.isPending}
                className="text-xs font-bold gap-1.5"
              >
                {emailMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>Email to Student</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 bg-muted/40 flex justify-center">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Rendering grade slip...</span>
            </div>
          ) : htmlContent ? (
            <div
              className="w-full bg-white shadow-md rounded-xl overflow-hidden"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="p-12 text-center max-w-sm mx-auto space-y-2">
              <div className="p-3 bg-muted w-fit mx-auto rounded-full text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Scores Available</h4>
              <p className="text-xs text-muted-foreground">
                No scores have been uploaded for this assessment yet. Upload scores to enable official PDF grade slips.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
