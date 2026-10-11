import { type Question } from "@/types/question";

export type ParaphraseTone =
  | "BOARD_EXAM"
  | "SCENARIO"
  | "CONCISE"
  | "SIMPLIFIED";

export interface ParaphrasedItemState {
  id: string;
  original: string;
  current: string;
  alternatives: string[];
  status: "idle" | "loading" | "paraphrased" | "reverted" | "error";
  isReverted: boolean;
  topic?: string;
  difficulty?: string;
  type?: string;
  variationIndex: number;
}

export interface BulkParaphraseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestions:
    | Question[]
    | Array<{
        id: string;
        question: string;
        topic?: string;
        difficulty?: string;
        type?: string;
        format?: string;
        [key: string]: any;
      }>;
  onSuccess?: () => void;
  onApplyToForm?: (newStem: string) => void;
}
