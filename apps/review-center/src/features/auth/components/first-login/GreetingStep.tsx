import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, ArrowRight, LogOut, Building2 } from "lucide-react";

interface GreetingStepProps {
  displayName: string;
  companyName?: string;
  onProceed: () => void;
  onLogout: () => void;
}

export const GreetingStep: React.FC<GreetingStepProps> = ({
  displayName,
  companyName,
  onProceed,
  onLogout,
}) => {
  return (
    <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        <div className="size-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
          <Sparkles className="size-8 stroke-[2.2]" />
        </div>
        <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white">
          <ShieldCheck className="size-3.5 stroke-[2.5]" />
        </div>
      </div>

      <div className="space-y-2 max-w-xl">
        <DialogHeader className="p-0 gap-1 text-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Welcome to BoardQuest, {displayName}!
          </DialogTitle>
          {companyName && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
              <Building2 className="size-3.5" />
              <span>{companyName} Partner Representative</span>
            </div>
          )}
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
            We are pleased to welcome you to the BoardQuest Review Center Portal.
            As an authorized partner representative, your account enables
            monitoring candidate cohorts, synchronizing diagnostic and mock
            licensure evaluation results, and managing joint review schedules.
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Process Roadmap Card */}
      <div className="w-full max-w-xl p-4 sm:p-5 rounded-xl border border-border/70 bg-muted/20 text-left space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Required Onboarding Sequence
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">
              1
            </div>
            <div>
              <span className="font-semibold text-foreground block">
                Review Partner Terms & Privacy Compliance
              </span>
              <span className="text-muted-foreground text-[11px]">
                Read and accept the Review Center Partner Terms and Conditions
                and the Data Privacy Act of 2012 (RA 10173).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-[10px]">
              2
            </div>
            <div>
              <span className="font-semibold text-foreground block">
                Set Your Permanent Password
              </span>
              <span className="text-muted-foreground text-[11px]">
                Replace your temporary password issued by the university
                administrator with a secure permanent password to activate your
                account.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-xl space-y-2 pt-2">
        <Button
          type="button"
          onClick={onProceed}
          className="w-full text-xs font-semibold py-2.5 h-auto shadow-sm gap-2"
        >
          <span>Proceed to Terms & Conditions</span>
          <ArrowRight className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onLogout}
          className="w-full text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
        >
          <LogOut className="size-3.5" />
          <span>Log Out & Exit</span>
        </Button>
      </div>
    </div>
  );
};

export default GreetingStep;
