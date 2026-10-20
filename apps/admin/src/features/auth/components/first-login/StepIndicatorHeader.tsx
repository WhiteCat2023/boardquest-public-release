import React from "react";
import { Badge } from "@/components/ui/badge";

export type FirstLoginStep = "greeting" | "terms" | "password";

interface StepIndicatorHeaderProps {
  userRole: string;
  step: FirstLoginStep;
}

export const StepIndicatorHeader: React.FC<StepIndicatorHeaderProps> = ({
  userRole,
  step,
}) => {
  return (
    <div className="relative px-6 py-4 border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-primary/5 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs uppercase font-semibold tracking-wider text-primary border-primary/30 bg-primary/10"
          >
            {userRole}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Initial Account Setup
          </span>
        </div>

        {/* Sequence Dots */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span
            className={`inline-block size-2 rounded-full transition-colors ${
              step === "greeting" ? "bg-primary" : "bg-primary/40"
            }`}
          />
          <span
            className={`inline-block size-2 rounded-full transition-colors ${
              step === "terms" ? "bg-primary" : "bg-muted"
            }`}
          />
          <span
            className={`inline-block size-2 rounded-full transition-colors ${
              step === "password" ? "bg-primary" : "bg-muted"
            }`}
          />
          <span className="ml-1 text-[11px] font-semibold text-foreground">
            {step === "greeting"
              ? "1. Welcome"
              : step === "terms"
                ? "2. Terms & Privacy"
                : "3. Password Setup"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepIndicatorHeader;
