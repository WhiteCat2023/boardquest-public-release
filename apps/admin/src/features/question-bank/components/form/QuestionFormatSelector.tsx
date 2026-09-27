import React from "react";
import { Label } from "@/components/ui/label";
import CardButton from "../buttons/CardButton";

export type QuestionFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

interface QuestionFormatSelectorProps {
  format: QuestionFormat;
  onFormatChange: (format: QuestionFormat) => void;
}

const QuestionFormatOptions: {
  value: QuestionFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "MCQ",
    label: "MCQ",
    description: "Multiple Options",
  },
  {
    value: "TRUE_FALSE",
    label: "True/False",
    description: "Binary Key",
  },
  {
    value: "SHORT_ANSWER",
    label: "Short Answer",
    description: "Descriptive Wording",
  },
];

export function QuestionFormatSelector({
  format,
  onFormatChange,
}: QuestionFormatSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
        Question Format
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {QuestionFormatOptions.map((opt) => (
          <CardButton
            key={opt.value}
            title={opt.label}
            description={opt.description}
            selected={format === opt.value}
            onClick={() => onFormatChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionFormatSelector;
