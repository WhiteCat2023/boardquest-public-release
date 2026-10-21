import React from "react";
import { ArrowLeft } from "lucide-react";

interface QuestionBackButtonProps {
  from?: string | null;
  onBack: () => void;
}

export function QuestionBackButton({ from, onBack }: QuestionBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit group"
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>Back</span>
    </button>
  );
}

export default QuestionBackButton;
