import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Info,
  XCircle,
} from "lucide-react";

export interface BulkUploadSummaryStat {
  total: number;
  successful: number;
  skipped?: number;
  failed?: number;
}

export interface BulkUploadDetailItem {
  id?: string | number;
  label: string;
  reason?: string;
}

export interface BulkUploadSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  stats: BulkUploadSummaryStat;
  skippedReasonText?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  details?: BulkUploadDetailItem[];
}

export const BulkUploadSummaryModal: React.FC<BulkUploadSummaryModalProps> = ({
  open,
  onOpenChange,
  title = "Upload Summary",
  description,
  stats,
  skippedReasonText = "Existing duplicate records were automatically skipped.",
  primaryAction,
  secondaryAction,
  details,
}) => {
  const { total, successful, skipped = 0, failed = 0 } = stats;
  const isAllSkipped = successful === 0 && skipped > 0;
  const hasSkipped = skipped > 0;
  const hasFailed = failed > 0;

  const defaultDescription = isAllSkipped
    ? "All records in the uploaded spreadsheet already exist in the database and were skipped."
    : hasSkipped || hasFailed
    ? "The file was processed. Some entries were imported, while duplicates or invalid rows were skipped."
    : "All records were successfully imported into the system.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isAllSkipped
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : hasSkipped || hasFailed
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isAllSkipped ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              ) : hasSkipped || hasFailed ? (
                <Info className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description || defaultDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-2">
          {/* Total Processed */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-muted/40 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total
            </span>
            <span className="text-lg font-bold font-mono text-foreground mt-0.5">
              {total}
            </span>
          </div>

          {/* Succeeded */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Added
            </span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {successful}
            </span>
          </div>

          {/* Skipped / Duplicates */}
          <div
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center ${
              skipped > 0
                ? "border-amber-500/25 bg-amber-500/5"
                : "border-border bg-muted/40"
            }`}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                skipped > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Skipped
            </span>
            <span
              className={`text-lg font-bold font-mono mt-0.5 ${
                skipped > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }`}
            >
              {skipped}
            </span>
          </div>
        </div>

        {/* Optional Failed Row if failed > 0 */}
        {failed > 0 && (
          <div className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-destructive/20 bg-destructive/5 text-xs">
            <span className="font-semibold text-destructive flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Invalid / Failed Rows
            </span>
            <span className="font-mono font-bold text-destructive">{failed}</span>
          </div>
        )}

        {/* Explanatory Notice */}
        {hasSkipped && (
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">{skippedReasonText}</p>
          </div>
        )}

        {/* Optional details list if items provided */}
        {details && details.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              Skipped Details ({details.length}):
            </p>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-border p-2 space-y-1.5 text-xs bg-muted/20">
              {details.map((item, idx) => (
                <div
                  key={item.id ?? idx}
                  className="flex items-start justify-between gap-2 py-0.5 text-[11px]"
                >
                  <span className="font-medium text-foreground truncate max-w-[220px]">
                    {item.label}
                  </span>
                  {item.reason && (
                    <span className="text-muted-foreground italic shrink-0">
                      {item.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 sm:justify-end gap-2">
          {secondaryAction && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              className="text-xs"
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={primaryAction.onClick}
            className="text-xs gap-1.5"
          >
            {primaryAction.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
