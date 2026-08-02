import { toast } from "sonner";

interface QualityCheckInput {
  questionWording: string;
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | string;
  mcqChoices: string[];
  mcqCorrectIndex: number;
  tfCorrect: string;
  saCorrectAnswer: string;
  categoryId: string;
}

export function useQuestionQualityCheck() {
  const validateQuestionQuality = (input: QualityCheckInput): boolean => {
    const { questionWording, format, mcqChoices, mcqCorrectIndex, tfCorrect, saCorrectAnswer, categoryId } = input;

    if (!questionWording || questionWording.trim().length < 10) {
      toast.error("Quality Check: Question wording must be at least 10 characters long.");
      return false;
    }

    if (!categoryId) {
      toast.error("Quality Check: Please select an academic subject category.");
      return false;
    }

    if (format === "MCQ") {
      if (mcqChoices.length < 2) {
        toast.error("Quality Check: MCQ format requires at least 2 option choices.");
        return false;
      }
      const trimmedChoices = mcqChoices.map((c) => c.trim());
      if (trimmedChoices.some((c) => !c)) {
        toast.error("Quality Check: Please fill in all multiple choice options.");
        return false;
      }
      const lowerChoices = trimmedChoices.map((c) => c.toLowerCase());
      const hasDuplicates = new Set(lowerChoices).size !== lowerChoices.length;
      if (hasDuplicates) {
        toast.error("Quality Check: Multiple choice options cannot contain duplicate wording.");
        return false;
      }
      if (mcqCorrectIndex < 0 || mcqCorrectIndex >= mcqChoices.length) {
        toast.error("Quality Check: Please designate a valid correct answer key option.");
        return false;
      }
    } else if (format === "TRUE_FALSE") {
      if (!tfCorrect) {
        toast.error("Quality Check: Please specify True or False as the answer key.");
        return false;
      }
    } else if (format === "SHORT_ANSWER") {
      if (!saCorrectAnswer || !saCorrectAnswer.trim()) {
        toast.error("Quality Check: Please provide an expected short answer key.");
        return false;
      }
    }

    return true;
  };

  return { validateQuestionQuality };
}
