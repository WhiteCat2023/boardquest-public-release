export interface ExtractedQuestionItem {
  question: string;
  choices?: string[] | string;
  correctAnswer: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | string;
  type?: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | string;
  feedback?: string;
  categoryId?: string;
}

export interface ExtractedQuestionAccordionRowProps {
  index: number;
  question: ExtractedQuestionItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateQuestion: (updated: ExtractedQuestionItem) => void;
  onDelete: () => void;
}

export const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function normalizeChoices(choices: any): string[] {
  if (Array.isArray(choices)) {
    return choices.map((c) => String(c).trim()).filter(Boolean);
  }
  if (typeof choices === "string") {
    return choices
      .split(/[|;]/)
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}
