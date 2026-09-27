import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Loader2 } from "lucide-react";

interface PdfGradeSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfHtml: string | null;
  isPdfLoading: boolean;
  onPrintSlip: () => void;
}

export default function PdfGradeSlipDialog({
  open,
  onOpenChange,
  pdfHtml,
  isPdfLoading,
  onPrintSlip,
}: PdfGradeSlipDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={onPrintSlip}
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
              id="admin-slip-preview-iframe"
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
  );
}
