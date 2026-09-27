import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuestionInput from "../QuestionInput";

interface QuestionStemSectionProps {
  questionWording: string;
  setQuestionWording: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  isNotOriginalQuestion: boolean;
  onRestoreOriginal: () => void;
}

export function QuestionStemSection({
  questionWording,
  setQuestionWording,
  imageUrl,
  setImageUrl,
  isNotOriginalQuestion,
  onRestoreOriginal,
}: QuestionStemSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      {isNotOriginalQuestion && (
        <div className="flex items-center justify-between pb-1 animate-in fade-in duration-200">
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <RotateCcw size={10} /> AI Paraphrased Wording Active
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRestoreOriginal}
            className="text-[10px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer h-5 px-2 rounded-md flex items-center gap-1 shadow-2xs"
          >
            <RotateCcw size={11} />
            Use Original Question
          </Button>
        </div>
      )}
      <QuestionInput
        questionWording={questionWording}
        setQuestionWording={setQuestionWording}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
      />
    </div>
  );
}

export default QuestionStemSection;
