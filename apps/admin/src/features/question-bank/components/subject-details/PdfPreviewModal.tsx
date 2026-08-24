import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getFileNameFromUrl } from "../../services/moduleUploadService";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string | null;
  fileName?: string;
  title?: string;
}

export function PdfPreviewModal({
  isOpen,
  onOpenChange,
  fileUrl,
  fileName,
  title,
}: PdfPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const displayName = fileName || (fileUrl ? getFileNameFromUrl(fileUrl) : "Document.pdf");
  const modalTitle = title || displayName;

  if (!fileUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-[96vw] h-[92vh] max-h-[950px] p-0 gap-0 bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col font-sans text-foreground">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-3.5 border-b border-border bg-card/95 backdrop-blur-sm flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4 flex-1">
            <div className="size-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <FileText size={20} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm font-bold text-foreground truncate max-w-sm sm:max-w-md md:max-w-xl">
                {modalTitle}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <span className="inline-block size-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">PDF Document Preview &bull; {displayName}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-8 shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-border bg-muted/40 hover:bg-muted text-xs font-semibold gap-1.5 cursor-pointer text-foreground"
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open in new window">
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Open in Tab</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl border-border bg-muted/40 hover:bg-muted text-xs font-semibold gap-1.5 cursor-pointer text-foreground"
            >
              <a href={fileUrl} download={displayName} title="Download PDF file">
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body - PDF Iframe Viewer */}
        <div className="relative flex-1 w-full bg-muted/20 overflow-hidden flex items-center justify-center p-2 sm:p-3">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-xs gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-muted-foreground">
                Rendering PDF Preview...
              </p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center max-w-sm">
              <AlertCircle size={40} className="text-destructive stroke-[1.5]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Preview Unavailable</h4>
                <p className="text-xs text-muted-foreground">
                  The PDF could not be rendered directly in the embedded frame. You can open it in a new tab.
                </p>
              </div>
              <Button asChild className="rounded-xl mt-2 text-xs font-bold bg-primary text-primary-foreground">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} className="mr-1.5" /> Open PDF in New Tab
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              title={displayName}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="w-full h-full rounded-2xl border border-border shadow-inner bg-background"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PdfPreviewModal;
