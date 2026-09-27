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
      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
    >
      <ArrowLeft size={14} />
      {from?.includes("/review")
        ? "Back to Review Questions Desk"
        : "Back to Question Bank"}
    </button>
  );
}

export default QuestionBackButton;
