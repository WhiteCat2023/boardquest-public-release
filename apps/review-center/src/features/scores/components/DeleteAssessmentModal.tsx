import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentTitle: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function DeleteAssessmentModal({
  open,
  onOpenChange,
  assessmentTitle,
  isLoading = false,
  onConfirm,
}: DeleteAssessmentModalProps) {
  const [typedTitle, setTypedTitle] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // Reset inputs when opened
  useEffect(() => {
    if (open) {
      setTypedTitle("");
      setIsAcknowledged(false);
    }
  }, [open]);

  const isMatch = typedTitle.trim().toLowerCase() === assessmentTitle.trim().toLowerCase();
  const canDelete = isMatch && isAcknowledged && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canDelete) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 font-sans">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="p-3.5 rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-foreground tracking-tight">
              Delete Assessment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              This action is permanent and cannot be reversed.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Warning Alert */}
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 text-destructive py-2.5 px-3">
            <AlertTriangle className="size-4 text-destructive" />
            <AlertTitle className="text-xs font-bold text-destructive">Permanent Data Loss Warning</AlertTitle>
            <AlertDescription className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Deleting this assessment will permanently remove all associated student score records, percentiles, pass/fail results, and historical grade slips.
            </AlertDescription>
          </Alert>

          {/* Type to Confirm */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              To confirm, type <strong className="text-foreground bg-muted px-1.5 py-0.5 rounded border border-border font-bold select-all">{assessmentTitle}</strong> below:
            </Label>
            <Input
              type="text"
              placeholder="Type assessment title to confirm..."
              value={typedTitle}
              onChange={(e) => setTypedTitle(e.target.value)}
              className="text-xs font-semibold"
              autoFocus
            />
          </div>

          {/* Acknowledgment Checkbox */}
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={isAcknowledged}
              onCheckedChange={(checked) => setIsAcknowledged(Boolean(checked))}
              className="mt-0.5 border-border data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
            />
            <span className="text-[11px] font-semibold text-muted-foreground select-none leading-snug">
              I acknowledge that all scores, grades, and analytics for this assessment will be permanently deleted.
            </span>
          </label>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!canDelete}
              className="text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Delete Assessment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
