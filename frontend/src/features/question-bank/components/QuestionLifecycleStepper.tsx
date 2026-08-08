import { CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import { QuestionStatus } from "@/types/question";

interface QuestionLifecycleStepperProps {
  status: QuestionStatus | string;
  className?: string;
}

export default function QuestionLifecycleStepper({ status, className = "" }: QuestionLifecycleStepperProps) {
  const steps = [
    {
      id: "DRAFT",
      label: "Draft",
      description: "Author drafting workspace",
      icon: FileText,
    },
    {
      id: "PENDING_REVIEW",
      label: "Pending Review",
      description: "Submitted for verification",
      icon: Clock,
    },
    {
      id: "PENDING_REVISION",
      label: "Pending Revision",
      description: "Comments provided by reviewer",
      icon: AlertCircle,
    },
    {
      id: "APPROVED",
      label: "Approved & Live",
      description: "Available in evaluation pool",
      icon: CheckCircle2,
    },
  ];

  const getStepState = (stepId: string) => {
    if (status === "APPROVED") {
      return stepId === "PENDING_REVISION" ? "skipped" : "completed";
    }
    if (status === "PENDING_REVISION" || status === "NEEDS_REVISION") {
      if (stepId === "DRAFT" || stepId === "PENDING_REVIEW") return "completed";
      if (stepId === "PENDING_REVISION" || stepId === "NEEDS_REVISION") return "active_warning";
      return "upcoming";
    }
    if (status === "PENDING_REVIEW") {
      if (stepId === "DRAFT") return "completed";
      if (stepId === "PENDING_REVIEW") return "active";
      if (stepId === "PENDING_REVISION") return "skipped";
      return "upcoming";
    }
    // DRAFT
    if (stepId === "DRAFT") return "active";
    if (stepId === "PENDING_REVISION") return "skipped";
    return "upcoming";
  };

  return (
    <div className={`w-full bg-card border border-border/80 rounded-xl p-3 px-4 shadow-2xs font-sans ${className}`}>
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {steps.map((step, idx) => {
          const stepState = getStepState(step.id);
          const Icon = step.icon;

          let badgeStyles = "bg-muted/40 text-muted-foreground border-border";
          let lineStyles = "bg-border";

          if (stepState === "completed") {
            badgeStyles = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            lineStyles = "bg-emerald-500/40";
          } else if (stepState === "active") {
            badgeStyles = "bg-primary/10 text-primary border-primary/30 shadow-2xs ring-2 ring-primary/20";
          } else if (stepState === "active_warning") {
            badgeStyles = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-2xs ring-2 ring-amber-500/20";
          }

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-[120px] last:flex-initial">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border transition-all ${badgeStyles}`}>
                  <Icon size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-foreground leading-none">{step.label}</span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className={`hidden sm:block flex-1 h-0.5 mx-2 rounded-full ${lineStyles}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
