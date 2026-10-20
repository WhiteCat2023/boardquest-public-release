import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { TermsAndPrivacyContent } from "./TermsAndPrivacyContent";

interface TermsStepProps {
  acceptedTerms: boolean;
  onAcceptedTermsChange: (checked: boolean) => void;
  acceptedPrivacy: boolean;
  onAcceptedPrivacyChange: (checked: boolean) => void;
  isSavingTerms: boolean;
  onBack: () => void;
  onAgreeAndContinue: () => void;
}

export const TermsStep: React.FC<TermsStepProps> = ({
  acceptedTerms,
  onAcceptedTermsChange,
  acceptedPrivacy,
  onAcceptedPrivacyChange,
  isSavingTerms,
  onBack,
  onAgreeAndContinue,
}) => {
  return (
    <div className="p-5 sm:p-6 flex flex-col space-y-4 animate-in fade-in duration-200 min-h-0 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <DialogHeader className="p-0 gap-0.5 text-left">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Scale className="size-4 text-primary" />
            Terms & Privacy Compliance
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please review the Terms & Conditions and Data Privacy Act below, and
            check both boxes to continue.
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Scrollable Document Container */}
      <div
        tabIndex={0}
        className="h-[280px] sm:h-[320px] overflow-y-auto rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring text-xs text-foreground/90 leading-relaxed [scrollbar-width:thin]"
      >
        <TermsAndPrivacyContent />
      </div>

      {/* Checkboxes */}
      <div className="space-y-1">
        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
          <Checkbox
            id="accept-terms-check"
            checked={acceptedTerms}
            onCheckedChange={(checked) => onAcceptedTermsChange(checked === true)}
          />
          <div className="text-xs space-y-0.5 leading-normal">
            <span className="text-[11px] text-muted-foreground block">
              I have read, understood, and accept the Terms and Conditions.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
          <Checkbox
            id="accept-privacy-check"
            checked={acceptedPrivacy}
            onCheckedChange={(checked) =>
              onAcceptedPrivacyChange(checked === true)
            }
          />
          <div className="text-xs space-y-0.5 leading-normal">
            <span className="text-[11px] text-muted-foreground block">
              I acknowledge and consent to the Data Privacy Act of 2012 (RA
              10173).
            </span>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back</span>
        </Button>

        <Button
          type="button"
          disabled={!acceptedTerms || !acceptedPrivacy || isSavingTerms}
          onClick={onAgreeAndContinue}
          className="text-xs font-semibold py-2 px-4 shadow-sm gap-2"
        >
          {isSavingTerms ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving Agreement...</span>
            </>
          ) : (
            <>
              <span>Agree & Continue to Password Setup</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TermsStep;
