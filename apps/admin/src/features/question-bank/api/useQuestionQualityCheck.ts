import { showFeedback } from "@/components/modal";

interface QualityCheckInput {
  questionWording: string;
  format: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | string;
  mcqChoices: string[];
  mcqChoiceImages?: string[];
  mcqCorrectIndex: number;
  tfCorrect: string;
  saCorrectAnswer: string;
  categoryId: string;
}

export function useQuestionQualityCheck() {
  const validateQuestionQuality = (input: QualityCheckInput): boolean => {
    const {
      questionWording,
      format,
      mcqChoices,
      mcqChoiceImages = [],
      mcqCorrectIndex,
      tfCorrect,
      saCorrectAnswer,
      categoryId,
    } = input;

    if (!questionWording || questionWording.trim().length < 5) {
      showFeedback.error(
        "Quality Check: Question wording must be at least 5 characters long.",
      );
      return false;
    }

    if (!categoryId) {
      showFeedback.error("Quality Check: Please select an academic subject category.");
      return false;
    }

    if (format === "MCQ") {
      if (mcqChoices.length < 2) {
        showFeedback.error(
          "Quality Check: MCQ format requires at least 2 option choices.",
        );
        return false;
      }
      
      // Each option must have either text OR an image
      for (let i = 0; i < mcqChoices.length; i++) {
        const text = (mcqChoices[i] || "").trim();
        const img = (mcqChoiceImages[i] || "").trim();
        if (!text && !img) {
          showFeedback.error(
            `Quality Check: Option ${String.fromCharCode(65 + i)} requires wording or an attached image.`,
          );
          return false;
        }
      }

      // Check duplicate text wording only for options that have non-empty text
      const textChoices = mcqChoices
        .map((c) => c.trim().toLowerCase())
        .filter((c) => c.length > 0);
      const hasDuplicates = new Set(textChoices).size !== textChoices.length;
      if (hasDuplicates) {
        showFeedback.error(
          "Quality Check: Multiple choice options cannot contain duplicate text wording.",
        );
        return false;
      }

      if (mcqCorrectIndex < 0 || mcqCorrectIndex >= mcqChoices.length) {
        showFeedback.error(
          "Quality Check: Please designate a valid correct answer key option.",
        );
        return false;
      }
    } else if (format === "TRUE_FALSE") {
      if (!tfCorrect) {
        showFeedback.error(
          "Quality Check: Please specify True or False as the answer key.",
        );
        return false;
      }
    } else if (format === "SHORT_ANSWER") {
      if (!saCorrectAnswer || !saCorrectAnswer.trim()) {
        showFeedback.error(
          "Quality Check: Please provide an expected short answer key.",
        );
        return false;
      }
    }

    return true;
  };

  return { validateQuestionQuality };
}
