export interface CognitiveLevelMapping {
  level: "LOTS" | "HOTS" | "LOTS / Lower HOTS";
  dbValue: "LOTS" | "HOTS";
  label: string;
  typicalFocus: string;
  badgeClass: string;
  fullTitle: string;
}

/**
 * Standard Difficulty to Cognitive Level Table aligned with BoardQuest specifications:
 * - EASY   -> LOTS: Direct recall of definitions, organisms, reagents, normal values.
 * - MEDIUM -> LOTS / Lower HOTS: Conceptual understanding or single-step formula application.
 * - HARD   -> HOTS: Multi-step clinical vignettes, Levey-Jennings/QC anomalies, discrepancy resolutions.
 */
export const DIFFICULTY_COGNITIVE_TABLE: Record<string, CognitiveLevelMapping> = {
  EASY: {
    level: "LOTS",
    dbValue: "LOTS",
    label: "LOTS",
    typicalFocus:
      "Direct recall of definitions, organisms, reagents, normal values.",
    badgeClass:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    fullTitle: "Lower-Order Thinking Skills",
  },
  MEDIUM: {
    level: "LOTS / Lower HOTS",
    dbValue: "LOTS",
    label: "LOTS / Lower HOTS",
    typicalFocus:
      "Conceptual understanding or single-step formula application.",
    badgeClass:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    fullTitle: "Conceptual & Practical Application",
  },
  HARD: {
    level: "HOTS",
    dbValue: "HOTS",
    label: "HOTS",
    typicalFocus:
      "Multi-step clinical vignettes, Levey-Jennings/QC anomalies, discrepancy resolutions.",
    badgeClass:
      "border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    fullTitle: "Higher-Order Thinking Skills",
  },
};

export function getCognitiveLevelMapping(difficulty?: string): CognitiveLevelMapping {
  const diffKey = (difficulty || "EASY").toUpperCase();
  return DIFFICULTY_COGNITIVE_TABLE[diffKey] || DIFFICULTY_COGNITIVE_TABLE.EASY;
}
