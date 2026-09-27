import { Check, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getChoiceText, isChoiceCorrect } from "./fastReviewTypes";

interface FastReviewChoicesSectionProps {
  choicesList: any[];
  choiceImages: string[];
  correctAnswer: string;
}

export default function FastReviewChoicesSection({
  choicesList,
  choiceImages,
  correctAnswer,
}: FastReviewChoicesSectionProps) {
  if (choicesList.length > 0) {
    return (
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Layers size={11} /> Answer Choices &amp; Keys
        </span>

        <div className="flex flex-col gap-2">
          {choicesList.map((opt: any, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const optText = getChoiceText(opt);
            const isCorrect = isChoiceCorrect(opt, idx, correctAnswer);
            const choiceImg = choiceImages[idx];

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-2xs"
                    : "bg-muted/30 border-border/70 text-foreground/90 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </div>

                  <div
                    className={`text-xs sm:text-sm font-medium pt-0.5 leading-normal ${
                      isCorrect
                        ? "font-bold text-emerald-800 dark:text-emerald-300"
                        : ""
                    }`}
                  >
                    {optText}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {choiceImg && (
                    <img
                      src={choiceImg}
                      alt={`Choice ${letter}`}
                      className="h-9 w-9 object-cover rounded-lg border border-border shrink-0"
                    />
                  )}

                  {isCorrect && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md gap-1 shrink-0">
                      <Check size={11} className="stroke-[3]" />
                      Correct Answer
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 pt-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Expected Correct Answer
      </span>
      <div className="p-3.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Check size={14} className="text-emerald-600" />
          <span>{correctAnswer || "Not specified"}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
          Key
        </span>
      </div>
    </div>
  );
}
